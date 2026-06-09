from typing import Dict, List, Union, Optional
from backend.models.schemas import ScoreResult, BreakdownItem

def calculate_score(responses: Dict[str, Optional[str]], answer_key: Dict[str, Union[str, List[str]]]) -> ScoreResult:
    """
    Calculates CUET score based on responses and official answer key.
    Marking scheme: Correct +5, Wrong -1, Unattempted 0.
    """
    correct_count = 0
    wrong_count = 0
    unattempted_count = 0
    breakdown = []
    
    # Iterate over all questions in the answer key
    for qid, correct_ans in answer_key.items():
        student_ans = responses.get(qid, None)
        
        # Check if student answer is present and clean it
        if student_ans is not None:
            student_ans = str(student_ans).strip()
            
        # Determine correctness
        if student_ans is None or student_ans == "" or student_ans.lower() == "none":
            status = "unattempted"
            marks = 0
            unattempted_count += 1
        else:
            # Check if correct_ans is list or string
            is_correct = False
            if isinstance(correct_ans, list):
                # Student answer is correct if it matches ANY item in the list
                is_correct = any(str(ans).strip() == student_ans for ans in correct_ans)
            else:
                is_correct = str(correct_ans).strip() == student_ans
                
            if is_correct:
                status = "correct"
                marks = 5
                correct_count += 1
            else:
                status = "wrong"
                marks = -1
                wrong_count += 1
                
        breakdown.append(
            BreakdownItem(
                question_id=qid,
                student_answer=student_ans,
                correct_answer=correct_ans,
                status=status,
                marks_awarded=marks
            )
        )
        
    total_questions = len(answer_key)
    max_possible = total_questions * 5
    score = (correct_count * 5) - (wrong_count * 1)
    
    return ScoreResult(
        score=score,
        correct=correct_count,
        wrong=wrong_count,
        unattempted=unattempted_count,
        max_possible=max_possible,
        breakdown=breakdown
    )
