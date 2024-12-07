from flask import request, jsonify, current_app
from app.models.patient_model import Patient
from app.models.log_model import Log
from app.models import db
from app.routes import patient_routes
from flask_jwt_extended import jwt_required, get_jwt_identity


def log_action(user_id, action):
    """
    Helper function to create a log entry.
    """
    if not user_id:
        raise ValueError("Invalid user ID")
    new_log = Log(user_id=user_id, action=action)
    db.session.add(new_log)
    db.session.commit()


def get_current_user_id():
    """
    Retrieve the current authenticated user's ID from the JWT.
    """
    return get_jwt_identity()


@patient_routes.route('/patients', methods=['GET'])
@jwt_required()
def get_patients():
    """Get all patients."""
    try:
        patients = Patient.query.all()
        return jsonify([
            {
                "patient_id": patient.patient_id,
                "first_name": patient.first_name,
                "last_name": patient.last_name,
                "age": patient.age,
                "gender": patient.gender,
                "condition": patient.condition,
                "created_at": patient.created_at.isoformat() if patient.created_at else None,
                "updated_at": patient.updated_at.isoformat() if patient.updated_at else None,
            }
            for patient in patients
        ]), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch patients", "details": str(e)}), 500


@patient_routes.route('/patients', methods=['POST'])
@jwt_required()
def add_patient():
    """Add a new patient."""
    try:
        data = request.json

        new_patient = Patient(
            first_name=data["first_name"],
            last_name=data["last_name"],
            age=data["age"],
            gender=data["gender"],
            condition=data["condition"]
        )
        db.session.add(new_patient)
        db.session.commit()

        # Log the action
        user_id = get_current_user_id()
        log_action(user_id, f"Created patient {new_patient.patient_id}")

        return jsonify({"message": "Patient added successfully", "patient_id": new_patient.patient_id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add patient", "details": str(e)}), 500


@patient_routes.route('/patients/<string:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    """Update an existing patient."""
    try:
        data = request.json
        patient = Patient.query.filter_by(patient_id=patient_id).first()

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Update fields
        patient.first_name = data.get('first_name', patient.first_name)
        patient.last_name = data.get('last_name', patient.last_name)
        patient.age = data.get('age', patient.age)
        patient.gender = data.get('gender', patient.gender)
        patient.condition = data.get('condition', patient.condition)

        db.session.commit()

        # Log the action
        user_id = get_current_user_id()
        log_action(user_id, f"Updated patient {patient.patient_id}")

        return jsonify({"message": "Patient updated successfully", "patient_id": patient.patient_id}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to update patient", "details": str(e)}), 500


@patient_routes.route('/patients/<string:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    """Delete a patient and handle associated tasks."""
    try:
        # Find the patient
        patient = Patient.query.filter_by(patient_id=patient_id).first()

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Access the priority queue from the application context
        priority_queue = current_app.task_priority_queue

        # Remove tasks associated with the patient
        for task in patient.tasks:
            # Remove the task from the priority queue
            priority_queue.remove(task.task_id)

            # Delete the task from the database
            db.session.delete(task)

        # Delete the patient
        db.session.delete(patient)
        db.session.commit()

        # Log the action
        user_id = get_current_user_id()
        log_action(user_id, f"Deleted patient {patient.patient_id} and associated tasks")

        return jsonify({"message": "Patient and associated tasks deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to delete patient", "details": str(e)}), 500
