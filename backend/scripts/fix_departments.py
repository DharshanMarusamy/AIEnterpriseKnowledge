import asyncio
import os
import sys

# Ensure backend directory is in path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.db.database import AsyncSessionLocal
from app.db.models import Document, Department
from sqlalchemy.future import select

async def fix_departments():
    async with AsyncSessionLocal() as session:
        # Fetch all departments
        result = await session.execute(select(Department))
        depts = result.scalars().all()
        dept_map = {d.name: d.id for d in depts}
        
        prefix_to_dept = {
            "Engineering": "Engineering Docs",
            "Finance": "Finance & Legal",
            "Legal": "Finance & Legal",
            "HR": "Human Resources",
            "Marketing": "Marketing Assets",
            "Sales": "Marketing Assets", # Grouping sales with marketing
            "IT": "Engineering Docs" # Grouping IT with engineering
        }
        
        result = await session.execute(select(Document).where(Document.department_id == None))
        docs = result.scalars().all()
        
        updated = 0
        for doc in docs:
            prefix = doc.filename.split("_")[0]
            dept_name = prefix_to_dept.get(prefix)
            if dept_name and dept_name in dept_map:
                doc.department_id = dept_map[dept_name]
                updated += 1
                
        await session.commit()
        print(f"Updated {updated} documents with department_ids.")

if __name__ == "__main__":
    asyncio.run(fix_departments())
