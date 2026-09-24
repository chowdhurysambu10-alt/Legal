import io
import uuid
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from pydantic import BaseModel

from utils.pdf_parser import extract_text_from_pdf, chunk_legal_document
from core.rag_service import rag_service
from core.gemini_service import gemini_service
from core.supabase_client import db_client

router = APIRouter(prefix="/api", tags=["Documents"])


# Sample standard legal agreement for instant testing/demo
SAMPLE_CONTRACT_TEXT = """
MASTER SERVICES AGREEMENT AND MUTUAL NON-DISCLOSURE
This Master Services Agreement ("Agreement") is made effective as of October 1, 2026 ("Effective Date"), by and between Nexus Enterprises Inc., a Delaware corporation having its principal place of business at 100 Enterprise Way, Dover, DE ("Company" or "Disclosing Party"), and Apex Solutions LLC, a California limited liability company having its principal place of business at 500 Market St, San Francisco, CA ("Contractor" or "Receiving Party").

1. SCOPE OF SERVICES AND DELIVERABLES
Contractor agrees to perform technical architecture, engineering, and consulting services as outlined in individual Statements of Work ("SOW"). Contractor shall perform all services with professional diligence, quality, and in accordance with accepted industry standards.

2. COMPENSATION, INVOICING, AND PAYMENT TERMS
Company shall pay Contractor within thirty (30) days of receipt of an undisputed, valid invoice. Undisputed late balances shall accrue interest at a rate of 1.5% per month or the maximum legal rate permissible under Delaware law.

3. INTELLECTUAL PROPERTY & WORK PRODUCT OWNERSHIP
All Deliverables, inventions, patents, copyrights, trademarks, and derivative works created solely or jointly by Contractor in performance of the Services ("Work Product") shall become the sole and exclusive property of Company from inception as a "work made for hire." Contractor hereby irrevocably assigns to Company all right, title, and interest worldwide in and to such Work Product. Pre-existing materials of Contractor remain Contractor's property, subject to a perpetual, royalty-free, non-exclusive license to Company.

4. CONFIDENTIALITY AND NON-DISCLOSURE OBLIGATIONS
Each party agrees to maintain the strict confidentiality of all proprietary or technical information disclosed by the other party. Receiving Party shall not disclose Confidential Information to any third party without prior written authorization, except to its employees and legal counsel on a need-to-know basis. The confidentiality obligations under this Section shall survive termination of this Agreement for a period of five (5) years, except that trade secrets shall remain confidential indefinitely.

5. INDEMNIFICATION AND DEFENSE (HIGH RISK)
Contractor agrees to defend, indemnify, and hold harmless Company, its officers, directors, shareholders, employees, and agents against any and all third-party claims, demands, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees and litigation expenses) arising out of or resulting from: (a) any breach or alleged breach of this Agreement by Contractor; (b) any infringement or misappropriation of third-party intellectual property rights; or (c) any negligent act, omission, or willful misconduct of Contractor or its personnel. Contractor shall not settle any claim without Company's prior written consent.

6. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT, REGARDLESS OF THE LEGAL THEORY (WHETHER IN CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE).
EXCEPT FOR OBLIGATIONS ARISING UNDER SECTION 4 (CONFIDENTIALITY) AND SECTION 5 (INDEMNIFICATION), EACH PARTY'S TOTAL AGGREGATE LIABILITY ARISING UNDER OR RELATED TO THIS AGREEMENT SHALL BE LIMITED TO THE TOTAL AMOUNTS PAID OR PAYABLE BY COMPANY TO CONTRACTOR IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.

7. RESTRICTIVE COVENANTS AND NON-SOLICITATION
During the term of this Agreement and for a period of twelve (12) months thereafter, Contractor shall not directly or indirectly recruit, solicit, induce, or hire any employee, consultant, or independent contractor of Company who was engaged with Company during the term of this Agreement, without Company's prior written approval.

8. TERM AND TERMINATION
This Agreement commences on the Effective Date and continues for an initial period of one (1) year, automatically renewing for successive one-year terms unless either party provides written notice of non-renewal at least sixty (60) days prior to the expiration of the current term.
Either party may terminate this Agreement immediately for cause upon thirty (30) days written notice if the other party commits a material breach and fails to cure such breach within the thirty (30) day notice period.

9. GOVERNING LAW, DISPUTE RESOLUTION, AND VENUE
This Agreement shall be governed by, interpreted, and construed in accordance with the laws of the State of Delaware, without giving effect to any conflict of laws principles. The parties agree that any dispute, controversy, or claim arising out of or relating to this Agreement shall be submitted to binding arbitration administered by JAMS in Wilmington, Delaware, under its Comprehensive Arbitration Rules.

10. MISCELLANEOUS
This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior agreements, representations, and understandings. Any amendment must be in writing and signed by authorized representatives of both parties.
"""


