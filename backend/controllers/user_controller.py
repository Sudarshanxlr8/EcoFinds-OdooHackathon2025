from flask import current_app
from pymongo import MongoClient
from bson import ObjectId
from backend.models.user_model import User
from backend.models.purchase_model import Purchase, PurchaseItem
from backend.models.cart_model import Cart

def get_user_profile(user_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    users_collection = db.users
    
    # Get user
    try:
        user_data = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user_data:
            return {"error": "User not found"}, 404
        
        user = User.from_dict(user_data)
        return {"user": user.to_dict()}, 200
    except Exception as e:
        return {"error": str(e)}, 400

def update_user_profile(user_id, username=None, email=None):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    users_collection = db.users
    
    # Get user
    try:
        user_data = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user_data:
            return {"error": "User not found"}, 404
        
        # Update fields
        update_data = {}
        if username:
            update_data["username"] = username
        if email:
            # Check if email is already taken
            existing_user = users_collection.find_one({"email": email})
            if existing_user and str(existing_user["_id"]) != user_id:
                return {"error": "Email already taken"}, 400
            update_data["email"] = email
        
        # Update user
        users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user_data = users_collection.find_one({"_id": ObjectId(user_id)})
        updated_user = User.from_dict(updated_user_data)
        
        return {"user": updated_user.to_dict()}, 200
    except Exception as e:
        return {"error": str(e)}, 400

def get_user_purchases(user_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    purchases_collection = db.purchases
    
    # Get purchases
    try:
        purchases_data = purchases_collection.find({"user_id": ObjectId(user_id)}).sort("purchase_date", -1)
        purchases = [Purchase.from_dict(purchase).to_dict() for purchase in purchases_data]
        
        return {"purchases": purchases}, 200
    except Exception as e:
        return {"error": str(e)}, 400

def create_purchase_from_cart(user_id):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    carts_collection = db.carts
    products_collection = db.products
    purchases_collection = db.purchases
    
    # Get cart
    cart_data = carts_collection.find_one({"user_id": ObjectId(user_id)})
    if not cart_data or not cart_data.get("items"):
        return {"error": "Cart is empty"}, 400
    
    # Create cart object
    cart = Cart.from_dict(cart_data)
    
    # Create purchase items
    purchase_items = []
    total_amount = 0
    
    for item in cart.items:
        product_data = products_collection.find_one({"_id": ObjectId(item.product_id)})
        if product_data:
            purchase_item = PurchaseItem(
                product_id=item.product_id,
                title=product_data["title"],
                price=product_data["price"],
                quantity=item.quantity
            )
            purchase_items.append(purchase_item)
            total_amount += product_data["price"] * item.quantity
    
    # Create purchase
    purchase = Purchase(
        user_id=ObjectId(user_id),
        items=purchase_items,
        total_amount=total_amount
    )
    
    # Insert purchase into database
    result = purchases_collection.insert_one({
        "_id": purchase._id,
        "user_id": purchase.user_id,
        "items": [item.to_dict() for item in purchase.items],
        "total_amount": purchase.total_amount,
        "purchase_date": purchase.purchase_date
    })
    
    # Clear cart
    cart.clear()
    carts_collection.update_one(
        {"_id": cart._id},
        {"$set": {
            "items": [],
            "updated_at": cart.updated_at
        }}
    )
    
    return {"purchase": purchase.to_dict()}, 201