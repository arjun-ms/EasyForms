# routers/user_forms.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from sqlalchemy.orm import joinedload

router = APIRouter(
    prefix="/user/forms",
    tags=["user-forms"]
)

#! NEW FEATURES--------------------------->>>>>>>>>>>>>>>>>>>>>>

#- Get assigned forms for the logged in user
@router.get("/assigned", response_model=List[schemas.FormResponse])
def get_assigned_forms(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """Return forms assigned to the current user"""
    
    #! DONT USE IMPORT STATEMENTS HERE INSIDE FNS

    assignments = db.query(models.FormAssignment).filter(
        models.FormAssignment.user_id == current_user.id
    ).all()

    form_ids = [a.form_id for a in assignments]

    forms = db.query(models.Form).options(
        joinedload(models.Form.fields)
    ).filter(models.Form.id.in_(form_ids)).all()

    for form in forms:
        form.assigned_user = current_user  # optional for frontend
    return forms

#- Submit form responses
@router.post("/{form_id}/submit",  response_model=schemas.SubmissionResponse, status_code=201)
def submit_form_response(form_id: int, response_data: dict, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    # Check if form is assigned to user
    assignment = db.query(models.FormAssignment).filter_by(
        user_id=current_user.id,
        form_id=form_id
    ).first()

    if not assignment:
        raise HTTPException(status_code=403, detail="You are not assigned to this form")

    # Optional: check if already submitted (depends on your logic)
    existing = db.query(models.Submission).filter_by(
        user_id=current_user.id,
        form_id=form_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Form already submitted")

    # Save submission
    submission = models.Submission(
        user_id=current_user.id,
        form_id=form_id,
        response_data=response_data
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return submission

#- Get a specific assigned form ( for a logged-in user )
@router.get("/{form_id}", response_model=schemas.FormResponse)
def get_user_assigned_form(
    form_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(auth.get_current_user)
):

    # Check assignment
    assignment = db.query(models.FormAssignment).filter_by(
        user_id=current_user.id,
        form_id=form_id
    ).first()

    if not assignment:
        raise HTTPException(status_code=403, detail="You are not assigned to this form")

    # Fetch form with fields
    form = db.query(models.Form).options(
        joinedload(models.Form.fields)
    ).filter(models.Form.id == form_id).first()

    if not form:
        raise HTTPException(status_code=404, detail="Form not found")

    form.assigned_user = current_user  # for frontend rendering
    return form

#- List all submissions made by the current user
@router.get("/", response_model=List[schemas.SubmissionResponse])
def list_my_submissions(db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """View all submissions made by the current user"""
    submissions = db.query(models.Submission).options(
        joinedload(models.Submission.form)
    ).filter(
        models.Submission.user_id == current_user.id
    ).all()

    return submissions