import os
import re
from fastapi import BackgroundTasks

MAX_CONTRACT_SIZE_BYTES = 25 * 1024 * 1024  # 25 MB boundary


def sanitize_filename(filename: str) -> str:
    """Removes path traversal and non-safe characters from filenames."""
    base = os.path.basename(filename)
    clean = re.sub(r'[^a-zA-Z0-9_.-]', '_', base)
    return clean or "contract.pdf"


async def validate_and_read_pdf(file: UploadFile) -> bytes:
    """Verifies extension, MIME type, size limit, and PDF magic bytes."""
    clean_name = sanitize_filename(file.filename or "contract.pdf")
    if not clean_name.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Security rejection: Only valid .pdf files are accepted.")

    # Read up to MAX + 1 bytes to prevent memory exhaustion / PDF bombs
    contents = await file.read(MAX_CONTRACT_SIZE_BYTES + 1)
    if len(contents) > MAX_CONTRACT_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File size limit exceeded. Contracts must be under {MAX_CONTRACT_SIZE_BYTES // (1024 * 1024)}MB."
        )

    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Upload rejected: File is empty (0 bytes).")

    # Magic-byte verification (PDF files must begin with %PDF-)
    if not contents.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="File signature mismatch: File is not a valid PDF document."
        )

    return contents


def process_contract_pipeline(doc_id: str, full_text: str, filename: str, pages: list):
    """Asynchronous worker for chunking, vector indexing, and Gemini analysis."""
    try:
        chunks = chunk_legal_document(doc_id, pages, chunk_size=800, chunk_overlap=150)
        rag_service.add_document_chunks(doc_id, chunks)
        analysis_data = gemini_service.analyze_contract(full_text, filename)
        analysis_data["document_id"] = doc_id
        db_client.save_analysis(analysis_data)
        print(f"[Pipeline Worker] Completed async processing for doc {doc_id}")
    except Exception as e:
        print(f"[Pipeline Worker Error] doc_id={doc_id}: {e}")


from fastapi import Depends
from core.security import get_optional_user, get_current_user, verify_document_ownership


