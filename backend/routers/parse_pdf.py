import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.models.schemas import ScoreResult
from backend.parsers.response_sheet import parse_response_sheet
from backend.parsers.answer_key import parse_answer_key
from backend.parsers.score_calculator import calculate_score

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("/parse-pdf", response_model=ScoreResult)
async def parse_pdf(
    response_sheet: UploadFile = File(...),
    answer_key: UploadFile = File(...)
):
    # 1. Validate File Size (> 10MB)
    response_sheet_bytes = await response_sheet.read()
    answer_key_bytes = await answer_key.read()
    
    if len(response_sheet_bytes) > MAX_FILE_SIZE or len(answer_key_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="This file is too large for a standard NTA response sheet. Please upload only the response PDF."
        )
        
    # 2. Parse Response Sheet
    try:
        responses = parse_response_sheet(response_sheet_bytes)
    except Exception as e:
        logger.error(f"Error parsing response sheet PDF: {e}")
        raise HTTPException(
            status_code=400,
            detail="response_sheet: We couldn't read this PDF. Try downloading a fresh copy from the NTA portal."
        )
        
    # 3. Parse Answer Key
    try:
        answer_keys = parse_answer_key(answer_key_bytes)
    except Exception as e:
        logger.error(f"Error parsing answer key PDF: {e}")
        raise HTTPException(
            status_code=400,
            detail="answer_key: We couldn't read this PDF. Try downloading a fresh copy from the NTA portal."
        )
        
    # 4. Validate Wrong File Format (no question data found)
    if not responses:
        raise HTTPException(
            status_code=400,
            detail="response_sheet: No question data found. Make sure you're uploading the NTA response sheet, not an admit card or other document."
        )
    if not answer_keys:
        raise HTTPException(
            status_code=400,
            detail="answer_key: No question data found. Make sure you're uploading the NTA response sheet, not an admit card or other document."
        )
        
    # 5. Check Question ID mismatch between sheets
    # "X questions had no matching answer key entry — marked as unattempted."
    # We find if there are question IDs in responses that are not in the answer_key.
    mismatched_qids = [qid for qid in responses if qid not in answer_keys]
    mismatch_count = len(mismatched_qids)
    
    # Calculate Score using answer key as base
    result = calculate_score(responses, answer_keys)
    
    if mismatch_count > 0:
        result.warning = f"{mismatch_count} questions had no matching answer key entry — marked as unattempted."
        
    return result
