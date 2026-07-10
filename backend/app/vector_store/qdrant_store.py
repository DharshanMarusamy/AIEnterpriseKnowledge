import uuid
from typing import List
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from sentence_transformers import SentenceTransformer
from app.core.config import settings

class VectorStore:
    def __init__(self, collection_name: str = "enterprise_knowledge"):
        self.client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,  # None for local, required for Qdrant Cloud
        )
        self.collection_name = collection_name
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        self._ensure_collection()

    def _ensure_collection(self):
        try:
            self.client.get_collection(self.collection_name)
        except Exception:
            # Collection does not exist, create it
            # all-MiniLM-L6-v2 produces 384 dimensional vectors
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=qmodels.VectorParams(
                    size=384,
                    distance=qmodels.Distance.COSINE
                )
            )

    def add_documents(self, chunks: List[str], metadatas: List[dict]):
        """Embeds text chunks and stores them in Qdrant."""
        if not chunks:
            return

        embeddings = self.encoder.encode(chunks)
        points = []
        for i, (chunk, embedding, meta) in enumerate(zip(chunks, embeddings, metadatas)):
            point_id = str(uuid.uuid4())
            points.append(qmodels.PointStruct(
                id=point_id,
                vector=embedding.tolist(),
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
        query_vector = self.encoder.encode(query).tolist()
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
