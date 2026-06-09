import pytest
from unittest.mock import MagicMock, patch
from backend.parsers.response_sheet import parse_response_sheet
from backend.parsers.answer_key import parse_answer_key
from backend.parsers.score_calculator import calculate_score

# --- Test data fixtures ---

mock_response_sheet_kv_tables = [
    # Question 1 Table
    [
        ["Question Type :", "MCQ"],
        ["Question ID :", "2268953022629"],
        ["Option 1 ID :", "2268953022631"],
        ["Option 2 ID :", "2268953022632"],
        ["Option 3 ID :", "2268953022633"],
        ["Option 4 ID :", "2268953022634"],
        ["Status :", "Answered"],
        ["Chosen Option :", "2"]
    ],
    # Question 2 Table (unattempted)
    [
        ["Question Type :", "MCQ"],
        ["Question ID :", "2268953022630"],
        ["Option 1 ID :", "2268953022635"],
        ["Option 2 ID :", "2268953022636"],
        ["Option 3 ID :", "2268953022637"],
        ["Option 4 ID :", "2268953022638"],
        ["Status :", "Not Answered"],
        ["Chosen Option :", "--"]
    ]
]

mock_response_sheet_tabular = [
    # Headers
    ["S.No", "Question ID", "Option 1 ID", "Option 2 ID", "Option 3 ID", "Option 4 ID", "Status", "Chosen Option"],
    # Row 1 (Answered Option 1)
    ["1", "2268953022629", "2268953022631", "2268953022632", "2268953022633", "2268953022634", "Answered", "1"],
    # Row 2 (Unattempted)
    ["2", "2268953022630", "2268953022635", "2268953022636", "2268953022637", "2268953022638", "Not Answered", "--"]
]

mock_answer_key_tables = [
    [
        ["S.No", "Question ID", "Correct Option ID"],
        ["1", "2268953022629", "2268953022632"],  # Correct is Option 2 (2268953022632)
        ["2", "2268953022630", "2268953022635"]   # Correct is Option 1 (2268953022635)
    ]
]

# Side-by-side layout (mult-column)
mock_answer_key_side_by_side = [
    [
        ["Question ID", "Correct Option ID", "Question ID", "Correct Option ID"],
        ["2268953022629", "2268953022632", "2268953022630", "2268953022635"]
    ]
]

# --- Tests for Response Sheet Parser ---

@patch("pdfplumber.open")
def test_parse_response_sheet_kv(mock_open):
    # Mock page and tables extraction
    mock_page = MagicMock()
    mock_page.extract_tables.return_value = mock_response_sheet_kv_tables
    mock_page.extract_text.return_value = ""
    
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    mock_open.return_value.__enter__.return_value = mock_pdf
    
    responses = parse_response_sheet(b"dummy pdf content")
    
    assert "2268953022629" in responses
    assert responses["2268953022629"] == "2268953022632"  # Option 2 ID
    assert responses["2268953022630"] is None  # Unattempted

@patch("pdfplumber.open")
def test_parse_response_sheet_tabular(mock_open):
    mock_page = MagicMock()
    mock_page.extract_tables.return_value = [mock_response_sheet_tabular]
    mock_page.extract_text.return_value = ""
    
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    mock_open.return_value.__enter__.return_value = mock_pdf
    
    responses = parse_response_sheet(b"dummy pdf content")
    
    assert responses["2268953022629"] == "2268953022631"  # Option 1 ID
    assert responses["2268953022630"] is None

@patch("pdfplumber.open")
def test_parse_response_sheet_text_fallback(mock_open):
    # Mock text output
    text_content = """
    Question ID : 2268953022629
    Option 1 ID : 2268953022631
    Option 2 ID : 2268953022632
    Option 3 ID : 2268953022633
    Option 4 ID : 2268953022634
    Status : Answered
    Chosen Option : 3
    """
    mock_page = MagicMock()
    mock_page.extract_tables.return_value = []
    mock_page.extract_text.return_value = text_content
    
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    mock_open.return_value.__enter__.return_value = mock_pdf
    
    responses = parse_response_sheet(b"dummy pdf content")
    
    assert responses["2268953022629"] == "2268953022633"  # Option 3 ID

# --- Tests for Answer Key Parser ---

@patch("pdfplumber.open")
def test_parse_answer_key_standard(mock_open):
    mock_page = MagicMock()
    mock_page.extract_tables.return_value = mock_answer_key_tables
    mock_page.extract_text.return_value = ""
    
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    mock_open.return_value.__enter__.return_value = mock_pdf
    
    key = parse_answer_key(b"dummy pdf content")
    
    assert key["2268953022629"] == "2268953022632"
    assert key["2268953022630"] == "2268953022635"

@patch("pdfplumber.open")
def test_parse_answer_key_side_by_side(mock_open):
    mock_page = MagicMock()
    mock_page.extract_tables.return_value = mock_answer_key_side_by_side
    mock_page.extract_text.return_value = ""
    
    mock_pdf = MagicMock()
    mock_pdf.pages = [mock_page]
    mock_open.return_value.__enter__.return_value = mock_pdf
    
    key = parse_answer_key(b"dummy pdf content")
    
    assert key["2268953022629"] == "2268953022632"
    assert key["2268953022630"] == "2268953022635"

# --- Tests for Score Calculator ---

def test_score_calculation():
    responses = {
        "q1": "opt_correct",
        "q2": "opt_incorrect",
        "q3": None,
        "q4": "opt_correct_1",  # multi-correct test
    }
    
    answer_key = {
        "q1": "opt_correct",
        "q2": "opt_correct_val",
        "q3": "opt_correct_val_2",
        "q4": ["opt_correct_1", "opt_correct_2"],
    }
    
    result = calculate_score(responses, answer_key)
    
    # Correct: q1 (+5), q4 (+5) = 10
    # Wrong: q2 (-1) = -1
    # Unattempted: q3 (0) = 0
    # Total score = 10 - 1 = 9
    assert result.score == 9
    assert result.correct == 2
    assert result.wrong == 1
    assert result.unattempted == 1
    assert result.max_possible == 20
    
    # Verify breakdown
    breakdown_map = {item.question_id: item for item in result.breakdown}
    assert breakdown_map["q1"].status == "correct"
    assert breakdown_map["q1"].marks_awarded == 5
    assert breakdown_map["q2"].status == "wrong"
    assert breakdown_map["q2"].marks_awarded == -1
    assert breakdown_map["q3"].status == "unattempted"
    assert breakdown_map["q3"].marks_awarded == 0
    assert breakdown_map["q4"].status == "correct"
    assert breakdown_map["q4"].marks_awarded == 5
