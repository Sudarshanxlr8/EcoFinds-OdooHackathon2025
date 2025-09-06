from datetime import datetime
from bson import ObjectId

class CartItem:
    def __init__(self, product_id, quantity=1, added_at=None, _id=None):
        self.product_id = product_id
        self.quantity = quantity
        self.added_at = added_at or datetime.utcnow()
        self._id = _id or ObjectId()
    
    def to_dict(self):
        return {
            "_id": str(self._id),
            "product_id": str(self.product_id),
            "quantity": self.quantity,
            "added_at": self.added_at
        }

class Cart:
    def __init__(self, user_id, items=None, created_at=None, updated_at=None, _id=None):
        self.user_id = user_id
        self.items = items or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
        self._id = _id or ObjectId()
    
    def add_item(self, product_id, quantity=1):
        # Check if item already exists in cart
        for item in self.items:
            if str(item.product_id) == str(product_id):
                item.quantity += quantity
                self.updated_at = datetime.utcnow()
                return
        
        # If not, add new item
        self.items.append(CartItem(product_id, quantity))
        self.updated_at = datetime.utcnow()
    
    def remove_item(self, product_id):
        self.items = [item for item in self.items if str(item.product_id) != str(product_id)]
        self.updated_at = datetime.utcnow()
    
    def update_quantity(self, product_id, quantity):
        for item in self.items:
            if str(item.product_id) == str(product_id):
                item.quantity = quantity
                self.updated_at = datetime.utcnow()
                return True
        return False
    
    def clear(self):
        self.items = []
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            "_id": str(self._id),
            "user_id": str(self.user_id),
            "items": [item.to_dict() for item in self.items],
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @classmethod
    def from_dict(cls, data):
        if not data:
            return None
        
        items = []
        for item_data in data.get('items', []):
            item = CartItem(
                product_id=item_data.get('product_id'),
                quantity=item_data.get('quantity'),
                added_at=item_data.get('added_at'),
                _id=item_data.get('_id')
            )
            items.append(item)
        
        return cls(
            user_id=data.get('user_id'),
            items=items,
            created_at=data.get('created_at'),
            updated_at=data.get('updated_at'),
            _id=data.get('_id')
        )