# app/__init__.py
import os
import threading
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.models import db
from sqlalchemy import text
from app.models.task_model import Task
from app.routes import (
    user_routes,
    task_routes,
    patient_routes,
    log_routes,
)
from app.utils.priority_queue import TaskPriorityQueue
import logging
from app.utils.task_dashboard import create_dash_app

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)

    # Configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///tasks.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "fallback_secret_key")

    # Enable CORS for all routes
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

    # Initialize extensions
    db.init_app(app)
    JWTManager(app)

    # Initialize the priority queue
    app.task_priority_queue = TaskPriorityQueue()

    # Register Blueprints
    app.register_blueprint(user_routes, url_prefix="/api")
    app.register_blueprint(task_routes, url_prefix="/api")
    app.register_blueprint(patient_routes, url_prefix="/api")
    app.register_blueprint(log_routes, url_prefix="/api")

    # Attach Dash app to Flask
    create_dash_app(app)

    def ensure_indexes():
        """
        Ensure indexes exist on relevant columns in the database.
        """
        try:
            with db.engine.connect() as connection:
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_task_id ON tasks(task_id);"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_patient_id ON patients(patient_id);"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);"))
                connection.execute(text("CREATE INDEX IF NOT EXISTS idx_task_urgency_time ON tasks(urgency, time_sensitive);"))
            logger.info("Indexes created successfully.")
        except Exception as e:
            logger.error(f"Error creating indexes: {e}")

    def check_and_create_db():
        """Check if the database exists; if not, create it and initialize the priority queue."""
        if not os.path.exists('instance/tasks.db'):
            logger.info("Database does not exist. Creating...")
            with app.app_context():
                db.create_all()
                ensure_indexes()
                initialize_priority_queue(app)
            logger.info("Database created successfully.")
        else:
            logger.info("Database already exists.")
            with app.app_context():
                initialize_priority_queue(app)

    # Check the database on app startup
    check_and_create_db()

    return app

def initialize_priority_queue(app):
    """Initialize the priority queue with tasks from the database."""
    try:
        tasks = Task.query.filter(Task.status != "Completed").all()
        app.task_priority_queue.rebuild_heap(tasks)
        logger.info("Priority queue initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing priority queue: {e}")
