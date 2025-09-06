from flask import Blueprint, request, jsonify
from backend.controllers.auth_controller import register_user, login_user

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    # Register user
    result, status_code = register_user(
        email=data.get('email'),
        password=data.get('password'),
        username=data.get('username')
    )
    
    return jsonify(result), status_code

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    # Login user
    result, status_code = login_user(
        email=data.get('email'),
        password=data.get('password')
    )
    
    return jsonify(result), status_code