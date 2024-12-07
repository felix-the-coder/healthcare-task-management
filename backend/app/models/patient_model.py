from app.models import db
from sqlalchemy import event, text

class Patient(db.Model):
    __tablename__ = "patients"

    patient_id = db.Column(db.String(50), unique=True, nullable=False, primary_key=True)  # Auto-generated ID like P001
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    gender = db.Column(db.String(10))
    condition = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Define the relationship with a backref
    tasks = db.relationship('Task', back_populates='patient', lazy=True)

    def __repr__(self):
        return f"<Patient {self.patient_id} ({self.first_name} {self.last_name})>"

# Generate the auto-incremented patient ID before insert
@event.listens_for(Patient, 'before_insert')
def generate_patient_id(mapper, connection, target):
    # Query the highest existing patient_id
    result = connection.execute(text("SELECT MAX(patient_id) FROM patients")).fetchone()
    max_patient_id = result[0]

    if max_patient_id and max_patient_id.startswith('P'):
        # Extract the numeric part of the patient_id and increment it
        try:
            max_id = int(max_patient_id[1:])  # Strip the prefix 'P'
            next_id = max_id + 1
        except ValueError:
            next_id = 1  # Handle unexpected non-numeric values gracefully
    else:
        # If no records exist or patient_id is invalid, start with 1
        next_id = 1

    # Format the new patient ID with the prefix and leading zeros
    target.patient_id = f"P{next_id:03d}"
