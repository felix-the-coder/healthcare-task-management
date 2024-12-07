# app/routes/__init__.py
from flask import Blueprint

# Initialize Blueprints
user_routes = Blueprint("user_routes", __name__)
task_routes = Blueprint("task_routes", __name__)
patient_routes = Blueprint("patient_routes", __name__)
log_routes = Blueprint("log_routes", __name__)

# Import route handlers
from app.routes.user_route import *
from app.routes.task_route import *
from app.routes.patient_route import *
from app.routes.log_route import *
