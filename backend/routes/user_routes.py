from flask import Blueprint, request, jsonify
from backend.controllers.user_controller import (
    get_user_profile, update_user_profile, get_user_purchases
)
from backend.utils.auth_utils import token_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    result, status_code = get_user_profile(current_user)
    return jsonify(result), status_code

@user_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    # Update profile
    result, status_code = update_user_profile(
        user_id=current_user,
        username=data.get('username'),
        email=data.get('email')
    )
    
    return jsonify(result), status_code

@user_bp.route('/purchases', methods=['GET'])
@token_required
def get_purchases(current_user):
    result, status_code = get_user_purchases(current_user)
    return jsonify(result), status_code