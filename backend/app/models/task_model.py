from app.models import db
from sqlalchemy import event, text

class Task(db.Model):
    __tablename__ = "tasks"

    task_id = db.Column(db.String(50), unique=True, nullable=False, primary_key=True)  # Auto-generated ID like T001
    patient_id = db.Column(db.String(50), db.ForeignKey('patients.patient_id'), nullable=False)  # Foreign key referencing Patient
    description = db.Column(db.Text, nullable=False)
    urgency = db.Column(db.Integer, nullable=False)
    time_sensitive = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Index for faster querying when sorting by urgency and time sensitivity
    __table_args__ = (
        db.Index('idx_urgency_time', 'urgency', 'time_sensitive'),
    )

    # Use back_populates to match the Patient model
    patient = db.relationship('Patient', back_populates='tasks', lazy=True)

    def __repr__(self):
        return f"<Task {self.task_id} - {self.description[:30]}... for Patient {self.patient_id}>"

# Generate the auto-incremented task ID before insert
@event.listens_for(Task, 'before_insert')
def generate_task_id(mapper, connection, target):
    # Query the highest existing task_id
    result = connection.execute(text("SELECT MAX(task_id) FROM tasks")).fetchone()
    max_task_id = result[0]

    if max_task_id and max_task_id.startswith('T'):
        # Extract the numeric part of the task_id and increment it
        try:
            max_id = int(max_task_id[1:])  # Strip the prefix 'T'
            next_id = max_id + 1
        except ValueError:
            next_id = 1  # Handle unexpected non-numeric values gracefully
    else:
        # If no records exist or task_id is invalid, start with 1
        next_id = 1

    # Format the new task ID with the prefix and leading zeros
    target.task_id = f"T{next_id:03d}"