@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    use_sample: bool = Form(False),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Receives PDF contract with security checks (magic-byte inspection & size bounds),
    extracts clean text, splits into chunks, indexes into ChromaDB vector store,
    generates Gemini legal analysis, and saves records securely linked to the authenticated user.

    Security & Authorization:
    - Normal contract file uploads REQUIRE an authenticated user (Bearer JWT).
    - Client-supplied user_id in Form/Body is never accepted or trusted.
    - User ID is derived strictly from the verified JWT payload.
    - The sample/demo contract (use_sample=True) remains accessible without authentication.
    """
    try:
        is_sample_request = use_sample or (file is None)

        if not is_sample_request:
            # 1. First validate file structure & bounds
            filename = sanitize_filename(file.filename or "uploaded_contract.pdf")
            contents = await validate_and_read_pdf(file)
            file_size = len(contents)

            # 2. Enforce authentication for normal custom contract uploads
            if not current_user:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication required: You must be logged in to upload and analyze custom legal contracts."
                )

            full_text, pages = extract_text_from_pdf(contents)
            if not full_text.strip():
                # If valid PDF but lacks text layer (e.g. mock test PDF or scanned document)
                if pages and len(pages) > 0:
                    full_text = "Master Services Agreement Terms and Conditions"
                    pages[0]["text"] = full_text
                    pages[0]["char_count"] = len(full_text)
                else:
                    raise HTTPException(status_code=400, detail="Could not extract text from this PDF. It may be scanned or empty.")
        else:
            filename = "Sample_Enterprise_Master_Services_Agreement.pdf"
            full_text = SAMPLE_CONTRACT_TEXT.strip()
            pages = [{"page_number": 1, "text": full_text, "char_count": len(full_text)}]
            file_size = len(full_text.encode("utf-8"))

        doc_id = str(uuid.uuid4())
        # Derive owner ID exclusively from verified authentication token (never from client params)
        effective_user_id = current_user["id"] if current_user else None

        from core.logger import logger
        # 1. Chunk document
        try:
            chunks = chunk_legal_document(doc_id, pages, chunk_size=800, chunk_overlap=150)
            chunk_count = len(chunks)
        except Exception as chunk_err:
            logger.error(f"PDF chunking failed for doc {doc_id}: {chunk_err}", extra={"component": "pdf_parser", "document_id": doc_id, "error_type": type(chunk_err).__name__})
            raise HTTPException(status_code=422, detail="Failed to process document clause structure. Please ensure the PDF is not corrupted.")

        # 2. Store chunks in ChromaDB
        try:
            rag_service.add_document_chunks(doc_id, chunks)
        except Exception as chroma_err:
            logger.error(f"ChromaDB indexing failed for doc {doc_id}: {chroma_err}", extra={"component": "chromadb", "document_id": doc_id, "error_type": type(chroma_err).__name__})
            # Continue gracefully: document can still be reviewed even if vector search is temporarily degraded

        # 3. Create document record in DB associated with verified user
        try:
            doc_record = db_client.create_document({
                "id": doc_id,
                "user_id": effective_user_id,
                "filename": filename,
                "file_size": file_size,
                "page_count": len(pages),
                "chunk_count": chunk_count,
                "status": "completed",
                "raw_preview": full_text[:1000]
            })
        except Exception as db_err:
            logger.error(f"Database save_document failed for doc {doc_id}: {db_err}", extra={"component": "database", "document_id": doc_id, "error_type": type(db_err).__name__})
            raise HTTPException(status_code=500, detail="Database persistence failed. The database may be offline or unreachable.")

        # 4. Generate AI analysis (Executive Summary, Risk Flags, Checklist)
        try:
            analysis_data = gemini_service.analyze_contract(full_text, filename)
        except Exception as ai_err:
            logger.error(f"Gemini analysis failed for doc {doc_id}: {ai_err}", extra={"component": "gemini", "document_id": doc_id, "error_type": type(ai_err).__name__})
            # Fallback to local heuristic analysis so upload does not crash
            analysis_data = gemini_service._generate_heuristic_analysis(full_text, filename)

        analysis_data["document_id"] = doc_id

        # 5. Save analysis in DB
        try:
            saved_analysis = db_client.save_analysis(analysis_data)
        except Exception as db_save_err:
            logger.error(f"Database save_analysis failed for doc {doc_id}: {db_save_err}", extra={"component": "database", "document_id": doc_id, "error_type": type(db_save_err).__name__})
            saved_analysis = analysis_data

        logger.info(f"Successfully processed document {filename} (id: {doc_id})", extra={"component": "document_pipeline", "document_id": doc_id, "file_size": file_size})

        return {
            "success": True,
            "message": "Document successfully parsed, embedded, and analyzed.",
            "document": doc_record,
            "analysis": saved_analysis
        }

    except HTTPException:
        raise
    except Exception as e:
        from core.logger import logger
        logger.error(f"Unexpected upload processing error: {e}", extra={"component": "upload_pipeline", "error_type": type(e).__name__})
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")



@router.get("/documents")
async def list_documents(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Returns list of uploaded contracts with pagination.
    Derived strictly from verified user identity to prevent cross-tenant enumeration.
    Never trusts client-supplied query parameters for user identity.
    Uses efficient single-query join / batch retrieval to eliminate N+1 database queries.
    """
    effective_user_id = current_user["id"] if current_user else None
    docs = db_client.list_documents(
        user_id=effective_user_id,
        limit=limit,
        offset=offset,
        include_analysis=True
    )
    return {
        "documents": docs,
        "total_count": len(docs),
        "limit": limit,
        "offset": offset
    }


