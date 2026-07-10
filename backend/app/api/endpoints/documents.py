from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
from app.db.models import Document, User
from app.services.document_parser import DocumentParser
from app.rag.chunker import DocumentChunker
from app.vector_store.qdrant_store import vector_store_client
import os
import uuid
from fastapi.responses import FileResponse

router = APIRouter()

async def process_document_background(doc_id: int, file_content: bytes, filename: str, db: AsyncSession):
    """Background task to extract text, chunk, and embed."""
    try:
        # 1. Parse text
        text = DocumentParser.extract_text(file_content, filename)
        
        # 2. Update DB with extracted text
        stmt = select(Document).where(Document.id == doc_id)
        result = await db.execute(stmt)
        document = result.scalar_one_or_none()
        
        if document:
            document.content_text = text
            await db.commit()
            
            # 3. Chunk text
            chunker = DocumentChunker(chunk_size=1000, chunk_overlap=200)
            chunks = chunker.chunk_text(text)
            
            # 4. Embed and store in Qdrant
            metadatas = [
                {
                    "document_id": doc_id,
                    "filename": filename,
                    "chunk_index": i
                }
                for i in range(len(chunks))
            ]
            
            vector_store_client.add_documents(chunks, metadatas)
            print(f"Successfully processed document {doc_id} into {len(chunks)} chunks.")
            
    except Exception as e:
        print(f"Error processing document {doc_id} in background: {e}")

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
    # current_user: User = Depends(get_current_user) # Add auth later
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename missing")
        
    content = await file.read()
    
    # Save to "local storage" for now
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as f:
        f.write(content)

    # Map prefix to department
    prefix_to_dept = {
        "Engineering": "Engineering Docs",
        "Finance": "Finance & Legal",
        "Legal": "Finance & Legal",
        "HR": "Human Resources",
        "Marketing": "Marketing Assets",
        "Sales": "Marketing Assets",
        "IT": "Engineering Docs"
    }
    
    prefix = file.filename.split("_")[0] if file.filename else ""
    dept_name = prefix_to_dept.get(prefix)
    department_id = None
    
    if dept_name:
        from app.db.models import Department
        stmt = select(Department).where(Department.name == dept_name)
        result = await db.execute(stmt)
        dept = result.scalar_one_or_none()
        if dept:
            department_id = dept.id

    # Save metadata to DB
    new_doc = Document(
        title=file.filename,
        filename=file.filename,
        file_type=file.content_type,
        upload_path=file_path,
        uploaded_by=1, # Hardcode for now until auth is fully implemented
        department_id=department_id
    )
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    
    # Process in background
    background_tasks.add_task(process_document_background, new_doc.id, content, file.filename, db)
    
    return {"message": "File uploaded successfully. Processing in background.", "document_id": new_doc.id}

@router.get("/")
async def list_documents(db: AsyncSession = Depends(get_db)):
    stmt = select(Document)
    result = await db.execute(stmt)
    documents = result.scalars().all()
    
    return [
        {
            "id": d.id,
            "title": d.title,
            "filename": d.filename,
            "file_type": d.file_type,
            "department_id": d.department_id,
            "upload_path": d.upload_path,
            "created_at": d.created_at,
            "uploaded_by": d.uploaded_by
        } for d in documents
    ]

@router.get("/{document_id}/download")
async def download_document(document_id: int, db: AsyncSession = Depends(get_db)):
    stmt = select(Document).where(Document.id == document_id)
    document = (await db.execute(stmt)).scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if not document.upload_path or not os.path.exists(document.upload_path):
        raise HTTPException(status_code=404, detail="File missing from storage")
        
    return FileResponse(
        path=document.upload_path,
        filename=document.filename,
        media_type=document.file_type or "application/octet-stream"
    )

@router.delete("/{document_id}")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a document: remove from DB, disk, and Qdrant vector store."""
    stmt = select(Document).where(Document.id == document_id)
    result = await db.execute(stmt)
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # 1. Remove from disk
    if document.upload_path and os.path.exists(document.upload_path):
        try:
            os.remove(document.upload_path)
        except OSError as e:
            print(f"Warning: Could not delete file {document.upload_path}: {e}")
    
    # 2. Remove vectors from Qdrant (filter by document_id metadata)
    try:
        from qdrant_client.models import Filter, FieldCondition, MatchValue
        vector_store_client.client.delete(
            collection_name=vector_store_client.collection_name,
            points_selector=Filter(
                must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
            )
        )
        print(f"Removed Qdrant vectors for document {document_id}")
    except Exception as e:
        print(f"Warning: Could not remove Qdrant vectors for doc {document_id}: {e}")
    
    # 3. Delete from DB
    await db.delete(document)
    await db.commit()
    
    return {"message": f"Document {document_id} deleted successfully."}

