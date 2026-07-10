from langchain.text_splitter import RecursiveCharacterTextSplitter

class DocumentChunker:
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

    def chunk_text(self, text: str) -> list[str]:
        """Splits a large text into smaller chunks."""
        return self.text_splitter.split_text(text)
