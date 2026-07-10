import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import AsyncSessionLocal
from app.db.models import Department
from sqlalchemy.future import select

async def seed_departments():
    async with AsyncSessionLocal() as db:
        # Check if departments exist
        stmt = select(Department)
        result = await db.execute(stmt)
        departments = result.scalars().all()
        
        if departments:
            print(f"Found {len(departments)} departments. Skipping seed.")
            return

        print("Seeding default departments...")
        depts = [
            Department(name="Finance & Legal", description="Financial and legal documents"),
            Department(name="Human Resources", description="HR policies and employee data"),
            Department(name="Engineering Docs", description="Technical specs and architecture"),
            Department(name="Marketing Assets", description="Brand guidelines and campaigns")
        ]
        
        db.add_all(depts)
        await db.commit()
        print("Successfully seeded departments.")

if __name__ == "__main__":
    asyncio.run(seed_departments())
