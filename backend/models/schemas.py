from pydantic import BaseModel
from typing import List, Optional, Union

class FetchURLRequest(BaseModel):
    url: str

class BreakdownItem(BaseModel):
    question_id: str
    student_answer: Optional[str] = None
    correct_answer: Union[str, List[str]]
    status: str  # "correct" | "wrong" | "unattempted"
    marks_awarded: int

class ScoreResult(BaseModel):
    score: int
    correct: int
    wrong: int
    unattempted: int
    max_possible: int
    breakdown: List[BreakdownItem]
    warning: Optional[str] = None


class HealthCheckResponse(BaseModel):
    status: str
