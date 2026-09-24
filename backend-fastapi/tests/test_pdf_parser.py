import pytest
from pypdf import PdfWriter
import io
from utils.pdf_parser import extract_text_from_pdf, clean_legal_text, chunk_legal_document


def create_mock_pdf_bytes(num_pages: int = 2) -> bytes:
    """Helper that generates valid in-memory PDF binary stream."""
    writer = PdfWriter()
    for _ in range(num_pages):
        writer.add_blank_page(width=72, height=72)
    stream = io.BytesIO()
    writer.write(stream)
    return stream.getvalue()


# 1. Text Normalization Unit Tests
def test_clean_legal_text_normalization():
    raw_dirty = "Nexus\u00a0Enterprises\r\n\r\n\r\n\r\nresponsi-\nbility    and   diligence."
    cleaned = clean_legal_text(raw_dirty)
    assert "\u00a0" not in cleaned
    assert "\r" not in cleaned
    assert "responsibility and diligence." in cleaned
    assert "\n\n\n" not in cleaned


def test_clean_legal_text_empty():
    assert clean_legal_text("") == ""
    assert clean_legal_text(None) == ""


# 2. Parsing Valid Clean PDF
def test_extract_text_from_valid_pdf():
    pdf_bytes = create_mock_pdf_bytes(2)
    full_text, pages = extract_text_from_pdf(pdf_bytes)
    assert isinstance(pages, list)
    assert len(pages) == 2
    assert pages[0]["page_number"] == 1
    assert "char_count" in pages[0]


# 3. Handling Corrupted Files
def test_extract_text_from_corrupted_pdf():
    corrupted_bytes = b"%PDF-1.4\nInvalid incomplete binary payload without xref or trailer\x00\xFF"
    with pytest.raises(Exception):
        extract_text_from_pdf(corrupted_bytes)


# 4. Zero-byte Uploads
def test_extract_text_from_zero_byte_pdf():
    empty_bytes = b""
    with pytest.raises(Exception):
        extract_text_from_pdf(empty_bytes)


# 5. Document Chunking Algorithm
def test_chunk_legal_document_boundaries():
    sample_pages = [
        {
            "page_number": 1,
            "text": "1. OBLIGATIONS. " + ("The contractor shall fulfill all requirements with diligence. " * 20),
            "char_count": 1200
        }
    ]
    chunks = chunk_legal_document("doc-test", sample_pages, chunk_size=500, chunk_overlap=100)
    assert len(chunks) >= 2
    assert chunks[0]["doc_id"] == "doc-test"
    assert chunks[0]["page_number"] == 1
    assert "chunk_id" in chunks[0]
