import io
import re
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader


def clean_legal_text(text: str) -> str:
    """Cleans up raw PDF extracted text by normalizing whitespace while preserving paragraphs."""
    if not text:
        return ""
    # Replace non-breaking spaces and exotic whitespace
    text = text.replace("\u00a0", " ").replace("\r\n", "\n").replace("\r", "\n")
    # Replace 3 or more consecutive newlines with 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove hyphenated line-breaks (e.g. "responsi-\nbility" -> "responsibility")
    text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
    # Clean up trailing spaces per line
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]
    return "\n".join(lines).strip()


def extract_text_from_pdf(file_bytes_or_path: Any) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Extracts text from a PDF file stream, bytes, or file path.
    Returns:
        full_text: concatenated string of all pages
        pages: list of dicts with {"page_number": int, "text": str}
    """
    if isinstance(file_bytes_or_path, bytes):
        reader = PdfReader(io.BytesIO(file_bytes_or_path))
    elif isinstance(file_bytes_or_path, str):
        reader = PdfReader(file_bytes_or_path)
    else:
        # File-like object (e.g. UploadFile.file)
        reader = PdfReader(file_bytes_or_path)

    pages = []
    full_text_parts = []

    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        page_text = page.extract_text() or ""
        cleaned = clean_legal_text(page_text)
        pages.append({
            "page_number": page_num,
            "text": cleaned,
            "char_count": len(cleaned)
        })
        if cleaned:
            full_text_parts.append(f"--- [PAGE {page_num}] ---\n{cleaned}")

    full_text = "\n\n".join(full_text_parts)
    return full_text, pages


def chunk_legal_document(
    document_id: str,
    pages: List[Dict[str, Any]],
    chunk_size: int = 800,
    chunk_overlap: int = 150
) -> List[Dict[str, Any]]:
    """
    Chunks legal document text with sliding window overlap while preserving page metadata.
    Chunk size around 800 chars matches typical legal sub-clauses for ChromaDB RAG.
    """
    chunks = []
    chunk_counter = 0

    for page_data in pages:
        page_num = page_data["page_number"]
        page_text = page_data["text"]

        if not page_text:
            continue

        # Split into approximate paragraphs or sentences
        paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
        
        # Build chunks from paragraphs
        current_chunk = ""
        for para in paragraphs:
            if len(current_chunk) + len(para) + 2 <= chunk_size:
                current_chunk = f"{current_chunk}\n\n{para}".strip()
            else:
                if current_chunk:
                    chunk_counter += 1
                    chunks.append({
                        "id": f"{document_id}_chunk_{chunk_counter}",
                        "text": current_chunk,
                        "metadata": {
                            "document_id": document_id,
                            "page": page_num,
                            "chunk_index": chunk_counter,
                            "char_length": len(current_chunk)
                        }
                    })
                    # Keep overlap from the end of current_chunk
                    overlap_text = current_chunk[-chunk_overlap:] if len(current_chunk) > chunk_overlap else ""
                    current_chunk = f"{overlap_text}\n\n{para}".strip()
                else:
                    # Paragraph is longer than chunk_size, slice it
                    for i in range(0, len(para), chunk_size - chunk_overlap):
                        slice_text = para[i:i + chunk_size].strip()
                        if slice_text:
                            chunk_counter += 1
                            chunks.append({
                                "id": f"{document_id}_chunk_{chunk_counter}",
                                "text": slice_text,
                                "metadata": {
                                    "document_id": document_id,
                                    "page": page_num,
                                    "chunk_index": chunk_counter,
                                    "char_length": len(slice_text)
                                }
                            })
                    current_chunk = ""

        if current_chunk:
            chunk_counter += 1
            chunks.append({
                "id": f"{document_id}_chunk_{chunk_counter}",
                "text": current_chunk,
                "metadata": {
                    "document_id": document_id,
                    "page": page_num,
                    "chunk_index": chunk_counter,
                    "char_length": len(current_chunk)
                }
            })

    return chunks
