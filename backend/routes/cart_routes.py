from flask import Blueprint, request, jsonify
from backend.controllers.cart_controller import (
    get_user_cart, add_to_cart, remove_from_cart,
    update_cart_item, clear_cart
)
from backend.controllers.user_controller import create_purchase_from_cart
from backend.utils.auth_utils import token_required

cart_bp = Blueprint('cart', __name__)

@cart_bp.route('/', methods=['GET'])
@token_required
def get_cart(current_user):
    result, status_code = get_user_cart(current_user)
    return jsonify(result), status_code

@cart_bp.route('/add', methods=['POST'])
@token_required
def add_item_to_cart(current_user):
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('product_id'):
        return jsonify({"error": "Product ID is required"}), 400
    
    # Add item to cart
    result, status_code = add_to_cart(
        user_id=current_user,
        product_id=data.get('product_id'),
        quantity=data.get('quantity', 1)
    )
    
    return jsonify(result), status_code

@cart_bp.route('/remove/<product_id>', methods=['DELETE'])
@token_required
def remove_item_from_cart(current_user, product_id):
    result, status_code = remove_from_cart(current_user, product_id)
    return jsonify(result), status_code

@cart_bp.route('/update/<product_id>', methods=['PUT'])
@token_required
def update_item_in_cart(current_user, product_id):
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('quantity'):
        return jsonify({"error": "Quantity is required"}), 400
    
    # Update item in cart
    result, status_code = update_cart_item(
        user_id=current_user,
        product_id=product_id,
        quantity=data.get('quantity')
    )
    
    return jsonify(result), status_code

@cart_bp.route('/clear', methods=['DELETE'])
@token_required
def clear_user_cart(current_user):
    result, status_code = clear_cart(current_user)
    return jsonify(result), status_code

@cart_bp.route('/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    result, status_code = create_purchase_from_cart(current_user)
    return jsonify(result), status_code