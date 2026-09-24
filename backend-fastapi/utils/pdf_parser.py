import io
import os
import re
import hashlib
from typing import List, Dict, Any, Tuple, Generator, Union
from pypdf import PdfReader

# Precompiled regular expressions for high-throughput text normalization
RE_MULTIPLE_NEWLINES = re.compile(r"\n{3,}")
RE_HYPHENATED_LINEBREAK = re.compile(r"(\w+)-\n(\w+)")
RE_HORIZONTAL_WHITESPACE = re.compile(r"[ \t]+")
RE_SENTENCE_SPLIT = re.compile(r"(?<=[.!?:])\s+(?=[A-Z0-9\(\"'])")
RE_CLAUSE_SPLIT = re.compile(r"\n\s*(?=(?:\d+\.|\([a-zA-Z0-9]+\)|Section\s+\d+|Article\s+[IVXLCDM\d]+|[A-Z\s]{4,}:))", re.IGNORECASE)


def clean_legal_text(text: str) -> str:
    """
    Cleans up raw PDF extracted text by normalizing whitespace while preserving paragraphs.
    Uses precompiled regexes for maximum throughput.
    """
    if not text:
        return ""
    # Normalize whitespace characters
    text = text.replace("\u00a0", " ").replace("\r\n", "\n").replace("\r", "\n")
    # Replace 3 or more consecutive newlines with 2
    text = RE_MULTIPLE_NEWLINES.sub("\n\n", text)
    # Remove hyphenated line-breaks (e.g. "responsi-\nbility" -> "responsibility")
    text = RE_HYPHENATED_LINEBREAK.sub(r"\1\2", text)
    # Clean up trailing and multiple spaces per line in a single pass
    lines = [RE_HORIZONTAL_WHITESPACE.sub(" ", line).strip() for line in text.split("\n")]
    return "\n".join(lines).strip()


