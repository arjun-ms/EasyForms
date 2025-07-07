from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, func
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(128), nullable=False)
    role = Column(String(10), nullable=False, default='user')  # 'admin' or 'user'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    forms = relationship('Form', back_populates='creator')
    assignments = relationship('FormAssignment', back_populates='user')
    submissions = relationship('Submission', back_populates='user')

class Form(Base):
    __tablename__ = 'forms'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(String(500))
    schema = Column(JSON, nullable=False)
    created_by = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    creator = relationship('User', back_populates='forms')
    assignments = relationship('FormAssignment', back_populates='form')
    submissions = relationship('Submission', back_populates='form')
    fields = relationship('FormField', back_populates='form')

class FormAssignment(Base):
    __tablename__ = 'form_assignments'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    form_id = Column(Integer, ForeignKey('forms.id'), nullable=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship('User', back_populates='assignments')
    form = relationship('Form', back_populates='assignments')

class Submission(Base):
    __tablename__ = 'submissions'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    form_id = Column(Integer, ForeignKey('forms.id'), nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    response_data = Column(JSON, nullable=False)

    user = relationship('User', back_populates='submissions')
    form = relationship('Form', back_populates='submissions')

class FormField(Base):
    __tablename__ = 'form_fields'

    id = Column(Integer, primary_key=True, index=True)
    form_id = Column(Integer, ForeignKey('forms.id'), nullable=False)
    label = Column(String(100), nullable=False)
    field_type = Column(String(20), nullable=False)  # text, number, dropdown, checkbox, etc.
    options = Column(JSON)  # For dropdown/checkbox options
    required = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    form = relationship('Form', back_populates='fields') 