from flask import Blueprint, request, jsonify
from app.models.log_model import Log
from app.models import db
from datetime import datetime
import logging

log_routes = Blueprint("log_routes", __name__)

# Set up logging
logger = logging.getLogger(__name__)

@log_routes.route('/logs', methods=['GET'])
def get_logs():
    """
    Retrieve all logs with optional filters (e.g., user_id, date range).
    """
    user_id = request.args.get("user_id")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    query = Log.query

    try:
        # Filter by user_id if provided
        if user_id:
            if not user_id.isdigit():
                return jsonify({"error": "Invalid user_id. Must be a numeric value."}), 400
            query = query.filter(Log.user_id == user_id)

        # Filter by start_date if provided
        if start_date:
            try:
                start_date_parsed = datetime.fromisoformat(start_date)
                query = query.filter(Log.timestamp >= start_date_parsed)
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400

        # Filter by end_date if provided
        if end_date:
            try:
                end_date_parsed = datetime.fromisoformat(end_date)
                query = query.filter(Log.timestamp <= end_date_parsed)
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)."}), 400

    except Exception as e:
        logger.error(f"Error processing filters: {str(e)}")
        return jsonify({"error": "Error processing filters."}), 500

    # Paginate results
    logs_paginated = query.order_by(Log.timestamp.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    # Return paginated logs
    return jsonify({
        "logs": [
            {
                "log_id": log.log_id,
                "user_id": log.user_id,
                "action": log.action,
                "timestamp": log.timestamp.isoformat(),
            }
            for log in logs_paginated.items
        ],
        "total": logs_paginated.total,
        "page": logs_paginated.page,
        "pages": logs_paginated.pages,
    }), 200