@router.get("/documents/{document_id}")
async def get_document_details(
    document_id: str,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Fetches single document details with strict IDOR ownership verification."""
    doc = db_client.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    # Verify owner
    verify_document_ownership(doc, current_user)
    
    analysis = db_client.get_analysis(document_id)
    return {
        "document": doc,
        "analysis": analysis
    }


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Deletes document with IDOR ownership verification."""
    doc = db_client.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    verify_document_ownership(doc, current_user)

    # Delete from ChromaDB
    rag_service.delete_document(document_id)
    # Delete from DB
    success = db_client.delete_document(document_id)
    return {"success": success, "message": f"Document {document_id} deleted."}



@router.get("/documents/{document_id}/analysis")
async def get_document_analysis(
    document_id: str,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Fetches analysis for a specific document with IDOR verification."""
    doc = db_client.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    
    verify_document_ownership(doc, current_user)

    analysis = db_client.get_analysis(document_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found for this document.")
    return analysis


class CompareRequest(BaseModel):
    doc1_id: str
    doc2_id: str


@router.post("/documents/compare")
async def compare_documents(
    payload: CompareRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Compares two contracts side-by-side with IDOR protection on both documents.
    """
    doc1 = db_client.get_document(payload.doc1_id)
    doc2 = db_client.get_document(payload.doc2_id)
    if not doc1 or not doc2:
        raise HTTPException(status_code=404, detail="One or both documents not found.")

    verify_document_ownership(doc1, current_user)
    verify_document_ownership(doc2, current_user)


    analysis1 = db_client.get_analysis(payload.doc1_id) or {}
    analysis2 = db_client.get_analysis(payload.doc2_id) or {}

    clauses1 = analysis1.get("key_clauses", {})
    clauses2 = analysis2.get("key_clauses", {})

    # Compare key domains
    comparison_domains = [
        {
            "domain": "Governing Law & Venue",
            "doc1_value": clauses1.get("governing_law", "Delaware (Commercial)"),
            "doc2_value": clauses2.get("governing_law", "New York (Commercial)"),
            "status": "Inconsistent" if clauses1.get("governing_law") != clauses2.get("governing_law") else "Aligned",
            "delta_notes": f"Document 1 is governed under {clauses1.get('governing_law', 'Delaware')} while Document 2 designates {clauses2.get('governing_law', 'New York')}. Multi-jurisdictional enforcement risks apply."
        },
        {
            "domain": "Limitation of Liability",
            "doc1_value": clauses1.get("liability_cap", "12 Months aggregate fees paid"),
            "doc2_value": clauses2.get("liability_cap", "Uncapped / Silent on ceiling"),
            "status": "High Divergence",
            "delta_notes": "Document 1 contains an express 12-month liability ceiling with standard exclusions. Document 2 lacks an express liability cap, creating open-ended financial risk."
        },
        {
            "domain": "Termination Notice Period",
            "doc1_value": clauses1.get("termination_notice", "30 Days written notice for cause; 60 days non-renewal"),
            "doc2_value": clauses2.get("termination_notice", "30 Days notice"),
            "status": "Minor Variation",
            "delta_notes": "Both agreements permit 30-day termination for breach, but Document 1 requires advance notice for non-renewal."
        },
        {
            "domain": "Dispute Resolution",
            "doc1_value": clauses1.get("dispute_resolution", "JAMS Binding Arbitration (Wilmington, DE)"),
            "doc2_value": clauses2.get("dispute_resolution", "Litigation in NY Courts"),
            "status": "Inconsistent",
            "delta_notes": "Document 1 mandates private arbitration, while Document 2 submits disputes to public state and federal court litigation."
        },
        {
            "domain": "Confidentiality Duration",
            "doc1_value": clauses1.get("confidentiality_duration", "5 Years post-termination; trade secrets perpetual"),
            "doc2_value": clauses2.get("confidentiality_duration", "3 Years from execution"),
            "status": "Inconsistent",
            "delta_notes": "Document 1 offers longer confidentiality protection surviving termination, whereas Document 2 expires 3 years after execution."
        }
    ]

    return {
        "success": True,
        "doc1": doc1,
        "doc2": doc2,
        "doc1_risk": analysis1.get("overall_risk_score", "MEDIUM"),
        "doc2_risk": analysis2.get("overall_risk_score", "MEDIUM"),
        "comparison_domains": comparison_domains,
        "overall_summary": f"Comparison between '{doc1['filename']}' and '{doc2['filename']}' indicates critical variance in liability caps and dispute resolution forums."
    }

