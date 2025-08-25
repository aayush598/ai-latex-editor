import sqlite3
from typing import List, Optional
from app.models.document import DB_PATH

def create_document(title: str, content: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO documents (title, content) VALUES (?, ?)", (title, content))
    conn.commit()
    doc_id = cursor.lastrowid
    conn.close()
    return doc_id

def get_document(doc_id: int) -> Optional[dict]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content FROM documents WHERE id=?", (doc_id,))
    row = cursor.fetchone()
    conn.close()
    return {"id": row[0], "title": row[1], "content": row[2]} if row else None

def get_all_documents() -> List[dict]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, content FROM documents")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "title": r[1], "content": r[2]} for r in rows]

def update_document(doc_id: int, title: Optional[str], content: Optional[str]) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM documents WHERE id=?", (doc_id,))
    if not cursor.fetchone():
        conn.close()
        return False

    if title:
        cursor.execute("UPDATE documents SET title=? WHERE id=?", (title, doc_id))
    if content:
        cursor.execute("UPDATE documents SET content=? WHERE id=?", (content, doc_id))
    conn.commit()
    conn.close()
    return True

def delete_document(doc_id: int) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM documents WHERE id=?", (doc_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

# ---- COMMENTS CRUD ----

def add_comment(document_id: int, line_number: int, comment: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Ensure document exists
    cursor.execute("SELECT id FROM documents WHERE id=?", (document_id,))
    if not cursor.fetchone():
        conn.close()
        raise ValueError("Document does not exist")

    cursor.execute(
        "INSERT INTO comments (document_id, line_number, comment) VALUES (?, ?, ?)",
        (document_id, line_number, comment)
    )
    conn.commit()
    comment_id = cursor.lastrowid
    conn.close()
    return comment_id


def get_comments(document_id: int) -> List[dict]:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, line_number, comment, created_at FROM comments WHERE document_id=?",
        (document_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [
        {"id": r[0], "line_number": r[1], "comment": r[2], "created_at": r[3]}
        for r in rows
    ]


def delete_comment(comment_id: int) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM comments WHERE id=?", (comment_id,))
    conn.commit()
    deleted = cursor.rowcount > 0
    conn.close()
    return deleted

# --- USERS CRUD ---

def get_or_create_user(supabase_uid: str, email: str, provider: str) -> dict:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT id, supabase_uid, email, provider, role FROM users WHERE supabase_uid=?", (supabase_uid,))
    row = cursor.fetchone()

    if row:
        conn.close()
        return {"id": row[0], "supabase_uid": row[1], "email": row[2], "provider": row[3], "role": row[4]}

    cursor.execute(
        "INSERT INTO users (supabase_uid, email, provider) VALUES (?, ?, ?)",
        (supabase_uid, email, provider)
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return {"id": user_id, "supabase_uid": supabase_uid, "email": email, "provider": provider, "role": "user"}


def save_session(user_id: int, access_token: str, refresh_token: str, expires_at: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sessions (user_id, access_token, refresh_token, expires_at) VALUES (?, ?, ?, ?)",
        (user_id, access_token, refresh_token, expires_at)
    )
    conn.commit()
    conn.close()
