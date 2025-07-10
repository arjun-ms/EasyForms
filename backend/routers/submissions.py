# routers/submissions.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db

router = APIRouter(
    prefix="/submissions",
    tags=["Submissions"]
)

@router.post("/form/{form_id}", response_model=schemas.SubmissionResponse)
def submit_form(form_id: int, submission: schemas.FormSubmission, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """Submit a form response"""
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    new_submission = models.Submission(
        user_id=current_user.id,
        form_id=form_id,
        response_data=submission.response_data
    )
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    return new_submission


@router.get("/", response_model=List[schemas.SubmissionResponse])
def list_my_submissions(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """View all submissions made by the current user"""
    return db.query(models.Submission).filter(models.Submission.user_id == current_user.id).all()
