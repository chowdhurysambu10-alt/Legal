from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.rag_service import rag_service
from core.gemini_service import gemini_service
from core.supabase_client import db_client

router = APIRouter(prefix="/api", tags=["Agent & RAG"])


class AskRequest(BaseModel):
    document_id: str
    question: str


@router.post("/ask")
async def ask_contract_question(payload: AskRequest):
    """
    Chatbot / RAG Endpoint:
    1. Checks if question is conversational (e.g. greetings, bot identity).
    2. If contract-specific, retrieves relevant context chunks from ChromaDB.
    3. Retrieves recent conversation dialogue for multi-turn contextual memory.
    4. Calls Gemini Legal Service with conversational chat instructions.
    5. Saves chat interaction to database and returns grounded answer.
    """
    document_id = payload.document_id
    question = payload.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Check if document exists
    doc = db_client.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document {document_id} not found.")

    # 1. Fetch recent chat history for multi-turn conversation
    chat_history = db_client.get_chat_history(document_id)

    # 2. Only run vector search if not purely conversational greeting
    is_conversational = bool(gemini_service._is_conversational_query(question))
    relevant_chunks = []
    if not is_conversational:
        relevant_chunks = rag_service.similarity_search(document_id, question, top_k=4)

    # 3. Call Gemini Legal Service
    rag_response = gemini_service.answer_rag_query(
        question=question,
        context_chunks=relevant_chunks,
        contract_metadata=doc,
        chat_history=chat_history
    )

    # 4. Save chat message to database
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

    return {
        "success": True,
        "document_id": document_id,
        "question": question,
        "answer": rag_response["answer"],
        "citations": rag_response.get("citations", []),
        "confidence": rag_response.get("confidence", "High"),
        "model": rag_response.get("model", "gemini-3.6-flash"),
        "provider": rag_response.get("provider", "gemini")
    }


@router.get("/documents/{document_id}/chat")
async def get_document_chat_history(document_id: str):
    """Retrieves chronological chat dialogue history for the active contract."""
    messages = db_client.get_chat_history(document_id)
    return {"messages": messages}


@router.delete("/documents/{document_id}/chat")
async def delete_document_chat_history(document_id: str):
    """Clears all chat history for a specific document."""
    db_client.clear_chat_history(document_id)
    return {"success": True, "message": "Chat history cleared successfully."}


class ChatMessageRequest(BaseModel):
    question: str


@router.post("/documents/{document_id}/chat")
async def post_document_chat(document_id: str, payload: ChatMessageRequest):
    """Direct chat endpoint for a specific document."""
    return await ask_contract_question(AskRequest(document_id=document_id, question=payload.question))

