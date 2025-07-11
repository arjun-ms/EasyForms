# this file contains the schemas for the backend application
# and is used to define the data models for the application.

from pydantic import BaseModel, EmailStr, constr
from typing import Optional, Dict
from datetime import datetime

class AssignedUser(BaseModel):
    id: int
    username: str

    class Config:
        orm_mode = True

        
# User registration schema
class UserCreate(BaseModel):
    username: constr(min_length=3, max_length=50)
    email: EmailStr
    password: constr(min_length=6)
    role: Optional[str] = "user"  # Only 'admin' or 'user', default 'user'

# User response schema (for returning user info)
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    class Config:
        orm_mode = True
    
# Token schema (for login/refresh responses)
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

# Token data for internal use
class TokenData(BaseModel):
    email: Optional[str] = None
    token_type: Optional[str] = None

# User profile schema
class UserProfile(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: Optional[datetime]
    class Config:
        orm_mode = True

# Form field schema
class FormFieldBase(BaseModel):
    label: str
    field_type: str  # text, number, dropdown, checkbox, etc.
    options: Optional[list] = None  # For dropdown/checkbox options
    required: Optional[bool] = False
    order: Optional[int] = 0

class FormFieldCreate(FormFieldBase):
    pass

class FormFieldResponse(FormFieldBase):
    id: int
    class Config:
        orm_mode = True

# Form schema
class FormBase(BaseModel):
    title: str
    description: Optional[str] = None
    schema: dict  # JSON schema for the form structure

class FormCreate(FormBase):
    fields: Optional[list[FormFieldCreate]] = None  # Optional, for normalized approach

class FormUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    schema: Optional[dict] = None
    fields: Optional[list[FormFieldCreate]] = None
    assigned_user_id: Optional[int] = None
class FormResponse(FormBase):
    id: int
    created_by: int
    created_at: datetime
    fields: Optional[list[FormFieldResponse]] = None
    assigned_user: Optional[AssignedUser] = None
    class Config:
        orm_mode = True

# Form assignment schema
class FormAssignmentCreate(BaseModel):
    user_id: int

class FormAssignmentResponse(BaseModel):
    id: int
    user_id: int
    form_id: int
    assigned_at: datetime
    class Config:
        orm_mode = True


class FormSubmission(BaseModel):
    response_data: Dict  # answers keyed by label

class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    form_id: int
    submitted_at: datetime
    response_data: Dict

    form: Optional[FormBase]
    
    class Config:
        orm_mode = True    #- tells Pydantic to convert SQLAlchemy ORM models to Pydantic models correctly.