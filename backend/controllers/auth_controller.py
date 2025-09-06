from flask import current_app, jsonify
from flask_jwt_extended import create_access_token
from pymongo import MongoClient
from backend.models.user_model import User

def register_user(email, password, username=None):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    users_collection = db.users
    
    # Check if user already exists
    existing_user = users_collection.find_one({"email": email})
    if existing_user:
        return {"error": "Email already registered"}, 400
    
    # Create new user with hashed password
    hashed_password = User.hash_password(password)
    new_user = User(email=email, password=hashed_password, username=username)
    
    # Insert user into database
    result = users_collection.insert_one({
        "_id": new_user._id,
        "email": new_user.email,
        "password": new_user.password,
        "username": new_user.username,
        "created_at": new_user.created_at
    })
    
    # Create access token
    access_token = create_access_token(identity=str(new_user._id))
    
    return {
        "message": "User registered successfully",
        "user": new_user.to_dict(),
        "access_token": access_token
    }, 201

def login_user(email, password):
    # Connect to MongoDB
    client = MongoClient(current_app.config['MONGO_URI'])
    db = client.get_database()
    users_collection = db.users
    
    # Find user by email
    user_data = users_collection.find_one({"email": email})
    if not user_data:
        return {"error": "Invalid email or password"}, 401
    
    # Check password
    if not User.check_password(user_data["password"], password):
        return {"error": "Invalid email or password"}, 401
    
    # Create access token
    access_token = create_access_token(identity=str(user_data["_id"]))
    
    # Create user object
    user = User.from_dict(user_data)
    
    return {
        "message": "Login successful",
        "user": user.to_dict(),
        "access_token": access_token
    }, 200