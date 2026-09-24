from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel

from core.rag_service import rag_service
from core.gemini_service import gemini_service
from core.supabase_client import db_client
from core.security import get_optional_user, verify_document_ownership

router = APIRouter(prefix="/api", tags=["Agent & RAG"])


class AskRequest(BaseModel):
    document_id: str
    question: str


LEGAL_AI_DISCLAIMER = (
    "AI-generated legal information is provided strictly for educational and informational "
    "purposes and does not constitute formal legal advice or create an attorney-client relationship."
)


@router.post("/ask")
async def ask_contract_question(
    payload: AskRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Chatbot / RAG Endpoint:
    1. Verifies document existence and enforces IDOR authorization.
    2. Checks conversational intent (greetings, bot identity).
    3. Retrieves grounded context chunks from ChromaDB with adaptive thresholding.
    4. Calls Gemini Legal Service with prompt injection defense & response caching.
    5. Stores chat history and returns grounded answer with formal legal disclaimer.
    """
    document_id = payload.document_id
    question = payload.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Check if document exists and verify owner
    doc = db_client.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found.")

    verify_document_ownership(doc, current_user)

    from core.logger import logger
    # 1. Fetch recent chat history for multi-turn conversation
    try:
        chat_history = db_client.get_chat_history(document_id, limit=10)
    except Exception as hist_err:
        logger.warning(f"Could not load chat history for doc {document_id}: {hist_err}", extra={"component": "database", "document_id": document_id})
        chat_history = []

    # 2. Only run vector search if not purely conversational greeting
    is_conversational = bool(gemini_service._is_conversational_query(question))
    relevant_chunks = []
    if not is_conversational:
        try:
            # Retrieve only required relevant chunks (top_k=4 with relevance cutoff)
            relevant_chunks = rag_service.similarity_search(document_id, question, top_k=4)
        except Exception as search_err:
            logger.error(f"ChromaDB search failed during chat for doc {document_id}: {search_err}", extra={"component": "chromadb", "document_id": document_id})
            relevant_chunks = []

    # 3. Call Gemini Legal Service with fallback
    try:
        rag_response = gemini_service.answer_rag_query(
            question=question,
            context_chunks=relevant_chunks,
            contract_metadata=doc,
            chat_history=chat_history
        )
    except Exception as llm_err:
        logger.error(f"Gemini RAG query failed for doc {document_id}: {llm_err}", extra={"component": "gemini", "document_id": document_id, "error_type": type(llm_err).__name__})
        rag_response = gemini_service._generate_heuristic_rag_answer(question, relevant_chunks, doc)

    # 4. Save chat message to database safely
    try:
        db_client.save_chat_message(
            doc_id=document_id,
            role="user",
            content=question
        )
        db_client.save_chat_message(
            doc_id=document_id,
            role="assistant",
            content=rag_response["answer"],
            sources=rag_response.get("citations", [])
        )
    except Exception as save_err:
        logger.warning(f"Could not persist chat message to database for doc {document_id}: {save_err}", extra={"component": "database", "document_id": document_id})

    logger.info(f"Processed RAG query for doc {document_id}", extra={"component": "rag_agent", "document_id": document_id, "confidence": rag_response.get("confidence", "High")})

    return {
        "success": True,
        "document_id": document_id,
        "question": question,
        "answer": rag_response["answer"],
        "citations": rag_response.get("citations", []),
        "confidence": rag_response.get("confidence", "High"),
        "model": rag_response.get("model", "gemini-3.6-flash"),
        "provider": rag_response.get("provider", "gemini"),
        "disclaimer": LEGAL_AI_DISCLAIMER
    }


@router.get("/documents/{document_id}/chat")
async def get_document_chat_history(
    document_id: str,
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Retrieves chronological chat dialogue history for the active contract with pagination & IDOR check."""
    doc = db_client.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    verify_document_ownership(doc, current_user)

    messages = db_client.get_chat_history(document_id, limit=limit, offset=offset)
    return {
        "messages": messages,
        "total_count": len(messages),
        "limit": limit,
        "offset": offset
    }


@router.delete("/documents/{document_id}/chat")
async def delete_document_chat_history(
    document_id: str,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Clears all chat history for a specific document with IDOR check."""
    doc = db_client.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found.")
    verify_document_ownership(doc, current_user)

    db_client.clear_chat_history(document_id)
    return {"success": True, "message": "Chat history cleared successfully."}


class ChatMessageRequest(BaseModel):
    question: str


@router.post("/documents/{document_id}/chat")
async def post_document_chat(
    document_id: str,
    payload: ChatMessageRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Direct chat endpoint for a specific document with IDOR enforcement."""
    return await ask_contract_question(
        AskRequest(document_id=document_id, question=payload.question),
        current_user=current_user
    )


