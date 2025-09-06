from datetime import datetime
from bson import ObjectId
import bcrypt

class User:
    def __init__(self, email, password, username=None, created_at=None, _id=None):
        self.email = email
        self.password = password  # This should be hashed before storing
        self.username = username or email.split('@')[0]
        self.created_at = created_at or datetime.utcnow()
        self._id = _id or ObjectId()
    
    @staticmethod
    def hash_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def check_password(hashed_password, password):
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def to_dict(self):
        return {
            "_id": str(self._id),
            "email": self.email,
            "username": self.username,
            "created_at": self.created_at
        }
    
    @classmethod
    def from_dict(cls, data):
        if not data:
            return None
        return cls(
            email=data.get('email'),
            password=data.get('password'),
            username=data.get('username'),
            created_at=data.get('created_at'),
            _id=data.get('_id')
        )