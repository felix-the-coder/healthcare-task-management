from flask import Blueprint, request, jsonify, current_app
from app.models.task_model import Task
from app.models.patient_model import Patient
from app.utils.priority_queue import TaskPriorityQueue
from app import db
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

task_routes = Blueprint("task_routes", __name__)

def log_action(user_id, action):
    """
    Helper function to log user actions.
    """
    from app.models.log_model import Log
    new_log = Log(user_id=user_id, action=action)
    db.session.add(new_log)
    db.session.commit()

def get_current_user_id():
    """
    Retrieve the current user ID from the JWT token.
    """
    return get_jwt_identity()

@task_routes.route("/tasks/dashboard", methods=["GET"])

def get_heap_tasks_dashboard():
    """
    Fetch all tasks in the in-memory priority queue.
    """
    try:
        # Fetch tasks from the in-memory priority queue
        heap_tasks = current_app.task_priority_queue.get_all_tasks()

        # Return a properly structured response
        return jsonify([
            {
                "task_id": task["task_id"],
                "patient_id": task["patient_id"],
                "description": task["description"],
                "urgency": task["urgency"],
                "time_sensitive": task["time_sensitive"].isoformat() if task["time_sensitive"] else None,
                "status": task["status"]
            }
            for task in heap_tasks
        ]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_routes.route("/tasks", methods=["GET"])
@jwt_required()
def get_tasks():
    """
    Fetch all tasks from the database.
    """
    try:
        tasks = Task.query.all()
        return jsonify([
            {
                "task_id": task.task_id,
                "patient_id": task.patient_id,
                "description": task.description,
                "urgency": task.urgency,
                "time_sensitive": task.time_sensitive.isoformat() if task.time_sensitive else None,
                "status": task.status
            }
            for task in tasks
        ]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@task_routes.route("/tasks/heap", methods=["GET"])
@jwt_required()
def get_heap_tasks():
    """
    Fetch all tasks in the in-memory priority queue.
    """
    try:
        heap_tasks = current_app.task_priority_queue.get_all_tasks()
        return jsonify(heap_tasks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_routes.route("/tasks/sync", methods=["POST"])
@jwt_required()
def sync_tasks_with_db():
    """
    Synchronize the in-memory priority queue with the database.
    """
    try:
        # Fetch only pending tasks from the database to sync with the heap
        tasks = Task.query.filter_by(status="Pending").all()
        current_app.task_priority_queue.rebuild_heap(tasks)
        return jsonify({"message": "Heap synchronized with database", "status": "success"}), 200
    except Exception as e:
        return jsonify({"error": f"Failed to sync: {str(e)}"}), 500


@task_routes.route("/tasks/priority", methods=["GET"])
@jwt_required()
def fetch_highest_priority_task():
    """
    Fetch the highest-priority task from the in-memory queue.
    """
    try:
        task = current_app.task_priority_queue.peek()
        if not task:
            return jsonify({"error": "No tasks in the heap"}), 404
        return jsonify({
            "task_id": task.task_id,
            "patient_id": task.patient_id,
            "description": task.description,
            "urgency": task.urgency,
            "time_sensitive": task.time_sensitive.isoformat() if task.time_sensitive else None,
            "status": task.status,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@task_routes.route("/tasks", methods=["POST"])
@jwt_required()
def add_task():
    """
    Add a new task to the database and in-memory queue.
    """
    try:
        data = request.get_json()
        required_fields = ["description", "urgency", "time_sensitive", "status", "patient_id"]
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        if not (1 <= int(data["urgency"]) <= 5):
            return jsonify({"error": "Urgency must be between 1 and 5"}), 400

        # Check if the patient exists
        patient = Patient.query.filter_by(patient_id=data["patient_id"]).first()
        if not patient:
            return jsonify({"error": f"Patient with ID {data['patient_id']} does not exist"}), 404

        # Parse the time-sensitive value
        time_sensitive = datetime.fromisoformat(data["time_sensitive"])

        # Create a new task object
        new_task = Task(
            patient_id=data["patient_id"],
            description=data["description"],
            urgency=int(data["urgency"]),
            time_sensitive=time_sensitive,
            status=data["status"],
        )

        # Add the task to the database and commit it to generate task_id
        db.session.add(new_task)
        db.session.commit()

        # Push the newly created task into the in-memory priority queue
        current_app.task_priority_queue.push(new_task)

        # Log the action
        user_id = get_current_user_id()
        log_action(user_id, f"Added task {new_task.task_id}")

        return jsonify({"message": "Task added successfully", "task_id": new_task.task_id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@task_routes.route("/tasks/<string:task_id>", methods=["PUT"])
@jwt_required()
def update_task(task_id):
    """
    Update an existing task in the database and in-memory queue.
    If the status is set to 'Completed', remove it from the heap but retain it in the database.
    If the status is updated back to 'Pending', add it back to the heap.
    """
    try:
        data = request.get_json()

        # Fetch the task from the database
        task = Task.query.filter_by(task_id=task_id).first()

        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Store the old status to handle heap logic
        old_status = task.status

        # Update task attributes if provided in the request data
        task.description = data.get("description", task.description)
        task.urgency = data.get("urgency", task.urgency)
        task.status = data.get("status", task.status)

        if "time_sensitive" in data:
            task.time_sensitive = datetime.fromisoformat(data["time_sensitive"])

        # Ensure urgency is within the valid range
        if task.urgency and not (1 <= int(task.urgency) <= 5):
            return jsonify({"error": "Urgency must be between 1 and 5"}), 400

        # Commit updates to the database
        db.session.commit()

        # Handle priority queue logic based on status
        if old_status == "Pending" and task.status == "Completed":
            # Remove from heap if status changes to 'Completed'
            current_app.task_priority_queue.remove(task.task_id)
        elif old_status == "Completed" and task.status == "Pending":
            # Add back to heap if status changes to 'Pending'
            current_app.task_priority_queue.push(task)
        elif task.status == "Pending":
            # Update the heap with the modified task
            current_app.task_priority_queue.remove(task.task_id)
            current_app.task_priority_queue.push(task)

        # Log the update action
        user_id = get_current_user_id()
        log_action(user_id, f"Updated task {task.task_id}")

        return jsonify({"message": "Task updated successfully"}), 200
    except ValueError as ve:
        return jsonify({"error": f"Invalid input: {str(ve)}"}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@task_routes.route("/tasks/<string:task_id>", methods=["DELETE"])
@jwt_required()
def delete_task(task_id):
    """
    Delete a task from the database and in-memory queue.
    """
    try:
        # Fetch the task from the database
        task = Task.query.filter_by(task_id=task_id).first()

        if not task:
            return jsonify({"error": "Task not found"}), 404

        # Remove the task from the database
        db.session.delete(task)
        db.session.commit()

        # Check and remove the task from the in-memory priority queue if it exists
        if task_id in current_app.task_priority_queue.task_map:
            current_app.task_priority_queue.remove(task_id)

        # Log the delete action
        user_id = get_current_user_id()
        log_action(user_id, f"Deleted task {task.task_id}")

        return jsonify({"message": "Task deleted successfully"}), 200
    except Exception as e:
        # Rollback any changes in case of an error
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
