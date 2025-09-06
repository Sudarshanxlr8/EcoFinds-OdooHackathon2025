from flask import current_app
from pymongo import MongoClient
from bson import ObjectId
from backend.models.product_model import Product
import os
import uuid
from werkzeug.utils import secure_filename

def get_all_products(category=None, search_query=None):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    products_collection = db.products
    
    # Build query
    query = {}
    if category and category != "all":
        query["category"] = category
    if search_query:
        query["$or"] = [
            {"title": {"$regex": search_query, "$options": "i"}},
            {"description": {"$regex": search_query, "$options": "i"}}
        ]
    
    # Get products
    products_data = products_collection.find(query).sort("created_at", -1)
    products = [Product.from_dict(product).to_dict() for product in products_data]
    
    return {"products": products}, 200

def get_product_by_id(product_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    products_collection = db.products
    
    # Get product
    try:
        product_data = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product_data:
            return {"error": "Product not found"}, 404
        
        product = Product.from_dict(product_data)
        return {"product": product.to_dict()}, 200
    except Exception as e:
        return {"error": str(e)}, 400

def create_product(title, description, category, price, image=None, seller_id=None):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    products_collection = db.products
    
    # Handle image upload
    image_url = ""
    if image and image.filename:
        if allowed_file(image.filename, current_app.config['ALLOWED_EXTENSIONS']):
            filename = secure_filename(f"{uuid.uuid4()}_{image.filename}")
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            image.save(image_path)
            image_url = f"/static/uploads/{filename}"
    
    # Create product
    product = Product(
        title=title,
        description=description,
        category=category,
        price=price,
        image_url=image_url,
        seller_id=ObjectId(seller_id) if seller_id else None
    )
    
    # Insert product into database
    result = products_collection.insert_one({
        "_id": product._id,
        "title": product.title,
        "description": product.description,
        "category": product.category,
        "price": product.price,
        "image_url": product.image_url,
        "seller_id": product.seller_id,
        "created_at": product.created_at,
        "updated_at": product.updated_at,
        "slug": product.slug
    })
    
    return {"product": product.to_dict()}, 201

def update_product(product_id, title=None, description=None, category=None, price=None, image=None):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    products_collection = db.products
    
    # Get existing product
    try:
        product_data = products_collection.find_one({"_id": ObjectId(product_id)})
        if not product_data:
            return {"error": "Product not found"}, 404
        
        # Update fields
        update_data = {}
        if title:
            update_data["title"] = title
            update_data["slug"] = Product.from_dict({"title": title}).slug
        if description:
            update_data["description"] = description
        if category:
            update_data["category"] = category
        if price:
            update_data["price"] = float(price)
        
        # Handle image upload
        if image and image.filename:
            if allowed_file(image.filename, current_app.config['ALLOWED_EXTENSIONS']):
                filename = secure_filename(f"{uuid.uuid4()}_{image.filename}")
                image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
                image.save(image_path)
                update_data["image_url"] = f"/static/uploads/{filename}"
        
        # Update product
        products_collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        # Get updated product
        updated_product_data = products_collection.find_one({"_id": ObjectId(product_id)})
        updated_product = Product.from_dict(updated_product_data)
        
        return {"product": updated_product.to_dict()}, 200
    except Exception as e:
        return {"error": str(e)}, 400

def delete_product(product_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    products_collection = db.products
    
    # Delete product
    try:
        result = products_collection.delete_one({"_id": ObjectId(product_id)})
        if result.deleted_count == 0:
            return {"error": "Product not found"}, 404
        
        return {"message": "Product deleted successfully"}, 200
    except Exception as e:
        return {"error": str(e)}, 400

def get_user_products(user_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    products_collection = db.products
    
    # Get products
    try:
        products_data = products_collection.find({"seller_id": ObjectId(user_id)}).sort("created_at", -1)
        products = [Product.from_dict(product).to_dict() for product in products_data]
        
        return {"products": products}, 200
    except Exception as e:
        return {"error": str(e)}, 400

def allowed_file(filename, allowed_extensions):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in allowed_extensions