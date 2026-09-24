import os
import time
import json
import sqlite3
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

# Load env variables from backend root
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()


def is_supabase_configured() -> bool:
    """Checks if valid Supabase credentials are provided."""
    load_dotenv(override=True)
    url = os.getenv("SUPABASE_URL", "").strip()
    key = os.getenv("SUPABASE_KEY", "").strip()
    return bool(
        url
        and "your-project-ref" not in url
        and key
        and "your_supabase" not in key
    )


class DatabaseClient:
    """
    Unified database client:
    1. Supabase PostgreSQL (Production Cloud Database)
    2. Local SQLite fallback (legal_local.db for offline development)
    """
    def __init__(self):
        self.sqlite_db_path = os.path.join(os.path.dirname(__file__), "..", "legal_local.db")
        self.connection_error = None
        self.simulated_disconnected = False
        self.client = None
        self._last_cleanup_time = 0.0
        self._ensure_supabase_client()
        self._init_sqlite()

    def _ensure_supabase_client(self):
        """Dynamically re-reads .env and connects to Supabase without requiring server restart."""
        from core.logger import logger
        load_dotenv(override=True)
        url = os.getenv("SUPABASE_URL", "").strip()
        key = os.getenv("SUPABASE_KEY", "").strip()
        if url and key and "your-project-ref" not in url and "your_supabase" not in key:
            if not self.client:
                try:
                    from supabase import create_client
                    self.client = create_client(url, key)
                    self.is_supabase = True
                    self.configured_for_supabase = True
                    logger.info("Supabase client successfully initialized", extra={"component": "supabase", "database_mode": "supabase"})
                except Exception as e:
                    self.connection_error = str(e)
                    self.is_supabase = False
                    self.configured_for_supabase = False
                    logger.error(
                        f"Supabase connection failed, falling back to local SQLite: {e}",
                        extra={"component": "supabase", "error_type": type(e).__name__}
                    )
            else:
                self.is_supabase = True
                self.configured_for_supabase = True
        else:
            self.is_supabase = False
            self.configured_for_supabase = False
        return self.client

    def _init_sqlite(self):
        """Initializes tables, WAL journal mode, and performance indexes in local SQLite database."""
        conn = sqlite3.connect(self.sqlite_db_path)
        cur = conn.cursor()
        
        cur.execute("PRAGMA foreign_keys = ON;")
        cur.execute("PRAGMA journal_mode = WAL;")
        cur.execute("PRAGMA synchronous = NORMAL;")
        
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT,
                full_name TEXT,
                created_at TEXT NOT NULL
            );
        """)
        try:
            cur.execute("ALTER TABLE users ADD COLUMN password_hash TEXT;")
        except Exception:
            pass

        cur.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                filename TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                page_count INTEGER DEFAULT 1,
                chunk_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'completed',
                raw_preview TEXT,
                upload_date TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL UNIQUE,
                overall_risk_score TEXT DEFAULT 'MEDIUM',
                summary TEXT NOT NULL,
                risk_flags TEXT NOT NULL,
                checklist TEXT NOT NULL,
                key_clauses TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
            );
        """)

        cur.execute("""
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                sources TEXT DEFAULT '[]',
                created_at TEXT NOT NULL,
                FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
            );
        """)

        # Performance Indexes
        cur.execute("CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON documents(upload_date DESC);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_analyses_document_id ON analyses(document_id);")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_chat_messages_doc_created ON chat_messages(document_id, created_at ASC);")

        conn.commit()
        conn.close()

    def get_status(self) -> Dict[str, Any]:
        if self.configured_for_supabase:
            mode = "supabase"
            target = SUPABASE_URL
        else:
            mode = "local_sqlite"
            target = self.sqlite_db_path

        if getattr(self, "simulated_disconnected", False):
            return {
                "mode": mode,
                "connected": False,
                "target": target,
                "error": "Database disconnected (Simulation active)"
            }

        if self.configured_for_supabase:
            if not self.client:
                return {
                    "mode": mode,
                    "connected": False,
                    "target": target,
                    "error": self.connection_error or "Supabase client not initialized"
                }
            try:
                # Active probe to verify table accessibility and live credentials
                self.client.table("users").select("id").limit(1).execute()
                return {
                    "mode": mode,
                    "connected": True,
                    "target": target,
                    "error": None
                }
            except Exception as e:
                return {
                    "mode": mode,
                    "connected": False,
                    "target": target,
                    "error": f"Supabase probe error: {str(e)}"
                }
        else:
            try:
                if not os.path.exists(self.sqlite_db_path):
                    self._init_sqlite()
                conn = sqlite3.connect(self.sqlite_db_path, timeout=3)
                cur = conn.cursor()
                cur.execute("SELECT 1")
                conn.close()
                return {
                    "mode": mode,
                    "connected": True,
                    "target": target,
                    "error": None
                }
            except Exception as e:
                return {
                    "mode": mode,
                    "connected": False,
                    "target": target,
                    "error": f"Local database error: {str(e)}"
                }

    # ==========================
    # Users CRUD (Authentication)
    # ==========================
    def create_user(self, email: str, password_hash: str, full_name: Optional[str] = None) -> Dict[str, Any]:
        user_id = f"usr_{uuid.uuid4().hex[:12]}"
        created_at = datetime.now(timezone.utc).isoformat()
        name = full_name or (email.split("@")[0].capitalize() if email else "User")
        payload = {
            "id": user_id,
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "full_name": name,
            "created_at": created_at
        }

        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("users").upsert(payload, on_conflict="email").execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase] Error inserting user: {e}. Falling back to SQLite.")

        # Local SQLite
        conn = sqlite3.connect(self.sqlite_db_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO users (id, email, password_hash, full_name, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (payload["id"], payload["email"], payload["password_hash"], payload["full_name"], payload["created_at"]))
        conn.commit()
        conn.close()
        return payload

    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        self._ensure_supabase_client()
        clean_email = email.strip().lower()
        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("users").select("*").eq("email", clean_email).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
                # If Supabase query succeeded and user is not in Supabase, return None!
                return None
            except Exception as e:
                print(f"[Supabase] Error querying user: {e}")

        # Local SQLite fallback
        conn = sqlite3.connect(self.sqlite_db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (clean_email,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        self._ensure_supabase_client()
        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("users").select("*").eq("id", user_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
                return None
            except Exception as e:
                print(f"[Supabase] Error querying user by id: {e}")

        # Local SQLite fallback
        conn = sqlite3.connect(self.sqlite_db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    # ==========================
    # Documents CRUD
    # ==========================
    def create_document(self, doc_data: Dict[str, Any]) -> Dict[str, Any]:
        doc_id = doc_data.get("id") or str(uuid.uuid4())
        upload_date = doc_data.get("upload_date") or datetime.now(timezone.utc).isoformat()
        user_id = doc_data.get("user_id")
        
        payload = {
            "id": doc_id,
            "user_id": user_id,
            "filename": doc_data["filename"],
            "file_size": doc_data.get("file_size", 0),
            "page_count": doc_data.get("page_count", 1),
            "chunk_count": doc_data.get("chunk_count", 0),
            "status": doc_data.get("status", "completed"),
            "raw_preview": doc_data.get("raw_preview", "")[:1000],
            "upload_date": upload_date
        }

        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("documents").insert(payload).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase] Error inserting document: {e}. Falling back to SQLite.")

        # Local SQLite sync/fallback
        conn = sqlite3.connect(self.sqlite_db_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO documents (id, user_id, filename, file_size, page_count, chunk_count, status, raw_preview, upload_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            payload["id"], payload["user_id"], payload["filename"], payload["file_size"],
            payload["page_count"], payload["chunk_count"], payload["status"],
            payload["raw_preview"], payload["upload_date"]
        ))
        conn.commit()
        conn.close()
        return payload

    def list_documents(
        self,
        user_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        include_analysis: bool = True
    ) -> List[Dict[str, Any]]:
        # Throttled cleanup of orphaned records (at most once per hour)
        now = time.time()
        if now - getattr(self, "_last_cleanup_time", 0.0) > 3600:
            self._last_cleanup_time = now
            try:
                self.cleanup_orphaned_documents()
            except Exception:
                pass

        # 1. Supabase
        if self.is_supabase:
            try:
                q = self.client.table("documents").select("*")
                if user_id:
                    q = q.eq("user_id", user_id)
                res = q.order("upload_date", desc=True).range(offset, offset + limit - 1).execute()
                docs = res.data or []
                if docs and include_analysis:
                    doc_ids = [d["id"] for d in docs]
                    try:
                        a_res = self.client.table("analyses").select("document_id, overall_risk_score, summary").in_("document_id", doc_ids).execute()
                        a_map = {a["document_id"]: a for a in (a_res.data or [])}
                        for d in docs:
                            an = a_map.get(d["id"])
                            d["overall_risk_score"] = an.get("overall_risk_score", "MEDIUM") if an else "NOT ANALYZED"
                            d["summary"] = an.get("summary", "") if an else ""
                    except Exception as e:
                        print(f"[Supabase] Batch analysis fetch error: {e}")
                return docs
            except Exception as e:
                print(f"[Supabase] Error listing documents: {e}. Using SQLite.")

        # Local SQLite with single JOIN query (eliminates N+1 query overhead)
        conn = sqlite3.connect(self.sqlite_db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        if include_analysis:
            if user_id:
                cur.execute("""
                    SELECT d.*, a.overall_risk_score, a.summary
                    FROM documents d
                    LEFT JOIN analyses a ON d.id = a.document_id
                    WHERE d.user_id = ?
                    ORDER BY d.upload_date DESC
                    LIMIT ? OFFSET ?
                """, (user_id, limit, offset))
            else:
                cur.execute("""
                    SELECT d.*, a.overall_risk_score, a.summary
                    FROM documents d
                    LEFT JOIN analyses a ON d.id = a.document_id
                    ORDER BY d.upload_date DESC
                    LIMIT ? OFFSET ?
                """, (limit, offset))
        else:
            if user_id:
                cur.execute("SELECT * FROM documents WHERE user_id = ? ORDER BY upload_date DESC LIMIT ? OFFSET ?", (user_id, limit, offset))
            else:
                cur.execute("SELECT * FROM documents ORDER BY upload_date DESC LIMIT ? OFFSET ?", (limit, offset))

        rows = cur.fetchall()
        docs = []
        for r in rows:
            d = dict(r)
            if include_analysis:
                d["overall_risk_score"] = d.get("overall_risk_score") or "NOT ANALYZED"
                d["summary"] = d.get("summary") or ""
            docs.append(d)
        conn.close()
        return docs

    def get_document(self, doc_id: str) -> Optional[Dict[str, Any]]:
        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("documents").select("*").eq("id", doc_id).single().execute()
                if res.data:
                    return res.data
            except Exception:
                pass

        # Local SQLite
        conn = sqlite3.connect(self.sqlite_db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        row = cur.fetchone()
        conn.close()
        return dict(row) if row else None

    def delete_document(self, doc_id: str) -> bool:
        """
        Permanently deletes a document and all related records:
        - Chat messages (chat_messages)
        - AI analyses (analyses)
        - Document metadata (documents)
        - ChromaDB vector chunks
        """
        # Delete from ChromaDB
        try:
            from core.rag_service import rag_service
            rag_service.delete_document(doc_id)
        except Exception as e:
            print(f"[RAG] Vector delete notice: {e}")

        # 1. Supabase (explicitly delete child tables first to prevent constraint violations and guarantee zero orphans)
        if self.is_supabase:
            try:
                self.client.table("chat_messages").delete().eq("document_id", doc_id).execute()
            except Exception as e:
                print(f"[Supabase] Error deleting chat_messages: {e}")

            try:
                self.client.table("analyses").delete().eq("document_id", doc_id).execute()
            except Exception as e:
                print(f"[Supabase] Error deleting analyses: {e}")

            try:
                self.client.table("documents").delete().eq("id", doc_id).execute()
            except Exception as e:
                print(f"[Supabase] Error deleting document: {e}")

        # 2. Local SQLite
        try:
            conn = sqlite3.connect(self.sqlite_db_path)
            cur = conn.cursor()
            cur.execute("PRAGMA foreign_keys = ON;")
            cur.execute("DELETE FROM chat_messages WHERE document_id = ?", (doc_id,))
            cur.execute("DELETE FROM analyses WHERE document_id = ?", (doc_id,))
            cur.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[SQLite] Error deleting document: {e}")

        return True

    def delete_user(self, user_id: str) -> bool:
        """
        Permanently deletes a user and cascades to purge ALL associated data:
        - Uploaded PDF documents
        - AI Analyses
        - Chat history
        - ChromaDB vector chunks
        """
        print(f"[DB] Purging all data for user {user_id}...")
        # 1. Find all documents belonging to this user
        docs = self.list_documents(user_id=user_id)
        for doc in docs:
            doc_id = doc.get("id")
            if doc_id:
                self.delete_document(doc_id)

        # 2. Supabase deletion
        if self.is_supabase:
            try:
                self.client.table("documents").delete().eq("user_id", user_id).execute()
                self.client.table("users").delete().eq("id", user_id).execute()
            except Exception as e:
                print(f"[Supabase] Error deleting user: {e}")

        # 3. Local SQLite deletion
        try:
            conn = sqlite3.connect(self.sqlite_db_path)
            cur = conn.cursor()
            cur.execute("PRAGMA foreign_keys = ON;")
            cur.execute("DELETE FROM documents WHERE user_id = ?", (user_id,))
            cur.execute("DELETE FROM users WHERE id = ?", (user_id,))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[SQLite] Error deleting user: {e}")

        return True

    def cleanup_orphaned_documents(self):
        """
        Automatically purges documents and analyses belonging to users
        that were deleted directly from the database.
        """
        try:
            if self.is_supabase:
                u_res = self.client.table("users").select("id").execute()
                valid_user_ids = {u["id"] for u in u_res.data} if u_res.data else set()

                d_res = self.client.table("documents").select("id, user_id").execute()
                if d_res.data:
                    for d in d_res.data:
                        uid = d.get("user_id")
                        if uid and uid not in valid_user_ids:
                            print(f"[Cleanup] Deleting orphaned document {d['id']} of deleted user {uid}")
                            self.delete_document(d["id"])
        except Exception as e:
            print(f"[Cleanup Notice] Supabase orphan cleanup: {e}")

        try:
            conn = sqlite3.connect(self.sqlite_db_path)
            cur = conn.cursor()
            cur.execute("""
                SELECT id FROM documents 
                WHERE user_id IS NOT NULL 
                AND user_id NOT IN (SELECT id FROM users)
            """)
            orphaned = cur.fetchall()
            for (orphaned_id,) in orphaned:
                print(f"[Cleanup SQLite] Deleting orphaned document {orphaned_id}")
                self.delete_document(orphaned_id)
            conn.close()
        except Exception as e:
            print(f"[Cleanup Notice] SQLite orphan cleanup: {e}")

    # ==========================
    # Analyses CRUD
    # ==========================
    def save_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        analysis_id = analysis_data.get("id") or str(uuid.uuid4())
        created_at = analysis_data.get("created_at") or datetime.now(timezone.utc).isoformat()
        
        doc_id = analysis_data["document_id"]
        risk_flags = analysis_data.get("risk_flags", [])
        checklist = analysis_data.get("checklist", [])
        key_clauses = analysis_data.get("key_clauses", {})
        overall_score = analysis_data.get("overall_risk_score", "MEDIUM")
        summary = analysis_data.get("summary", "")

        payload = {
            "id": analysis_id,
            "document_id": doc_id,
            "overall_risk_score": overall_score,
            "summary": summary,
            "risk_flags": risk_flags,
            "checklist": checklist,
            "key_clauses": key_clauses,
            "created_at": created_at
        }

        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("analyses").upsert(payload, on_conflict="document_id").execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase] Error saving analysis: {e}. Falling back to SQLite.")

        # Local SQLite sync/fallback
        conn = sqlite3.connect(self.sqlite_db_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT OR REPLACE INTO analyses (id, document_id, overall_risk_score, summary, risk_flags, checklist, key_clauses, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            analysis_id, doc_id, overall_score, summary,
            json.dumps(risk_flags), json.dumps(checklist), json.dumps(key_clauses), created_at
        ))
        conn.commit()
        conn.close()
        return payload

    def get_analysis(self, doc_id: str) -> Optional[Dict[str, Any]]:
        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("analyses").select("*").eq("document_id", doc_id).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase] Error getting analysis: {e}")

        # Local SQLite
        conn = sqlite3.connect(self.sqlite_db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM analyses WHERE document_id = ?", (doc_id,))
        row = cur.fetchone()
        conn.close()

        if not row:
            return None
        
        data = dict(row)
        try:
            data["risk_flags"] = json.loads(data["risk_flags"]) if isinstance(data["risk_flags"], str) else data["risk_flags"]
            data["checklist"] = json.loads(data["checklist"]) if isinstance(data["checklist"], str) else data["checklist"]
            data["key_clauses"] = json.loads(data["key_clauses"]) if isinstance(data["key_clauses"], str) else data["key_clauses"]
        except Exception:
            pass
        return data

    # ==========================
    # Chat Messages CRUD
    # ==========================
    def save_chat_message(self, doc_id: str, role: str, content: str, sources: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        msg_id = str(uuid.uuid4())
        created_at = datetime.now(timezone.utc).isoformat()
        sources_list = sources or []

        payload = {
            "id": msg_id,
            "document_id": doc_id,
            "role": role,
            "content": content,
            "sources": sources_list,
            "created_at": created_at
        }

        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("chat_messages").insert(payload).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"[Supabase] Error saving chat message: {e}")

        # Local SQLite
        conn = sqlite3.connect(self.sqlite_db_path)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO chat_messages (id, document_id, role, content, sources, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (msg_id, doc_id, role, content, json.dumps(sources_list), created_at))
        conn.commit()
        conn.close()
        return payload

    def get_chat_history(self, doc_id: str, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        # 1. Supabase
        if self.is_supabase:
            try:
                res = self.client.table("chat_messages").select("*").eq("document_id", doc_id).order("created_at", desc=False).range(offset, offset + limit - 1).execute()
                if res.data is not None:
                    return res.data
            except Exception:
                pass

        # Local SQLite
        conn = sqlite3.connect(self.sqlite_db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM chat_messages WHERE document_id = ? ORDER BY created_at ASC LIMIT ? OFFSET ?",
            (doc_id, limit, offset)
        )
        rows = cur.fetchall()
        msgs = []
        for r in rows:
            m = dict(r)
            if isinstance(m.get("sources"), str):
                try:
                    m["sources"] = json.loads(m["sources"])
                except Exception:
                    m["sources"] = []
            msgs.append(m)
        conn.close()
        return msgs

    def clear_chat_history(self, doc_id: str) -> bool:
        # 1. Supabase
        if self.is_supabase:
            try:
                self.client.table("chat_messages").delete().eq("document_id", doc_id).execute()
            except Exception as e:
                print(f"[Supabase] Error clearing chat: {e}")

        # Local SQLite
        conn = sqlite3.connect(self.sqlite_db_path)
        cur = conn.cursor()
        cur.execute("DELETE FROM chat_messages WHERE document_id = ?", (doc_id,))
        conn.commit()
        conn.close()
        return True


# Global singleton instance
db_client = DatabaseClient()
