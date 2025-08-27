#
# This script tests the FastAPI document endpoints using the 'requests' library.
# It demonstrates how to create, read, update, and delete documents.
#
# IMPORTANT: Before running, ensure your FastAPI server is active.
#

import requests
import json
import sys

# --- Configuration ---
BASE_URL = "http://127.0.0.1:8000"
SUPABASE_UID = "39c8afcf-ffb3-4349-bc70-1ec4c4975deb"

headers = {"Content-Type": "application/json"}


def create_document(title: str, content: str, supabase_uid: str) -> int:
    """Creates a new document and returns its ID."""
    print("\n--- Step 1: Creating a new document ---")
    post_url = f"{BASE_URL}/documents/"
    payload = {"title": title, "content": content, "supabase_uid": supabase_uid}

    try:
        response = requests.post(post_url, headers=headers, data=json.dumps(payload))
        response.raise_for_status()
        doc_data = response.json()
        doc_id = doc_data.get("id")
        print(f"✅ Created document with ID: {doc_id}")
        print(f"Response: {json.dumps(doc_data, indent=2)}\n")
        return doc_id
    except requests.exceptions.RequestException as e:
        print(f"❌ Error creating document: {e}")
        return None


def get_document(doc_id: int, supabase_uid: str):
    """Retrieve a single document by ID."""
    print("\n--- Step 2: Retrieving document by ID ---")
    url = f"{BASE_URL}/documents/{doc_id}?supabase_uid={supabase_uid}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    doc = response.json()
    print(f"✅ Retrieved document {doc_id}")
    print(f"Response: {json.dumps(doc, indent=2)}\n")
    return doc


def get_all_documents(supabase_uid: str):
    """Retrieve all documents for a user."""
    print("\n--- Step 3: Retrieving all documents for user ---")
    url = f"{BASE_URL}/documents/?supabase_uid={supabase_uid}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    docs = response.json()
    print(f"✅ Retrieved {len(docs)} documents")
    print(f"Response: {json.dumps(docs, indent=2)}\n")
    return docs


def update_document(doc_id: int, supabase_uid: str, new_title: str, new_content: str):
    """Update an existing document."""
    print("\n--- Step 4: Updating document ---")
    url = f"{BASE_URL}/documents/{doc_id}?supabase_uid={supabase_uid}"
    payload = {"title": new_title, "content": new_content}
    response = requests.put(url, headers=headers, data=json.dumps(payload))
    response.raise_for_status()
    updated_doc = response.json()
    print(f"✅ Updated document {doc_id}")
    print(f"Response: {json.dumps(updated_doc, indent=2)}\n")
    return updated_doc


def delete_document(doc_id: int, supabase_uid: str):
    """Delete a document."""
    print("\n--- Step 5: Deleting document ---")
    url = f"{BASE_URL}/documents/{doc_id}?supabase_uid={supabase_uid}"
    response = requests.delete(url, headers=headers)
    response.raise_for_status()
    print(f"✅ Deleted document {doc_id}")
    print(f"Response: {json.dumps(response.json(), indent=2)}\n")


if __name__ == "__main__":
    try:
        # 1. Create a new document
        doc_id = create_document("Test Document", "This is content for testing.", SUPABASE_UID)
        if not doc_id:
            print("❌ Aborting tests: Could not create document")
            sys.exit(1)

        # 2. Get the document by ID
        get_document(doc_id, SUPABASE_UID)

        # 3. Get all documents for user
        get_all_documents(SUPABASE_UID)

        # 4. Update the document
        update_document(doc_id, SUPABASE_UID, "Updated Title", "Updated Content")

        # 5. Delete the document
        delete_document(doc_id, SUPABASE_UID)

        # 6. Verify deletion
        print("\n--- Step 6: Verifying deletion ---")
        try:
            get_document(doc_id, SUPABASE_UID)
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                print(f"✅ Verified: Document {doc_id} was deleted successfully\n")
            else:
                raise

    except Exception as e:
        print(f"❌ Test run failed: {e}")
