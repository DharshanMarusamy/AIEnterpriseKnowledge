import os
import httpx
import time
import asyncio

async def upload_files():
    dataset_dir = "test_dataset"
    url = "http://localhost:8000/api/v1/documents/upload"
    
    if not os.path.exists(dataset_dir):
        print(f"Directory {dataset_dir} does not exist.")
        return

    files = [f for f in os.listdir(dataset_dir) if f.endswith(".pdf")]
    print(f"Found {len(files)} files to upload.")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for i, filename in enumerate(files, 1):
            filepath = os.path.join(dataset_dir, filename)
            with open(filepath, "rb") as f:
                files_param = {"file": (filename, f, "application/pdf")}
                try:
                    response = await client.post(url, files=files_param)
                    if response.status_code == 200:
                        print(f"[{i}/{len(files)}] Uploaded {filename}")
                    else:
                        print(f"[{i}/{len(files)}] Failed {filename}: {response.status_code} {response.text}")
                except Exception as e:
                    print(f"[{i}/{len(files)}] Error uploading {filename}: {str(e)}")
            await asyncio.sleep(0.2)

if __name__ == "__main__":
    asyncio.run(upload_files())