def compute_content_hash(data: Union[bytes, str]) -> str:
    """Computes a SHA-256 content hash for document deduplication."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def stream_pdf_pages(file_bytes_or_path: Any) -> Generator[Dict[str, Any], None, None]:
    """
    Memory-efficient generator that yields parsed pages one by one without
    holding multiple redundant full-document representations in memory.
    """
    if isinstance(file_bytes_or_path, bytes):
        reader = PdfReader(io.BytesIO(file_bytes_or_path))
    elif isinstance(file_bytes_or_path, str):
        reader = PdfReader(file_bytes_or_path)
    else:
        # File-like object (e.g. UploadFile.file or SpooledTemporaryFile)
        reader = PdfReader(file_bytes_or_path)

    for idx, page in enumerate(reader.pages):
        page_num = idx + 1
        page_text = page.extract_text() or ""
        cleaned = clean_legal_text(page_text)
        yield {
            "page_number": page_num,
            "text": cleaned,
            "char_count": len(cleaned)
        }


def extract_text_from_pdf(file_bytes_or_path: Any) -> Tuple[str, List[Dict[str, Any]]]:
    """
    Extracts text from a PDF file stream, bytes, or file path.
    Returns:
        full_text: concatenated string of all pages
        pages: list of dicts with {"page_number": int, "text": str, "char_count": int}
    """
    pages = []
    full_text_parts = []

    for page_data in stream_pdf_pages(file_bytes_or_path):
        pages.append(page_data)
        if page_data["text"]:
            full_text_parts.append(f"--- [PAGE {page_data['page_number']}] ---\n{page_data['text']}")

    full_text = "\n\n".join(full_text_parts)
    return full_text, pages


def _split_long_paragraph(paragraph: str, max_chars: int, overlap_chars: int) -> List[str]:
    """
    Splits long legal paragraphs at natural sentence or punctuation boundaries,
    falling back to whitespace, completely preventing mid-word or mid-number cutting.
    """
    if len(paragraph) <= max_chars:
        return [paragraph]

    sentences = RE_SENTENCE_SPLIT.split(paragraph)
    chunks = []
    current = ""

    for s in sentences:
        s = s.strip()
        if not s:
            continue
        if len(current) + len(s) + 1 <= max_chars:
            current = f"{current} {s}".strip() if current else s
        else:
            if current:
                chunks.append(current)
                # Build overlap starting at word boundary
                if len(current) > overlap_chars:
                    raw_overlap = current[-overlap_chars:]
                    # Snap to next word boundary to avoid partial words
                    first_space = raw_overlap.find(" ")
                    overlap = raw_overlap[first_space + 1:].strip() if first_space != -1 else raw_overlap
                else:
                    overlap = current
                current = f"{overlap} {s}".strip() if overlap else s
            else:
                # Single sentence exceeds max_chars: split on word boundaries
                words = s.split(" ")
                word_chunk = ""
                for w in words:
                    if len(word_chunk) + len(w) + 1 <= max_chars:
                        word_chunk = f"{word_chunk} {w}".strip() if word_chunk else w
                    else:
                        if word_chunk:
                            chunks.append(word_chunk)
                        word_chunk = w
                if word_chunk:
                    current = word_chunk

    if current:
        chunks.append(current)

    return chunks


def chunk_legal_document(
    document_id: str,
    pages: List[Dict[str, Any]],
    chunk_size: int = 800,
    chunk_overlap: int = 150
) -> List[Dict[str, Any]]:
    """
    Chunks legal document text with clause- and sentence-aware sliding window overlap.
    Preserves page metadata and provides dual-schema compatibility for RAG and tests.
    Chunk size around 800 chars matches typical legal sub-clauses for ChromaDB RAG.
    """
    chunks = []
    chunk_counter = 0

    for page_data in pages:
        page_num = page_data["page_number"]
        page_text = page_data["text"]

        if not page_text:
            continue

        # Split into distinct paragraphs or major clause blocks
        raw_paragraphs = [p.strip() for p in page_text.split("\n\n") if p.strip()]
        
        # Build chunks from paragraphs while respecting semantic boundaries
        current_chunk = ""
        for para in raw_paragraphs:
            # If paragraph itself is too large, split it with boundary-awareness
            if len(para) > chunk_size:
                # If we have an accumulated chunk, flush it first
                if current_chunk:
                    chunk_counter += 1
                    chunks.append({
                        "id": f"{document_id}_chunk_{chunk_counter}",
                        "chunk_id": f"{document_id}_chunk_{chunk_counter}",
                        "doc_id": document_id,
                        "document_id": document_id,
                        "page_number": page_num,
                        "text": current_chunk,
                        "metadata": {
                            "document_id": document_id,
                            "doc_id": document_id,
                            "page": page_num,
                            "page_number": page_num,
                            "chunk_index": chunk_counter,
                            "char_length": len(current_chunk)
                        }
                    })
                    current_chunk = ""

                sub_chunks = _split_long_paragraph(para, chunk_size, chunk_overlap)
                for sc in sub_chunks:
                    chunk_counter += 1
                    chunks.append({
                        "id": f"{document_id}_chunk_{chunk_counter}",
                        "chunk_id": f"{document_id}_chunk_{chunk_counter}",
                        "doc_id": document_id,
                        "document_id": document_id,
                        "page_number": page_num,
                        "text": sc,
                        "metadata": {
                            "document_id": document_id,
                            "doc_id": document_id,
                            "page": page_num,
                            "page_number": page_num,
                            "chunk_index": chunk_counter,
                            "char_length": len(sc)
                        }
                    })
                continue

            if len(current_chunk) + len(para) + 2 <= chunk_size:
                current_chunk = f"{current_chunk}\n\n{para}".strip() if current_chunk else para
            else:
                if current_chunk:
                    chunk_counter += 1
                    chunks.append({
                        "id": f"{document_id}_chunk_{chunk_counter}",
                        "chunk_id": f"{document_id}_chunk_{chunk_counter}",
                        "doc_id": document_id,
                        "document_id": document_id,
                        "page_number": page_num,
                        "text": current_chunk,
                        "metadata": {
                            "document_id": document_id,
                            "doc_id": document_id,
                            "page": page_num,
                            "page_number": page_num,
                            "chunk_index": chunk_counter,
                            "char_length": len(current_chunk)
                        }
                    })
                    # Keep clean overlap from the end of current_chunk snapped to word/sentence boundary
                    if len(current_chunk) > chunk_overlap:
                        overlap_tail = current_chunk[-chunk_overlap:]
                        space_idx = overlap_tail.find(" ")
                        overlap_text = overlap_tail[space_idx + 1:].strip() if space_idx != -1 else overlap_tail
                    else:
                        overlap_text = current_chunk
                    current_chunk = f"{overlap_text}\n\n{para}".strip() if overlap_text else para
                else:
                    current_chunk = para

        if current_chunk:
            chunk_counter += 1
            chunks.append({
                "id": f"{document_id}_chunk_{chunk_counter}",
                "chunk_id": f"{document_id}_chunk_{chunk_counter}",
                "doc_id": document_id,
                "document_id": document_id,
                "page_number": page_num,
                "text": current_chunk,
                "metadata": {
                    "document_id": document_id,
                    "doc_id": document_id,
                    "page": page_num,
                    "page_number": page_num,
                    "chunk_index": chunk_counter,
                    "char_length": len(current_chunk)
                }
            })

    return chunks
