import fitz  # PyMuPDF
import os

docs = [
    ("Employee_Handbook.pdf", "Employee Handbook\n\nWelcome to the company! Please read our guidelines on vacation, benefits, and conduct."),
    ("Financial_Q3_Report.pdf", "Q3 Financial Report\n\nRevenue increased by 15% this quarter. Operating expenses were reduced by 5%."),
    ("Engineering_Guidelines.pdf", "Engineering Guidelines\n\nAll code must be reviewed by at least two senior engineers before merging to main."),
    ("Security_Policy.pdf", "Security Policy\n\nPasswords must be rotated every 90 days. Do not share your access tokens."),
    ("Benefits_Overview.pdf", "Benefits Overview\n\nWe offer health, dental, and vision insurance. 401k matching is up to 5%.")
]

os.makedirs("test_pdfs", exist_ok=True)

for filename, text in docs:
    doc = fitz.open()  # new empty PDF
    page = doc.new_page()  # new page
    page.insert_text((50, 50), text, fontsize=12)
    filepath = os.path.join("test_pdfs", filename)
    doc.save(filepath)
    print(f"Created {filepath}")
