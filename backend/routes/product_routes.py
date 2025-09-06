from flask import Blueprint, request, jsonify, current_app
from backend.controllers.product_controller import (
    get_all_products, get_product_by_id, create_product,
    update_product, delete_product, get_user_products
)
from backend.utils.auth_utils import token_required
from werkzeug.utils import secure_filename
import os

product_bp = Blueprint('product', __name__)

@product_bp.route('/', methods=['GET'])
def get_products():
    category = request.args.get('category')
    search_query = request.args.get('search')
    
    result, status_code = get_all_products(category, search_query)
    return jsonify(result), status_code

@product_bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    result, status_code = get_product_by_id(product_id)
    return jsonify(result), status_code

@product_bp.route('/', methods=['POST'])
@token_required
def add_product(current_user):
    # Get form data
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')
    price = request.form.get('price')
    image = request.files.get('image')
    
    # Validate input
    if not title or not description or not category or not price:
        return jsonify({"error": "All fields are required"}), 400
    
    # Create product
    result, status_code = create_product(
        title=title,
        description=description,
        category=category,
        price=price,
        image=image,
        seller_id=current_user
    )
    
    return jsonify(result), status_code

@product_bp.route('/<product_id>', methods=['PUT'])
@token_required
def edit_product(current_user, product_id):
    # Get form data
    title = request.form.get('title')
    description = request.form.get('description')
    category = request.form.get('category')
    price = request.form.get('price')
    image = request.files.get('image')
    
    # Update product
    result, status_code = update_product(
        product_id=product_id,
        title=title,
        description=description,
        category=category,
        price=price,
        image=image
    )
    
    return jsonify(result), status_code

@product_bp.route('/<product_id>', methods=['DELETE'])
@token_required
def remove_product(current_user, product_id):
    result, status_code = delete_product(product_id)
    return jsonify(result), status_code

@product_bp.route('/user', methods=['GET'])
@token_required
def get_my_products(current_user):
    result, status_code = get_user_products(current_user)
    return jsonify(result), status_code