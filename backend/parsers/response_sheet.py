import io
import re
import pdfplumber
from typing import Dict, Optional

def clean_key(k: str) -> str:
    """Normalize keys for matching (e.g., 'Question ID :' -> 'questionid')."""
    if not k:
        return ""
    # Remove all non-alphanumeric characters and lowercase
    return re.sub(r'[^a-zA-Z0-9]', '', k).lower()

def clean_val(v: str) -> str:
    """Clean and strip values."""
    if not v:
        return ""
    return v.strip()

def parse_response_sheet(pdf_bytes: bytes) -> Dict[str, Optional[str]]:
    """
    Parses a CUET NTA candidate response sheet PDF.
    Returns a dictionary mapping question_id -> chosen_option_id (or None if unattempted).
    """
    responses = {}
    
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page_num, page in enumerate(pdf.pages):
            tables = page.extract_tables() or []
            for table in tables:
                if not table:
                    continue
                
                # Check column count
                num_cols = len(table[0]) if table and len(table) > 0 else 0
                if num_cols == 2:
                    # Case 1: Key-Value layout (common for NTA question metadata boxes)
                    # We group rows into blocks or just collect key-values if it's a single question table.
                    block = {}
                    for row in table:
                        if len(row) == 2 and row[0] is not None and row[1] is not None:
                            k = clean_key(row[0])
                            v = clean_val(row[1])
                            block[k] = v
                    
                    if "questionid" in block:
                        qid = block["questionid"]
                        status = block.get("status", "").lower()
                        chosen = block.get("chosenoption", "")
                        
                        # Check if attempted
                        is_answered = "answered" in status and "not" not in status
                        
                        if is_answered and chosen and chosen != "--" and chosen != "blank":
                            # Match option ID
                            # Chosen option is typically 1, 2, 3, 4
                            option_key = f"option{chosen}id"
                            if option_key in block:
                                responses[qid] = block[option_key]
                            else:
                                # Fallback: if chosen option is already an ID (long number)
                                if len(chosen) > 5:
                                    responses[qid] = chosen
                                else:
                                    responses[qid] = None
                        else:
                            responses[qid] = None
                            
                elif num_cols >= 5:
                    # Case 2: Tabular layout
                    # Find header row
                    header_row_idx = -1
                    for idx, row in enumerate(table):
                        row_cleaned = [clean_key(cell or "") for cell in row]
                        if "questionid" in row_cleaned or "qid" in row_cleaned:
                            header_row_idx = idx
                            break
                    
                    if header_row_idx != -1:
                        headers = [clean_key(cell or "") for cell in table[header_row_idx]]
                        # Locate indexes
                        try:
                            qid_idx = headers.index("questionid")
                        except ValueError:
                            try:
                                qid_idx = headers.index("qid")
                            except ValueError:
                                continue
                        
                        # Try to find Option IDs and Chosen Option
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
                        
                        # Process data rows
                        for row in table[header_row_idx + 1:]:
                            if len(row) <= max([qid_idx, status_idx, chosen_idx] + list(opt_idxs.values())):
                                continue
                            
                            qid = clean_val(row[qid_idx])
                            if not qid or not qid.isdigit():
                                continue
                            
                            status = clean_val(row[status_idx]).lower() if status_idx != -1 else ""
                            chosen = clean_val(row[chosen_idx]) if chosen_idx != -1 else ""
                            
                            is_answered = "answered" in status and "not" not in status
                            if not status and chosen: # Fallback if status column is empty/missing but chosen is present
                                is_answered = True
                                
                            if is_answered and chosen and chosen != "--" and chosen != "blank":
                                if chosen in opt_idxs and len(opt_idxs) > 0:
                                    opt_col_idx = opt_idxs[chosen]
                                    responses[qid] = clean_val(row[opt_col_idx])
                                elif len(chosen) > 5:
                                    # Already an Option ID
                                    responses[qid] = chosen
                                else:
                                    responses[qid] = None
                            else:
                                responses[qid] = None

    # Fallback to plain text scraping if tables were not found or yielded nothing
    if not responses:
        # Sometimes NTA PDFs are structured as absolute positioned elements where tables don't extract properly.
        # Let's write a regex fallback scanner on the raw text.
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""
            
            # Find Question Blocks using regex
            # Example text pattern:
            # Question ID : 2268953022629
            # Option 1 ID : 2268953022631
            # Option 2 ID : 2268953022632
            # Option 3 ID : 2268953022633
            # Option 4 ID : 2268953022634
            # Status : Answered
            # Chosen Option : 2
            blocks = re.split(r'Question\s*ID\s*:', full_text, flags=re.IGNORECASE)
            # The first split part is header info, ignore it.
            for block_text in blocks[1:]:
                # Extract Question ID
                qid_match = re.match(r'^\s*(\d+)', block_text)
                if not qid_match:
                    continue
                qid = qid_match.group(1)
                
                # Extract Option IDs
                options = {}
                for i in range(1, 5):
                    opt_match = re.search(r'Option\s*' + str(i) + r'\s*ID\s*:\s*(\d+)', block_text, re.IGNORECASE)
                    if opt_match:
                        options[str(i)] = opt_match.group(1)
                
                # Extract Status
                status_match = re.search(r'Status\s*:\s*([^\n]+)', block_text, re.IGNORECASE)
                status = status_match.group(1).strip().lower() if status_match else ""
                
                # Extract Chosen Option
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
                    
    return responses
