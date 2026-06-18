import os
import re
import html
from fastapi import UploadFile, HTTPException

def validate_alphanumeric_dashed(value: str, max_len: int = 100) -> str:
    """
    Validates that a path/query parameter is alphanumeric and only contains
    spaces, dashes, and underscores. Sanitizes output with HTML escaping.
    """
    if not value or len(value) > max_len:
        raise HTTPException(
            status_code=400, 
            detail=f"Parameter length must be between 1 and {max_len} characters."
        )
    # Allow alphanumeric, spaces, hyphens, and underscores
    if not re.match(r"^[a-zA-Z0-9\s\-_]+$", value):
        raise HTTPException(
            status_code=400, 
            detail="Parameter contains invalid characters. Only alphanumeric, spaces, hyphens, and underscores are allowed."
        )
    return html.escape(value.strip())

def validate_uploaded_file(file: UploadFile, allowed_mimes: list[str], max_size_bytes: int):
    """
    Validates uploaded file size, extension, and MIME type to protect against DoS
    and malicious file execution.
    """
    # 1. Validate file size using seek/tell (no memory/CPU overhead)
    try:
        file.file.seek(0, 2)  # seek to end
        size = file.file.tell()  # get position
        file.file.seek(0)  # reset file pointer to start
    except Exception as e:
        raise HTTPException(status_code=400, detail="Unable to read file size metadata.")

    if size > max_size_bytes:
        max_mb = max_size_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=400, 
            detail=f"File exceeds maximum allowed size of {max_mb}MB."
        )
    if size == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 2. Validate MIME type
    mime_type = file.content_type
    if not mime_type:
        raise HTTPException(status_code=400, detail="Missing MIME Content-Type header.")

    if mime_type not in allowed_mimes:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: '{mime_type}'. Allowed types: {', '.join(allowed_mimes)}"
        )

    # 3. Validate file extension matches the expected MIME type
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    
    mime_to_exts = {
        "image/jpeg": [".jpg", ".jpeg"],
        "image/png": [".png"],
        "image/webp": [".webp"],
        "application/pdf": [".pdf"],
        "audio/webm": [".webm"],
        "video/webm": [".webm"],  # some audio recorders upload webm video format
        "audio/wav": [".wav"],
        "audio/x-wav": [".wav"],
        "audio/mpeg": [".mp3"],
        "audio/ogg": [".ogg"],
        "application/octet-stream": [".webm", ".wav", ".mp3", ".ogg", ".png", ".jpg", ".jpeg", ".pdf"]
    }

    # Fetch corresponding extensions for the current mime type
    expected_exts = mime_to_exts.get(mime_type, [])
    if expected_exts and ext not in expected_exts:
        raise HTTPException(
            status_code=400, 
            detail=f"File extension '{ext}' does not match expected extensions for MIME type '{mime_type}'."
        )
