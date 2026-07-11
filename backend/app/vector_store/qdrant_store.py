import uuid
from typing import List
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
import google.generativeai as genai
from app.core.config import settings

# Initialize Gemini SDK with the API Key
genai.configure(api_key=settings.GEMINI_API_KEY)

class VectorStore:
    def __init__(self, collection_name: str = "enterprise_knowledge_gemini"):
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,  # None for local, required for Qdrant Cloud
        )
        self.collection_name = collection_name
        self.embedding_model = "models/text-embedding-004"
        self._ensure_collection()

    def _get_gemini_embeddings(self, texts: List[str], task_type: str) -> List[List[float]]:
        response = genai.embed_content(
            model=self.embedding_model,
            content=texts,
            task_type=task_type
        )
        return response['embedding']

    def _ensure_collection(self):
        try:
            self.client.get_collection(self.collection_name)
        except Exception:
            # Collection does not exist, create it
            # Gemini text-embedding-004 produces 768 dimensional vectors
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=768,
                    distance=qmodels.Distance.COSINE
                )
            )

    def add_documents(self, chunks: List[str], metadatas: List[dict]):
        """Embeds text chunks and stores them in Qdrant."""
        if not chunks:
            return

        # Use task_type="retrieval_document" for documents stored in the DB
        embeddings = self._get_gemini_embeddings(chunks, task_type="retrieval_document")
        points = []
        for i, (chunk, embedding, meta) in enumerate(zip(chunks, embeddings, metadatas)):
            point_id = str(uuid.uuid4())
            points.append(qmodels.PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "text": chunk,
                    **meta
                }
            ))

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )

    def search(self, query: str, limit: int = 5) -> List[dict]:
        """Searches for similar chunks."""
        print(f"Embedding query: '{query}'")
        # Use task_type="retrieval_query" for search queries
        query_vector = self._get_gemini_embeddings([query], task_type="retrieval_query")[0]
        
        print(f"Querying Qdrant for embedded vector of query '{query}'")
        results = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit
        )
        print(f"Qdrant returned {len(results)} hits for query '{query}'")
        
        return [
            {
                "id": hit.id,
                "score": hit.score,
                "payload": hit.payload
            }
            for hit in results
        ]

vector_store_client = VectorStore()
