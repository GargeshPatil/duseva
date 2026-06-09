import io
import re
import pdfplumber
from typing import Dict, List, Union

def clean_key(k: str) -> str:
    """Normalize headers/keys for matching."""
    if not k:
        return ""
    return re.sub(r'[^a-zA-Z0-9]', '', k).lower()

def clean_val(v: str) -> str:
    """Clean and strip cell values."""
    if not v:
        return ""
    return v.strip()

def parse_answer_key(pdf_bytes: bytes) -> Dict[str, Union[str, List[str]]]:
    """
    Parses an official CUET NTA answer key PDF.
    Returns a dictionary mapping question_id -> correct_option_id (or list of correct_option_ids).
    Supports multi-column side-by-side tables.
    """
    answer_key = {}
    
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables() or []
            for table in tables:
                if not table or len(table) < 2:
                    continue
                
                # Check for header row
                header_row_idx = -1
                for idx, row in enumerate(table):
                    row_cleaned = [clean_key(cell or "") for cell in row]
                    if any("questionid" in cell or "qid" in cell or "qno" in cell for cell in row_cleaned):
                        header_row_idx = idx
                        break
                
                if header_row_idx == -1:
                    # Fallback: assume the first row might be headers
                    header_row_idx = 0
                
                headers = [clean_key(cell or "") for cell in table[header_row_idx]]
                
                # Find all Question ID and Correct Option ID column indices
                qid_cols = []
                ans_cols = []
                
                for i, h in enumerate(headers):
                    if "questionid" in h or "qid" in h or "qno" in h or "questionnumber" in h:
                        qid_cols.append(i)
                    elif "correctoptionid" in h or "correctoption" in h or "correctopt" in h or "answerid" in h or "correctanswer" in h:
                        ans_cols.append(i)
                
                # If we couldn't find explicit matches, use columns containing digits to guess
                if not qid_cols or not ans_cols:
                    # Let's see if we have columns like: [SNo, Question ID, Correct Option]
                    # Usually, QID is a long number, and Correct Option is also a long number.
                    # If columns count is >= 3, let's assume index 1 is Question ID and index 2 is Correct Option
                    if len(headers) >= 3:
                        qid_cols = [1]
                        ans_cols = [2]
                    elif len(headers) == 2:
                        qid_cols = [0]
                        ans_cols = [1]
                
                # Pair QID column indices with the nearest answer key columns
                pairs = []
                for q_idx in qid_cols:
                    # Find closest answer column that is to the right of this q_idx
                    r_ans_cols = [a_idx for a_idx in ans_cols if a_idx > q_idx]
                    if r_ans_cols:
                        pairs.append((q_idx, min(r_ans_cols)))
                    elif ans_cols:
                        # Fallback to nearest column
                        pairs.append((q_idx, min(ans_cols, key=lambda x: abs(x - q_idx))))
                
                # Extract values from data rows
                for row in table[header_row_idx + 1:]:
                    for q_col, a_col in pairs:
                        if q_col >= len(row) or a_col >= len(row):
                            continue
                        
                        qid = clean_val(row[q_col])
                        ans = clean_val(row[a_col])
                        
                        # Validate that QID looks like a valid ID (numeric, long digits)
                        if not qid or not qid.isdigit() or len(qid) < 5:
                            continue
                        
                        if not ans:
                            continue
                        
                        # Parse multi-correct answers (e.g., comma separated option IDs, or slash separated, or spaces)
                        ans_list = []
                        # Split by comma, slash, or spaces if there are multiple long numeric IDs
                        parts = re.split(r'[,/\s]+', ans)
                        for p in parts:
                            p_clean = p.strip()
                            if p_clean.isdigit():
                                ans_list.append(p_clean)
                        
                        if len(ans_list) > 1:
                            answer_key[qid] = ans_list
                        elif len(ans_list) == 1:
                            answer_key[qid] = ans_list[0]
                        else:
                            # Fallback if answer wasn't simple digits
                            answer_key[qid] = ans
                            
    # Text fallback parsing
    if not answer_key:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""
            
            # Find lines like: 2268953022629 2268953022631
            # Or table listings in text: Question ID : 2268953022629 Correct Option ID : 2268953022631
            lines = full_text.split("\n")
            for line in lines:
                # Find all digit strings of length >= 8 in the line
                ids = re.findall(r'\b\d{8,}\b', line)
                if len(ids) >= 2:
                    # Assume first is Question ID, rest are correct options
                    qid = ids[0]
                    ans = ids[1:]
                    if len(ans) > 1:
                        answer_key[qid] = ans
                    else:
                        answer_key[qid] = ans[0]
                        
    return answer_key
