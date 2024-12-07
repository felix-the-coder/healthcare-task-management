from app.models import db
from sqlalchemy import event, text

class Log(db.Model):
    __tablename__ = "logs"

    log_id = db.Column(db.String(20), unique=True, nullable=False, primary_key=True)  # Auto-generated ID like L001
    user_id = db.Column(db.String(10), db.ForeignKey('users.emp_id'), nullable=False)
    action = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    user = db.relationship("User", backref="logs", lazy=True)

    def __repr__(self):
        return f"<Log {self.log_id} - {self.action} by User {self.user_id}>"

# Generate the auto-incremented log ID before insert
@event.listens_for(Log, 'before_insert')
def generate_log_id(mapper, connection, target):
    # Query the highest existing log_id
    result = connection.execute(text("SELECT MAX(log_id) FROM logs")).fetchone()
    max_log_id = result[0]

    if max_log_id and max_log_id.startswith('L'):
        # Extract the numeric part of the log_id and increment it
        try:
            max_id = int(max_log_id[1:])  # Strip the prefix 'L'
            next_id = max_id + 1
        except ValueError:
            next_id = 1  # Handle unexpected non-numeric values gracefully
    else:
        # If no records exist or log_id is invalid, start with 1
        next_id = 1

    # Format the new log ID with the prefix and leading zeros
    target.log_id = f"L{next_id:03d}"
