from app.models import db
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import event, text

class User(db.Model):
    __tablename__ = "users"

    emp_id = db.Column(db.String(10), unique=True, nullable=False, primary_key=True)  # String-based ID like E001
    email = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(80), nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    last_login = db.Column(db.DateTime)

    def __repr__(self):
        return f"<User {self.emp_id} ({self.email})>"

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Generate the string-based ID before insert
@event.listens_for(User, 'before_insert')
def generate_string_id(mapper, connection, target):
    # Query the highest existing emp_id
    result = connection.execute(text("SELECT MAX(emp_id) FROM users")).fetchone()
    max_string_id = result[0]

    if max_string_id and max_string_id.startswith('E'):
        # Extract the numeric part of the emp_id and increment it
        try:
            max_id = int(max_string_id[1:])  # Strip the prefix 'E'
            next_id = max_id + 1
        except ValueError:
            next_id = 1  # Handle unexpected non-numeric values gracefully
    else:
        # If no records exist or emp_id is invalid, start with 1
        next_id = 1

    # Format the new string ID with the prefix and leading zeros
    target.emp_id = f"E{next_id:03d}"
