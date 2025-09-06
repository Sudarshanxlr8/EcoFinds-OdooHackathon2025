// API service for making requests to the backend

const API = {
    // Base URL for API requests
    baseURL: '/api',

    // Helper method for making API requests
    async request(endpoint, method = 'GET', data = null, isFormData = false) {
        const url = `${this.baseURL}${endpoint}`;
        const token = localStorage.getItem('token');
        
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        if (!isFormData && data) {
            headers['Content-Type'] = 'application/json';
        }
        
        const config = {
            method,
            headers,
        };
        
        if (data) {
            if (isFormData) {
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }
        
        try {
            const response = await fetch(url, config);
            const responseData = await response.json();
            
            if (!response.ok) {
                throw new Error(responseData.error || 'Something went wrong');
            }
            
            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Auth endpoints
   // API service for making requests to the backend

    // Auth endpoints
    register: async (userData) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },
    
    login: async (credentials) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        return await response.json();
    },
    
    // Product endpoints
    getAllProducts: async (category = null, searchQuery = null) => {
        let url = '/api/products/';
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (searchQuery) params.append('search', searchQuery);
        if (params.toString()) url += `?${params.toString()}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    getProduct: async (productId) => {
        const response = await fetch(`/api/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    createProduct: async (productData) => {
        const formData = new FormData();
        for (const key in productData) {
            formData.append(key, productData[key]);
        }
        
        const response = await fetch('/api/products/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        return await response.json();
    },
    
    updateProduct: async (productId, productData) => {
        const formData = new FormData();
        for (const key in productData) {
            formData.append(key, productData[key]);
        }
        
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        return await response.json();
    },
    
    deleteProduct: async (productId) => {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    getUserProducts: async () => {
        const response = await fetch('/api/products/user', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    // Cart endpoints
    getCart: async () => {
        const response = await fetch('/api/cart/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    addToCart: async (productId, quantity = 1) => {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ product_id: productId, quantity })
        });
        return await response.json();
    },
    
    removeFromCart: async (productId) => {
        const response = await fetch(`/api/cart/remove/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    updateCartItem: async (productId, quantity) => {
        const response = await fetch(`/api/cart/update/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ quantity })
        });
        return await response.json();
    },
    
    checkout: async () => {
        const response = await fetch('/api/cart/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    // User endpoints
    getUserProfile: async () => {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    },
    
    updateUserProfile: async (userData) => {
        const response = await fetch('/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(userData)
        });
        return await response.json();
    },
    
    getPurchases: async () => {
        const response = await fetch('/api/users/purchases', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        return await response.json();
    }
};