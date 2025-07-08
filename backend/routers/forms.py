from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, models, auth
from ..database import get_db
from ..routers.user import require_role

router = APIRouter(
    prefix="/forms",
    tags=["forms"]
)

# Admin dependency
admin_required = require_role("admin")

@router.post("/", response_model=schemas.FormResponse, dependencies=[Depends(admin_required)])
def create_form(form: schemas.FormCreate, db: Session = Depends(get_db), current_user=Depends(auth.get_current_user)):
    """Create a new form (Admin only)"""
    db_form = models.Form(
        title=form.title,
        description=form.description,
        schema=form.schema,
        created_by=current_user.id
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    # Optionally handle fields if normalized
    if form.fields:
        for field in form.fields:
            db_field = models.FormField(
                form_id=db_form.id,
                label=field.label,
                field_type=field.field_type,
                options=field.options,
                required=field.required,
                order=field.order
            )
            db.add(db_field)
        db.commit()
    db.refresh(db_form)
    # Load fields for response
    db_form.fields  # triggers relationship
    return db_form

@router.get("/", response_model=List[schemas.FormResponse], dependencies=[Depends(admin_required)])
def list_forms(db: Session = Depends(get_db)):
    """List all forms (Admin only)"""
    forms = db.query(models.Form).all()
    return forms

@router.get("/{form_id}", response_model=schemas.FormResponse, dependencies=[Depends(admin_required)])
def get_form(form_id: int, db: Session = Depends(get_db)):
    """Get a specific form by ID (Admin only)"""
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return form

@router.put("/{form_id}", response_model=schemas.FormResponse, dependencies=[Depends(admin_required)])
def update_form(form_id: int, form: schemas.FormUpdate, db: Session = Depends(get_db)):
    """Update a form (Admin only)"""
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    if form.title is not None:
        db_form.title = form.title
    if form.description is not None:
        db_form.description = form.description
    if form.schema is not None:
        db_form.schema = form.schema
    db.commit()
    db.refresh(db_form)
    # Optionally update fields if provided
    if form.fields is not None:
        # Remove existing fields
        db.query(models.FormField).filter(models.FormField.form_id == db_form.id).delete()
        db.commit()
        # Add new fields
        for field in form.fields:
            db_field = models.FormField(
                form_id=db_form.id,
                label=field.label,
                field_type=field.field_type,
                options=field.options,
                required=field.required,
                order=field.order
            )
            db.add(db_field)
        db.commit()
    db.refresh(db_form)
    db_form.fields  # triggers relationship
    return db_form

@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(admin_required)])
def delete_form(form_id: int, db: Session = Depends(get_db)):
    """Delete a form (Admin only)"""
    db_form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not db_form:
        raise HTTPException(status_code=404, detail="Form not found")
    # Delete related fields, assignments, and submissions
    db.query(models.FormField).filter(models.FormField.form_id == db_form.id).delete()
    db.query(models.FormAssignment).filter(models.FormAssignment.form_id == db_form.id).delete()
    db.query(models.Submission).filter(models.Submission.form_id == db_form.id).delete()
    db.delete(db_form)
    db.commit()
    return

@router.post("/{form_id}/assign", response_model=schemas.FormAssignmentResponse, dependencies=[Depends(admin_required)])
def assign_form(form_id: int, assignment: schemas.FormAssignmentCreate, db: Session = Depends(get_db)):
    """Assign a form to a user (Admin only)"""
    # Check form exists
    form = db.query(models.Form).filter(models.Form.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    # Check user exists
    user = db.query(models.User).filter(models.User.id == assignment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Prevent duplicate assignment
    existing = db.query(models.FormAssignment).filter(models.FormAssignment.form_id == form_id, models.FormAssignment.user_id == assignment.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Form already assigned to user")
    db_assignment = models.FormAssignment(
        user_id=assignment.user_id,
        form_id=form_id
    )
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment 