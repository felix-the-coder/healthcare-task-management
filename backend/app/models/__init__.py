from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Import all models to register them with SQLAlchemy
from app.models.user_model import User
from app.models.task_model import Task
from app.models.patient_model import Patient
from app.models.log_model import Log
