import fitz
import os
import random

os.makedirs("test_dataset", exist_ok=True)

departments = ["HR", "Engineering", "Finance", "Sales", "Legal", "Marketing", "IT"]
doc_types = ["Policy", "Report", "Guidelines", "Memo", "Handbook", "Review", "Strategy"]

templates = {
    "Policy": "This document outlines the official {dept} policy regarding {topic}. All employees must adhere to these guidelines to ensure compliance and operational efficiency.",
    "Report": "Q{quarter} {dept} Performance Report.\n\nMetrics indicate a {trend} trend in {topic}. We expect this trajectory to continue into the next fiscal year.",
    "Guidelines": "{dept} Best Practices and Guidelines.\n\nWhen handling {topic}, it is critical to follow the standard operating procedures. Ensure all steps are documented.",
    "Memo": "MEMORANDUM\nTo: All Staff\nFrom: {dept} Dept\n\nSubject: Updates on {topic}\n\nPlease be advised of the recent changes to our internal processes...",
    "Handbook": "The {dept} Employee Handbook.\n\nWelcome! This section covers everything you need to know about {topic} and how our department operates.",
    "Review": "Annual {dept} Review.\n\nAn in-depth analysis of {topic} reveals key areas for improvement and celebrates our milestones.",
    "Strategy": "{dept} Strategic Vision 2026.\n\nOur primary objective is to revolutionize {topic}. This strategy document details the roadmap."
}

topics = {
    "HR": ["Employee Benefits", "Workplace Harassment", "Remote Work", "Performance Reviews", "Onboarding"],
    "Engineering": ["System Architecture", "Code Reviews", "Deployment Pipelines", "Security Protocols", "Agile Methodology"],
    "Finance": ["Q3 Revenue", "Budget Allocation", "Expense Reimbursement", "Tax Compliance", "Vendor Contracts"],
    "Sales": ["Client Acquisition", "Q2 Targets", "Pitch Deck", "Lead Generation", "CRM Usage"],
    "Legal": ["NDA Agreements", "Data Privacy", "Compliance Audits", "Intellectual Property", "Contract Templates"],
    "Marketing": ["Brand Identity", "Social Media Strategy", "Campaign Launch", "SEO Analytics", "Content Calendar"],
    "IT": ["Network Security", "Hardware Provisioning", "Helpdesk SLA", "Software Licensing", "Cloud Infrastructure"]
}

for i in range(1, 51):
    dept = random.choice(departments)
    doc_type = random.choice(doc_types)
    topic = random.choice(topics[dept])
    
    title = f"{dept}_{topic.replace(' ', '_')}_{doc_type}_{i}"
    content_template = templates[doc_type]
    
    trend = random.choice(["positive", "negative", "stable"])
    quarter = random.choice([1, 2, 3, 4])
    
    body = content_template.format(dept=dept, topic=topic, trend=trend, quarter=quarter)
    full_text = f"{title.replace('_', ' ')}\n\n{body}\n\n[End of Document ID: {i:03d}]"
    
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), full_text, fontsize=12)
    
    filepath = os.path.join("test_dataset", f"{title}.pdf")
    doc.save(filepath)

print("Successfully generated 50 PDF files in 'test_dataset/'")
