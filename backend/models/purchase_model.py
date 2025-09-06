from datetime import datetime
from bson import ObjectId

class PurchaseItem:
    def __init__(self, product_id, title, price, quantity=1, _id=None):
        self.product_id = product_id
        self.title = title
        self.price = float(price)
        self.quantity = quantity
        self._id = _id or ObjectId()
    
    def to_dict(self):
        return {
            "_id": str(self._id),
            "product_id": str(self.product_id),
            "title": self.title,
            "price": self.price,
            "quantity": self.quantity
        }

class Purchase:
    def __init__(self, user_id, items, total_amount, purchase_date=None, _id=None):
        self.user_id = user_id
        self.items = items
        self.total_amount = float(total_amount)
        self.purchase_date = purchase_date or datetime.utcnow()
        self._id = _id or ObjectId()
    
    def to_dict(self):
        return {
            "_id": str(self._id),
            "user_id": str(self.user_id),
            "items": [item.to_dict() for item in self.items],
            "total_amount": self.total_amount,
            "purchase_date": self.purchase_date
        }
    
    @classmethod
    def from_dict(cls, data):
        if not data:
            return None
        
        items = []
        for item_data in data.get('items', []):
            item = PurchaseItem(
                product_id=item_data.get('product_id'),
                title=item_data.get('title'),
                price=item_data.get('price'),
                quantity=item_data.get('quantity'),
                _id=item_data.get('_id')
            )
            items.append(item)
        
        return cls(
            user_id=data.get('user_id'),
            items=items,
            total_amount=data.get('total_amount'),
            purchase_date=data.get('purchase_date'),
            _id=data.get('_id')
        )