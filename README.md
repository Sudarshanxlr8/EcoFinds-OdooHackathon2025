🌱 EcoFinds – Sustainable Second-Hand Marketplace

EcoFinds is a vibrant and trusted platform that empowers sustainable consumption by enabling people to buy and sell pre-owned goods.
The project was built for Odoo Hackathon 2025, focusing on extending product lifecycles, reducing waste, and fostering responsible consumption.

🚀 Challenge

“EcoFinds – Empowering Sustainable Consumption through a Second-Hand Marketplace”

🌍 Overall Vision

EcoFinds aims to revolutionize the way people reuse goods by providing an accessible, user-friendly platform where buyers and sellers connect. It envisions becoming the go-to marketplace for conscious consumers seeking unique finds and responsible alternatives to buying new items.

🎯 Mission

Build a desktop + mobile-friendly application.

Provide secure authentication, product listings, browsing, and purchasing.

Deliver an intuitive, sustainable, and community-driven experience.

✨ Core Features

✅ User Authentication (Sign up/login with secure storage)
✅ Profile Management (Basic dashboard, editable profile)
✅ Product Listings (CRUD) (Add, update, delete, browse items)
✅ Product Browsing (List view with filters and search)
✅ Category Filtering & Keyword Search
✅ Product Detail View (Full details page)
✅ Cart (Add/remove products)
✅ Previous Purchases View (Track purchase history)

🛠️ Tech Stack

Frontend: HTML, TailwindCSS, JavaScript
Backend: Python Flask
Database: MongoDB Atlas (Mongoose-like ODM via PyMongo)
Authentication: JWT + Bcrypt (secure password storage)

📂 Folder Structure
EcoFinds/
│── frontend/
│   ├── index.html
│   ├── assets/
│   │   ├── css/ (Tailwind setup)
│   │   ├── js/  (Frontend scripts)
│   └── pages/   (Login, Dashboard, Listings, Cart, Purchases)
│
│── backend/
│   ├── app.py            # Flask entry point
│   ├── routes/           # API routes
│   ├── models/           # MongoDB schemas
│   ├── controllers/      # Business logic
│   ├── utils/            # Auth, validation, helpers
│   └── requirements.txt
│
│── README.md

⚙️ Installation & Setup
1️⃣ Clone Repository
git clone https://github.com/yourusername/ecofinds.git
cd ecofinds

2️⃣ Setup Backend (Flask)
cd backend
python -m venv venv
source venv/bin/activate   # (Linux/Mac)
venv\Scripts\activate      # (Windows)
pip install -r requirements.txt


Run Flask server:

python app.py

3️⃣ Setup Frontend

Open frontend/index.html in your browser OR serve using a simple server:

cd frontend
python -m http.server 8000

4️⃣ MongoDB Setup

Create a MongoDB Atlas Cluster.

Add connection string to backend/config.py.

Collections: users, products, carts, purchases.
