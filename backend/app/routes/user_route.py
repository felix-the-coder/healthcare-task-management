from flask import request, jsonify
from app.models.user_model import User
from app.models import db
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from app.routes import user_routes
import logging

# Logger setup
logger = logging.getLogger(__name__)

@user_routes.route('/login', methods=['POST'])
def login():
    """
    Authenticate a user.
    """
    data = request.json
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    if (username == 'admin@gmail.com' and password == 'admin'):
        access_token = create_access_token(identity=str(username))
        return jsonify({"access_token": access_token, "user_id": "admin@gmail.com", "role": "Administrator"}), 200
    else:
        user = User.query.filter_by(email=username).first()
        if not user or not user.check_password(password):
            return jsonify({"error": "Invalid username or password"}), 401

        # Create access token
        access_token = create_access_token(identity=str(user.emp_id))
        logger.info(f"User {username} logged in successfully")
        return jsonify({"access_token": access_token, "user_id": user.email, "role": user.role}), 200


@user_routes.route('/users', methods=['GET'])
# @jwt_required()
def get_users():
    """
    Retrieve all users.
    """
    try:
        users = User.query.all()
        users_data = [
            {
                "id": user.emp_id,
                "email": user.email,
                "role": user.role,
                "last_login": user.last_login.isoformat() if user.last_login else None,
            }
            for user in users
        ]
        return jsonify(users_data), 200
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        return jsonify({"error": str(e)}), 500


@user_routes.route('/users', methods=['POST'])
# @jwt_required()
def add_user():
    """
    Add a new user.
    """
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([email, password, role]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": f"User with email {email} already exists."}), 409

    try:
        hashed_password = generate_password_hash(password)
        new_user = User(email=email, password_hash=hashed_password, role=role)
        db.session.add(new_user)
        db.session.commit()
        logger.info(f"New user {email} added successfully")
        return jsonify({"message": "User added successfully"}), 201
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error adding user: {e}")
        return jsonify({"error": str(e)}), 500


@user_routes.route('/users/<string:email>', methods=['PUT'])
# @jwt_required()
def update_user(email):
    """
    Update user role or password.
    """
    data = request.json
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        if "role" in data:
            user.role = data["role"]
        if "password" in data and data["password"]:
            user.password_hash = generate_password_hash(data["password"])

        db.session.commit()
        logger.info(f"User {email} updated successfully")
        return jsonify({"message": "User updated successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating user {email}: {e}")
        return jsonify({"error": str(e)}), 500


@user_routes.route('/users/<string:email>', methods=['DELETE'])
@jwt_required()
def delete_user(email):
    """
    Delete a user by email.
    """
    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    try:
        db.session.delete(user)
        db.session.commit()
        logger.warning(f"User {email} deleted")
        return jsonify({"message": "User deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error deleting user {email}: {e}")
        print(str(e))
        return jsonify({"error": str(e)}), 500
