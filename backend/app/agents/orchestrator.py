import os
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnablePassthrough
from langchain.schema.output_parser import StrOutputParser
from app.agents.retrieval import retrieval_agent
from app.core.config import settings

class AgentOrchestrator:
    def __init__(self):
        # Ensure GEMINI_API_KEY is available in the environment
        if settings.GEMINI_API_KEY:
            os.environ["GOOGLE_API_KEY"] = settings.GEMINI_API_KEY
            
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.2,
            convert_system_message_to_human=True,
            google_api_key=settings.GEMINI_API_KEY,
            max_retries=1
        )
        
        self.prompt_template = PromptTemplate.from_template(
            """You are the Enterprise Knowledge Assistant, a highly intelligent and helpful AI for company employees.
            You have access to the following context extracted from enterprise documents.
            Answer the user's question accurately based ONLY on the provided context.
            If the context does not contain the answer, politely state that you do not know based on the available documents.
            Always include citations (Source filename) when providing facts.

            Context:
            {context}
            
            Conversation History:
            {history}

            User Question: {question}

            Answer:"""
        )
        
        self.chain = (
            self.prompt_template
            | self.llm
            | StrOutputParser()
        )

    async def chat(self, user_message: str, history: str = "") -> tuple[str, list]:
        """Handles a chat message by running the RAG chain."""
        try:
            print(f"Orchestrator chat received message: '{user_message}'")
            # 1. Retrieve context
            loop = asyncio.get_event_loop()
            context_str, citations = await loop.run_in_executor(None, retrieval_agent.retrieve, user_message)
            print(f"Retrieved {len(citations)} citations for query: '{user_message}'")
            
            formatted_prompt = self.prompt_template.format(
                context=context_str,
                history=history,
                question=user_message
            )
            print(f"Constructed Prompt for chat:\n{formatted_prompt}\n")
            
            # 2. Generate response
            response = await self.chain.ainvoke({"question": user_message, "history": history, "context": context_str})
            
            return response, citations
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error in LLM Orchestrator: {e}")
            return "I apologize, but I encountered an error while processing your request. Please ensure the Gemini API key is configured correctly.", []

    async def chat_stream(self, user_message: str, history: str = ""):
        """Handles a chat message by streaming the RAG chain response."""
        try:
            print(f"Orchestrator chat_stream received message: '{user_message}'")
            # 1. Retrieve context asynchronously to avoid blocking the event loop
            loop = asyncio.get_event_loop()
            context_str, citations = await loop.run_in_executor(None, retrieval_agent.retrieve, user_message)
            print(f"Retrieved {len(citations)} citations for query: '{user_message}'")
            
            # Yield citations first
            yield {"type": "citations", "citations": citations}
            
            formatted_prompt = self.prompt_template.format(
                context=context_str,
                history=history,
                question=user_message
            )
            print(f"Constructed Prompt for stream:\n{formatted_prompt}\n")
            
            # 2. Generate response stream
            print(f"Calling LLM stream for query: '{user_message}'")
            async for chunk in self.chain.astream({"question": user_message, "history": history, "context": context_str}):
                yield {"type": "chunk", "content": chunk}
                
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"Error in LLM Orchestrator Streaming: {e}")
            yield {"type": "error", "content": "I apologize, but I encountered an error while processing your request. Please ensure the Gemini API key is configured correctly."}

orchestrator = AgentOrchestrator()
