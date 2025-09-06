from datetime import datetime
from bson import ObjectId
from slugify import slugify

class Product:
    def __init__(self, title, description, category, price, image_url=None, 
                 seller_id=None, created_at=None, updated_at=None, _id=None):
        self.title = title
        self.description = description
        self.category = category
        self.price = float(price)
        self.image_url = image_url or ""
        self.seller_id = seller_id
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self._id = _id or ObjectId()
        self.slug = slugify(title)
    
    def to_dict(self):
        return {
            "_id": str(self._id),
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "price": self.price,
            "image_url": self.image_url,
            "seller_id": str(self.seller_id) if self.seller_id else None,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "slug": self.slug
        }
    
    @classmethod
    def from_dict(cls, data):
        if not data:
            return None
        return cls(
            title=data.get('title'),
            description=data.get('description'),
            category=data.get('category'),
            price=data.get('price'),
            image_url=data.get('image_url'),
            seller_id=data.get('seller_id'),
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at'),
            _id=data.get('_id')
        )