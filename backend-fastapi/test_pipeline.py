import asyncio
from api.document_routes import upload_document, SAMPLE_CONTRACT_TEXT
from api.agent_routes import ask_contract_question, AskRequest
from core.supabase_client import db_client
from core.rag_service import rag_service

async def test_full_pipeline():
    print("--- 1. Testing Document Ingestion (Sample Contract) ---")
    result = await upload_document(file=None, use_sample=True)
    assert result["success"] is True
    doc_id = result["document"]["id"]
    print(f"Document ID: {doc_id}")
    print(f"Filename: {result['document']['filename']}")
    print(f"Chunk count: {result['document']['chunk_count']}")
    print(f"Overall Risk Score: {result['analysis']['overall_risk_score']}")
    print(f"Risk Flags Count: {len(result['analysis']['risk_flags'])}")
    print(f"Checklist Items: {len(result['analysis']['checklist'])}")

    print("\n--- 2. Testing ChromaDB Similarity Search ---")
    chunks = rag_service.similarity_search(doc_id, "What is the indemnification clause?", top_k=2)
    print(f"Retrieved {len(chunks)} chunks from ChromaDB")
    for i, c in enumerate(chunks):
        print(f"  Chunk {i+1} (Relevance: {c.get('relevance_score')}): {c['text'][:80]}...")

    print("\n--- 3. Testing RAG Contract Q&A ---")
    q_res = await ask_contract_question(AskRequest(
        document_id=doc_id,
        question="What are the indemnification and liability terms?"
    ))
    print("Q&A Answer:")
    print(q_res["answer"][:300] + "...")
    print(f"Citations count: {len(q_res['citations'])}")

    print("\n--- 4. Testing Chat History in Database ---")
    history = db_client.get_chat_history(doc_id)
    print(f"Chat history messages count: {len(history)}")
    assert len(history) >= 2

    print("\nSUCCESS: All backend tests passed perfectly!")

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())
