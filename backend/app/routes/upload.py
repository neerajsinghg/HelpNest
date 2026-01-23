from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from pathlib import Path
from bson import ObjectId

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Create a unique filename
        filename = f"{ObjectId()}{os.path.splitext(file.filename)[1]}"
        file_path = UPLOAD_DIR / filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # In a real app, you'd serve this statically. 
        # For now we'll assume the backend serves the 'uploads' folder or return relative path.
        # Returning a pseudo-URL. If you serve static files, adjust accordingly.
        # Assuming backend is running on localhost:8000 and we mount uploads
        return {"url": f"/uploads/{filename}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
