import fitz  # PyMuPDF
from docx import Document as DocxDocument
import io
import os

class DocumentParser:
    @staticmethod
    def parse_pdf(file_content: bytes) -> str:
        """Extracts text from a PDF file."""
        text = ""
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            return ""

    @staticmethod
    def parse_docx(file_content: bytes) -> str:
        """Extracts text from a DOCX file."""
        text = ""
        try:
            doc = DocxDocument(io.BytesIO(file_content))
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            print(f"Error parsing DOCX: {e}")
            return ""

    @staticmethod
    def parse_text(file_content: bytes) -> str:
        """Extracts text from a TXT file."""
        try:
            return file_content.decode('utf-8')
        except UnicodeDecodeError:
            return file_content.decode('latin-1')
        except Exception as e:
            print(f"Error parsing text: {e}")
            return ""

    @classmethod
    def extract_text(cls, file_content: bytes, filename: str) -> str:
        """Routes to the appropriate parser based on file extension."""
        ext = os.path.splitext(filename)[1].lower()
        if ext == '.pdf':
            return cls.parse_pdf(file_content)
        elif ext in ['.docx', '.doc']:
            return cls.parse_docx(file_content)
        elif ext in ['.txt', '.md', '.csv']:
            return cls.parse_text(file_content)
        else:
            raise ValueError(f"Unsupported file format: {ext}")
