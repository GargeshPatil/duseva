import logging
import httpx
from bs4 import BeautifulSoup
from fastapi import APIRouter, HTTPException
from backend.models.schemas import ScoreResult, BreakdownItem
from backend.parsers.response_sheet import clean_key, clean_val

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/fetch-url", response_model=ScoreResult)
async def fetch_url(request_body: dict):
    url = request_body.get("url")
    if not url:
        raise HTTPException(status_code=400, detail="URL is required.")
        
    # 1. Fetch URL with Browser User-Agent
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/115.0.0.0 Safari/537.36"
        )
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=10.0, follow_redirects=True)
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="The NTA portal requires you to be logged in. Please download the PDF instead."
            )
    except Exception as e:
        logger.error(f"Error fetching NTA URL {url}: {e}")
        raise HTTPException(
            status_code=400,
            detail="The NTA portal requires you to be logged in. Please download the PDF instead."
        )
        
    # 2. Parse HTML
    html_content = response.text
    soup = BeautifulSoup(html_content, "html.parser")
    
    responses = {}
    
    # Extract tables
    tables = soup.find_all("table")
    for table in tables:
        rows = table.find_all("tr")
        if not rows:
            continue
            
        # Check column count of first row
        first_row_cells = rows[0].find_all(["td", "th"])
        num_cols = len(first_row_cells)
        
        if num_cols == 2:
            # Key-Value question block
            block = {}
            for row in rows:
                cells = row.find_all(["td", "th"])
                if len(cells) == 2:
                    k = clean_key(cells[0].get_text())
                    v = clean_val(cells[1].get_text())
                    block[k] = v
                    
            if "questionid" in block:
                qid = block["questionid"]
                status = block.get("status", "").lower()
                chosen = block.get("chosenoption", "")
                
                is_answered = "answered" in status and "not" not in status
                if is_answered and chosen and chosen != "--" and chosen != "blank":
                    option_key = f"option{chosen}id"
                    if option_key in block:
                        responses[qid] = block[option_key]
                    elif len(chosen) > 5:
                        responses[qid] = chosen
                    else:
                        responses[qid] = None
                else:
                    responses[qid] = None
                    
        elif num_cols >= 5:
            # Tabular layout
            # Find headers
            header_row_idx = -1
            for idx, row in enumerate(rows):
                cells = [clean_key(c.get_text()) for c in row.find_all(["td", "th"])]
                if "questionid" in cells or "qid" in cells:
                    header_row_idx = idx
                    break
                    
            if header_row_idx != -1:
                headers = [clean_key(c.get_text()) for c in rows[header_row_idx].find_all(["td", "th"])]
                try:
                    qid_idx = headers.index("questionid")
                except ValueError:
                    try:
                        qid_idx = headers.index("qid")
                    except ValueError:
                        continue
                        
                opt_idxs = {}
                for i in range(1, 5):
                    for h_idx, h in enumerate(headers):
                        if f"option{i}id" in h or f"opt{i}id" in h:
                            opt_idxs[str(i)] = h_idx
                            
                status_idx = -1
                for h_idx, h in enumerate(headers):
                    if "status" in h:
                        status_idx = h_idx
                        break
                        
                chosen_idx = -1
                for h_idx, h in enumerate(headers):
                    if "chosen" in h or "response" in h or "answer" in h:
                        chosen_idx = h_idx
                        break
                        
                for row in rows[header_row_idx + 1:]:
                    cells = row.find_all(["td", "th"])
                    if len(cells) <= max([qid_idx, status_idx, chosen_idx] + list(opt_idxs.values())):
                        continue
                        
                    qid = clean_val(cells[qid_idx].get_text())
                    if not qid or not qid.isdigit():
                        continue
                        
                    status = clean_val(cells[status_idx].get_text()).lower() if status_idx != -1 else ""
                    chosen = clean_val(cells[chosen_idx].get_text()) if chosen_idx != -1 else ""
                    
                    is_answered = "answered" in status and "not" not in status
                    if not status and chosen:
                        is_answered = True
                        
                    if is_answered and chosen and chosen != "--" and chosen != "blank":
                        if chosen in opt_idxs:
                            opt_col_idx = opt_idxs[chosen]
                            responses[qid] = clean_val(cells[opt_col_idx].get_text())
                        elif len(chosen) > 5:
                            responses[qid] = chosen
                        else:
                            responses[qid] = None
                    else:
                        responses[qid] = None

    # Fallback to scraping text for questions if tables didn't yield anything
    if not responses:
        full_text = soup.get_text()
        blocks = re.split(r'Question\s*ID\s*:', full_text, flags=re.IGNORECASE)
        for block_text in blocks[1:]:
            qid_match = re.match(r'^\s*(\d+)', block_text)
            if not qid_match:
                continue
            qid = qid_match.group(1)
            
            options = {}
            for i in range(1, 5):
                opt_match = re.search(r'Option\s*' + str(i) + r'\s*ID\s*:\s*(\d+)', block_text, re.IGNORECASE)
                if opt_match:
                    options[str(i)] = opt_match.group(1)
            
            status_match = re.search(r'Status\s*:\s*([^\n]+)', block_text, re.IGNORECASE)
            status = status_match.group(1).strip().lower() if status_match else ""
            
            chosen_match = re.search(r'Chosen\s*Option\s*:\s*([^\n]+)', block_text, re.IGNORECASE)
            chosen = chosen_match.group(1).strip() if chosen_match else ""
            
            is_answered = "answered" in status and "not" not in status
            if is_answered and chosen and chosen != "--" and chosen != "blank":
                if chosen in options:
                    responses[qid] = options[chosen]
                elif len(chosen) > 5 and chosen.isdigit():
                    responses[qid] = chosen
                else:
                    responses[qid] = None
            else:
                responses[qid] = None

    # 3. Validate format (no question data found)
    if not responses:
        raise HTTPException(
            status_code=400,
            detail="No question data found. Make sure you're uploading the NTA response sheet, not an admit card or other document."
        )
        
    # 4. Map to ScoreResult format (response sheet data only)
    breakdown = []
    for qid, student_ans in responses.items():
        breakdown.append(
            BreakdownItem(
                question_id=qid,
                student_answer=student_ans,
                correct_answer="",  # Empty on fetch-url
                status="unattempted",  # Default status
                marks_awarded=0
            )
        )
        
    return ScoreResult(
        score=0,
        correct=0,
        wrong=0,
        unattempted=len(responses),
        max_possible=len(responses) * 5,
        breakdown=breakdown
    )
