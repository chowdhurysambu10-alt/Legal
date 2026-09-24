import os
import time
from typing import List, Dict, Any, Optional, Tuple
import chromadb
from chromadb.config import Settings


class RAGService:
    """
    Manages local ChromaDB persistent vector storage for legal document chunks.
    Performs vector ingestion, caching, and filtered similarity search by document ID.
    Features:
    - LRU query cache to eliminate duplicate vector embedding and index scans
    - Relevance thresholding to drop low-quality / noise chunks
    - Text redundancy pruning to prevent feeding overlapping clauses to the LLM
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
        # Query cache: key -> (timestamp, List[Dict[str, Any]])
        self._query_cache: Dict[str, Tuple[float, List[Dict[str, Any]]]] = {}
        self._cache_ttl_seconds = 300  # 5 minutes
        self._cache_max_entries = 500
        print(f"[ChromaDB] Persistent vector store initialized at {self.db_dir} (Collection: {self.collection_name})")

    def _purge_expired_cache(self):
        """Cleans up expired query cache entries to bound memory usage."""
        now = time.time()
        if len(self._query_cache) > self._cache_max_entries:
            self._query_cache.clear()
            return
        expired = [k for k, (ts, _) in self._query_cache.items() if now - ts > self._cache_ttl_seconds]
        for k in expired:
            self._query_cache.pop(k, None)

    def _invalidate_doc_cache(self, document_id: str):
        """Removes cached queries associated with a specific document."""
        prefix = f"{document_id}:"
        to_del = [k for k in self._query_cache if k.startswith(prefix)]
        for k in to_del:
            self._query_cache.pop(k, None)

    def add_document_chunks(self, document_id: str, chunks: List[Dict[str, Any]]) -> int:
        """
        Embeds and stores chunks for a document in ChromaDB.
        Avoids redundant work by clearing stale cache and batching inserts.
        """
        if not chunks:
            return 0

        # Remove any existing chunks for this document first to prevent duplicates
        self.delete_document(document_id)
        self._invalidate_doc_cache(document_id)

        ids = []
        documents = []
        metadatas = []

        for chunk in chunks:
            chunk_id = chunk.get("id") or chunk.get("chunk_id")
            ids.append(chunk_id)
            documents.append(chunk["text"])
            meta = chunk.get("metadata", {})
            # Ensure metadata values are primitive types supported by Chroma
            sanitized_meta = {
                "document_id": str(meta.get("document_id", document_id)),
                "page": int(meta.get("page", meta.get("page_number", 1))),
                "chunk_index": int(meta.get("chunk_index", 0)),
                "char_length": int(meta.get("char_length", len(chunk["text"])))
            }
            metadatas.append(sanitized_meta)

        # Batch insert into ChromaDB
        from core.logger import logger
        batch_size = 200
        try:
            for i in range(0, len(ids), batch_size):
                self.collection.add(
                    ids=ids[i:i + batch_size],
                    documents=documents[i:i + batch_size],
                    metadatas=metadatas[i:i + batch_size]
                )
            logger.info(
                f"Ingested {len(ids)} chunks into ChromaDB for document {document_id}",
                extra={"component": "chromadb", "document_id": document_id, "chunk_count": len(ids)}
            )
        except Exception as e:
            logger.error(
                f"Failed to batch insert chunks into ChromaDB: {e}",
                extra={"component": "chromadb", "document_id": document_id, "error_type": type(e).__name__}
            )
            # Re-raise or allow caller to handle gracefully
            raise
        return len(ids)

    def similarity_search(
        self,
        document_id: str,
        query: str,
        top_k: int = 4,
        min_relevance: float = 0.30
    ) -> List[Dict[str, Any]]:
        """
        Retrieves the minimal, highly relevant chunks for a specific document.
        Applies:
        1. Fast LRU query caching to eliminate repeated vector searches.
        2. Relevance scoring threshold (drops noise chunks).
        3. Near-duplicate overlap deduplication.
        """
        clean_q = query.strip()
        if not clean_q:
            return []

        # Check in-memory query cache
        cache_key = f"{document_id}:{clean_q.lower()}:{top_k}"
        now = time.time()
        cached = self._query_cache.get(cache_key)
        if cached:
            ts, results = cached
            if now - ts <= self._cache_ttl_seconds:
                return results

        try:
            # Overfetch slightly (top_k + 2) so we can filter and deduplicate down to exactly top_k
            fetch_k = min(top_k + 2, 10)
            results = self.collection.query(
                query_texts=[clean_q],
                n_results=fetch_k,
                where={"document_id": document_id}
            )

            matched_chunks = []
            if results and results.get("documents") and len(results["documents"]) > 0:
                docs = results["documents"][0]
                metas = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
                distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)
                ids = results["ids"][0] if results.get("ids") else [f"chunk_{i}" for i in range(len(docs))]

                for i, text in enumerate(docs):
                    dist = distances[i]
                    rel_score = max(0.0, round(1.0 - (dist / 2.0), 3)) if dist is not None else 0.85
                    
                    # Filter out low-relevance noise chunks
                    if rel_score < min_relevance and len(matched_chunks) > 0:
                        continue

                    # Deduplicate near-identical overlapping chunks
                    is_duplicate = False
                    clean_text_words = set(text.lower().split()[:25])
                    for existing in matched_chunks:
                        existing_words = set(existing["text"].lower().split()[:25])
                        overlap = len(clean_text_words.intersection(existing_words))
                        if len(clean_text_words) > 0 and (overlap / len(clean_text_words)) > 0.80:
                            is_duplicate = True
                            break

                    if not is_duplicate:
                        matched_chunks.append({
                            "id": ids[i],
                            "chunk_id": ids[i],
                            "text": text,
                            "metadata": metas[i],
                            "distance": dist,
                            "relevance_score": rel_score
                        })

                    if len(matched_chunks) >= top_k:
                        break

            # Cache the clean result
            self._purge_expired_cache()
            self._query_cache[cache_key] = (now, matched_chunks)

            return matched_chunks
        except Exception as e:
            from core.logger import logger
            logger.error(
                f"ChromaDB similarity search error for document {document_id}: {e}",
                extra={"component": "chromadb", "document_id": document_id, "error_type": type(e).__name__}
            )
            return []

    def delete_document(self, document_id: str) -> bool:
        """
        Deletes all chunks associated with a document and cleans its query cache.
        """
        try:
            self.collection.delete(where={"document_id": document_id})
            self._invalidate_doc_cache(document_id)
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
                "cached_queries": len(self._query_cache),
                "storage_path": self.db_dir,
                "status": "ready"
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}


# Global singleton instance
rag_service = RAGService()

