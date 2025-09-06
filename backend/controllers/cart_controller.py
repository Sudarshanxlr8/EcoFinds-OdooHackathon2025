from flask import current_app
from pymongo import MongoClient
from bson import ObjectId
from backend.models.cart_model import Cart, CartItem
from backend.models.product_model import Product

def get_user_cart(user_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    carts_collection = db.carts
    products_collection = db.products
    
    # Get cart
    cart_data = carts_collection.find_one({"user_id": ObjectId(user_id)})
    
    # If cart doesn't exist, create one
    if not cart_data:
        cart = Cart(user_id=ObjectId(user_id))
        carts_collection.insert_one({
            "_id": cart._id,
            "user_id": cart.user_id,
            "items": [],
            "created_at": cart.created_at,
            "updated_at": cart.updated_at
        })
        return {"cart": cart.to_dict(), "cart_items": []}, 200
    
    # Create cart object
    cart = Cart.from_dict(cart_data)
    
    # Get product details for each item in cart
    cart_items = []
    for item in cart.items:
        product_data = products_collection.find_one({"_id": ObjectId(item.product_id)})
        if product_data:
            product = Product.from_dict(product_data)
            cart_item = {
                "_id": str(item._id),
                "product": product.to_dict(),
                "quantity": item.quantity,
                "added_at": item.added_at
            }
            cart_items.append(cart_item)
    
    return {"cart": cart.to_dict(), "cart_items": cart_items}, 200

def add_to_cart(user_id, product_id, quantity=1):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    carts_collection = db.carts
    products_collection = db.products
    
    # Check if product exists
    product_data = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product_data:
        return {"error": "Product not found"}, 404
    
    # Get cart
    cart_data = carts_collection.find_one({"user_id": ObjectId(user_id)})
    
    # If cart doesn't exist, create one
    if not cart_data:
        cart = Cart(user_id=ObjectId(user_id))
        cart.add_item(ObjectId(product_id), quantity)
        
        carts_collection.insert_one({
            "_id": cart._id,
            "user_id": cart.user_id,
            "items": [item.to_dict() for item in cart.items],
            "created_at": cart.created_at,
            "updated_at": cart.updated_at
        })
    else:
        # Create cart object
        cart = Cart.from_dict(cart_data)
        
        # Add item to cart
        cart.add_item(ObjectId(product_id), quantity)
        
        # Update cart in database
        carts_collection.update_one(
            {"_id": cart._id},
            {"$set": {
                "items": [item.to_dict() for item in cart.items],
                "updated_at": cart.updated_at
            }}
        )
    
    return {"message": "Item added to cart", "cart": cart.to_dict()}, 200

def remove_from_cart(user_id, product_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    carts_collection = db.carts
    
    # Get cart
    cart_data = carts_collection.find_one({"user_id": ObjectId(user_id)})
    if not cart_data:
        return {"error": "Cart not found"}, 404
    
    # Create cart object
    cart = Cart.from_dict(cart_data)
    
    # Remove item from cart
    cart.remove_item(product_id)
    
    # Update cart in database
    carts_collection.update_one(
        {"_id": cart._id},
        {"$set": {
            "items": [item.to_dict() for item in cart.items],
            "updated_at": cart.updated_at
        }}
    )
    
    return {"message": "Item removed from cart", "cart": cart.to_dict()}, 200

def update_cart_item(user_id, product_id, quantity):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    carts_collection = db.carts
    
    # Get cart
    cart_data = carts_collection.find_one({"user_id": ObjectId(user_id)})
    if not cart_data:
        return {"error": "Cart not found"}, 404
    
    # Create cart object
    cart = Cart.from_dict(cart_data)
    
    # Update item quantity
    success = cart.update_quantity(product_id, quantity)
    if not success:
        return {"error": "Item not found in cart"}, 404
    
    # Update cart in database
    carts_collection.update_one(
        {"_id": cart._id},
        {"$set": {
            "items": [item.to_dict() for item in cart.items],
            "updated_at": cart.updated_at
        }}
    )
    
    return {"message": "Cart updated", "cart": cart.to_dict()}, 200

def clear_cart(user_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    carts_collection = db.carts
    
    # Get cart
    cart_data = carts_collection.find_one({"user_id": ObjectId(user_id)})
    if not cart_data:
        return {"error": "Cart not found"}, 404
    
    # Create cart object
    cart = Cart.from_dict(cart_data)
    
    # Clear cart
    cart.clear()
    
    # Update cart in database
    carts_collection.update_one(
        {"_id": cart._id},
        {"$set": {
            "items": [],
            "updated_at": cart.updated_at
        }}
    )
    
    return {"message": "Cart cleared", "cart": cart.to_dict()}, 200