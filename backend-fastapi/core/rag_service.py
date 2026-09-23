import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings


class RAGService:
    """
    Manages local ChromaDB persistent vector storage for legal document chunks.
    Performs vector ingestion and filtered similarity search by document ID.
    """
    def __init__(self, db_dir: Optional[str] = None):
        if not db_dir:
            db_dir = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
        os.makedirs(db_dir, exist_ok=True)
        self.db_dir = db_dir
        
        # Initialize persistent ChromaDB client
        self.client = chromadb.PersistentClient(
            path=self.db_dir,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Get or create collection
        self.collection_name = "legal_contracts"
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"description": "Legal contract sub-clauses and RAG embeddings"}
        )
        print(f"[ChromaDB] Persistent vector store initialized at {self.db_dir} (Collection: {self.collection_name})")

    def add_document_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> int:
        """
        Embeds and stores chunks for a document in ChromaDB.
        """
        if not chunks:
            return 0

        # Remove any existing chunks for this document first to prevent duplicates
        self.delete_document(document_id)

        ids = []
        documents = []
        metadatas = []

        for chunk in chunks:
            ids.append(chunk["id"])
            documents.append(chunk["text"])
            meta = chunk.get("metadata", {})
            # Ensure metadata values are primitive types supported by Chroma
            sanitized_meta = {
                "document_id": str(meta.get("document_id", document_id)),
                "page": int(meta.get("page", 1)),
                "chunk_index": int(meta.get("chunk_index", 0)),
                "char_length": int(meta.get("char_length", len(chunk["text"])))
            }
            metadatas.append(sanitized_meta)

        # Batch insert into ChromaDB
        batch_size = 200
        for i in range(0, len(ids), batch_size):
            self.collection.add(
                ids=ids[i:i + batch_size],
                documents=documents[i:i + batch_size],
                metadatas=metadatas[i:i + batch_size]
            )

        print(f"[ChromaDB] Ingested {len(ids)} chunks for document {document_id}")
        return len(ids)

    def similarity_search(
        self,
        document_id: str,
        query: str,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Retrieves top_k most relevant chunks for a specific document.
        """
        if not query.strip():
            return []

        try:
            # Query with metadata filter for document_id
            results = self.collection.query(
                query_texts=[query],
                n_results=top_k,
                where={"document_id": document_id}
            )

            matched_chunks = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
                distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)
                ids = results["ids"][0] if results.get("ids") else [f"chunk_{i}" for i in range(len(docs))]

                for i, text in enumerate(docs):
                    matched_chunks.append({
                        "id": ids[i],
                        "text": text,
                        "metadata": metas[i],
                        "distance": distances[i],
                        "relevance_score": max(0.0, round(1.0 - (distances[i] / 2.0), 3)) if distances[i] is not None else 0.85
                    })

            return matched_chunks
        except Exception as e:
            print(f"[ChromaDB] Query error: {e}")
            return []

    def delete_document(self, document_id: str) -> bool:
        """
        Deletes all chunks associated with a document.
        """
        try:
            self.collection.delete(where={"document_id": document_id})
            return True
        except Exception as e:
            print(f"[ChromaDB] Delete error: {e}")
            return False

    def get_stats(self) -> Dict[str, Any]:
        """Returns collection stats."""
        try:
            count = self.collection.count()
            return {
                "collection_name": self.collection_name,
                "total_chunks": count,
                "storage_path": self.db_dir,
                "status": "ready"
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}


# Global singleton instance
rag_service = RAGService()
