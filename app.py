from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
import os
from config import Config

# Initialize Flask app
app = Flask(__name__, 
           static_folder='frontend/static',
           template_folder='frontend/templates')

# Load configuration
app.config.from_object(Config)

# Setup CORS
CORS(app)

# Setup JWT
jwt = JWTManager(app)

# Connect to MongoDB
try:
    mongo_client = MongoClient(app.config['MONGO_URI'])
    db = mongo_client.get_database()
    print("Connected to MongoDB successfully!")
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Import routes
from backend.routes.auth_routes import auth_bp
from backend.routes.product_routes import product_bp
from backend.routes.cart_routes import cart_bp
from backend.routes.user_routes import user_bp

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(product_bp, url_prefix='/api/products')
app.register_blueprint(cart_bp, url_prefix='/api/cart')
app.register_blueprint(user_bp, url_prefix='/api/users')

# Frontend routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/products')
def products():
    return render_template('products.html')

@app.route('/product/<product_id>')
def product_detail(product_id):
    return render_template('product-detail.html', product_id=product_id)

@app.route('/add-product')
def add_product():
    return render_template('add-product.html')

@app.route('/my-listings')
def my_listings():
    return render_template('my-listings.html')

@app.route('/cart')
def cart():
    return render_template('cart.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

@app.route('/purchases')
def purchases():
    return render_template('purchases.html')

@app.route('/<path:path>')
def catch_all(path):
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)