from app.vector_store.qdrant_store import vector_store_client

class RetrievalAgent:
    @staticmethod
    def retrieve(query: str, top_k: int = 5) -> tuple[str, list]:
        """
        Retrieves relevant context from the vector store based on the query.
        Returns a tuple of (formatted string of the context, list of citations).
        """
        results = vector_store_client.search(query=query, limit=top_k)
        
        if not results:
            return "No relevant context found in enterprise documents.", []
            
        context_str = ""
        citations = []
        for i, hit in enumerate(results):
            payload = hit['payload']
            text = payload.get('text', '')
            filename = payload.get('filename', 'Unknown')
            # Assuming hit['score'] is a cosine similarity or similar metric 0-1
            score = hit.get('score', 0.85)
            confidence = int(score * 100) if score <= 1.0 else min(int(score), 99)
            
            context_str += f"[Source: {filename}]\n{text}\n\n"
            citations.append({"id": f"c{i}", "title": filename, "confidence": confidence})
            
        return context_str, citations

retrieval_agent = RetrievalAgent()
