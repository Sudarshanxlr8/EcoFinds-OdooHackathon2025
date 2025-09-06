// Main application JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
});

// Global state
const state = {
    currentPage: null,
    user: null,
    products: [],
    categories: ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Sports', 'Other'],
    cart: [],
    purchases: []
};

// Initialize the application
function initApp() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    
    // If we're on the products page and have a token, assume we just logged in successfully
    if (window.location.pathname.includes('/products') && token && !state.user) {
        // Skip the immediate profile check and let the page load
        setupEventListeners();
        return;
    }
    
    if (token) {
        // Verify token and get user data
        API.getUserProfile()
            .then(data => {
                if (data.user) {
                    state.user = data.user;
                    // Update UI based on current page
                    updateUIForCurrentPage();
                } else {
                    // If token is invalid, redirect to login
                    if (!window.location.pathname.includes('/login') && 
                        !window.location.pathname.includes('/signup')) {
                        window.location.href = '/login';
                    }
                }
            })
            .catch(() => {
                localStorage.removeItem('token');
                // If token is invalid, redirect to login
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/signup')) {
                    window.location.href = '/login';
                }
            });
    } else {
        // If no token, redirect to login unless already on login/signup page
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/signup')) {
            window.location.href = '/login';
        }
    }
    
    // Setup event listeners for navigation and actions
    setupEventListeners();
}

// Setup event listeners based on current page
function setupEventListeners() {
    // Determine current page
    const path = window.location.pathname;
    state.currentPage = path.substring(1) || 'index';
    
    // Common event listeners for all pages
    setupCommonListeners();
    
    // Page-specific event listeners
    switch (state.currentPage) {
        case 'login':
            setupLoginListeners();
            break;
        case 'signup':
            setupSignupListeners();
            break;
        case 'products':
            loadProducts();
            break;
        case 'product-detail':
        case 'product':
            loadProductDetail();
            break;
        case 'add-product':
            setupAddProductListeners();
            break;
        case 'my-listings':
            loadMyListings();
            break;
        case 'cart':
            loadCart();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'purchases':
            loadPurchases();
            break;
    }
}

// Setup common event listeners for all pages
function setupCommonListeners() {
    // User menu toggle
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    
    if (userMenuButton && userMenu) {
        userMenuButton.addEventListener('click', () => {
            userMenu.classList.toggle('hidden');
        });
    }
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Logout functionality
    const logoutLinks = document.querySelectorAll('#logout-link, #mobile-logout-link');
    
    logoutLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
    });
}

// Setup login page event listeners
function setupLoginListeners() {
    const loginBtn = document.getElementById('login-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
}

// Setup signup page event listeners
function setupSignupListeners() {
    const signupBtn = document.getElementById('signup-btn');
    
    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleSignup();
        });
    }
}

// Update UI based on current page
function updateUIForCurrentPage() {
    // Update cart count
    updateCartCount();
    
    // Update user info
    updateUserInfo();
    
    // Page-specific updates
    switch (state.currentPage) {
        case 'products':
            loadProducts();
            break;
        case 'product-detail':
        case 'product':
            loadProductDetail();
            break;
        case 'cart':
            loadCart();
            break;
        case 'my-listings':
            loadMyListings();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'purchases':
            loadPurchases();
            break;
    }
}

// Update cart count in the UI
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    
    if (cartCountElements.length > 0) {
        API.getCart()
            .then(data => {
                if (!data.error) {
                    state.cart = data.cart_items;
                    const count = state.cart.reduce((total, item) => total + item.quantity, 0);
                    
                    cartCountElements.forEach(element => {
                        element.textContent = count;
                    });
                }
            })
            .catch(error => console.error('Failed to update cart count:', error));
    }
}

// Update user info in the UI
function updateUserInfo() {
    const usernameElements = document.querySelectorAll('#username-display, #mobile-username');
    const emailElements = document.querySelectorAll('#email-display, #mobile-email');
    
    if (state.user && (usernameElements.length > 0 || emailElements.length > 0)) {
        usernameElements.forEach(element => {
            if (element) element.textContent = state.user.username;
        });
        
        emailElements.forEach(element => {
            if (element) element.textContent = state.user.email;
        });
    }
}

// Authentication handlers
function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showNotification('Email and password are required', 'error');
        return;
    }
    
    API.login({ email, password })
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
                return;
            }
            
            // Store token and user data
            localStorage.setItem('token', data.access_token);
            state.user = data.user;
            
            // Direct redirect to products page
            window.location.href = '/products';
            showNotification('Login successful', 'success');
        })
        .catch(error => {
            showNotification('Login failed', 'error');
        });
}

function handleSignup() {
    const username = document.getElementById('username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    if (!username || !email || !password) {
        showNotification('All fields are required', 'error');
        return;
    }
    
    API.register({ username, email, password })
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
                return;
            }
            
            // Store token and user data
            localStorage.setItem('token', data.access_token);
            state.user = data.user;
            
            // Direct redirect to products page
            window.location.href = '/products';
            showNotification('Registration successful', 'success');
        })
        .catch(error => {
            showNotification('Registration failed', 'error');
        });
}

function logout() {
    // Show notification before changing location
    showNotification('Logged out successfully', 'success');
    
    // Small delay to allow notification to be seen
    setTimeout(() => {
        localStorage.removeItem('token');
        state.user = null;
        window.location.href = '/login';
    }, 500);
}

// Product functions
function loadProducts() {
    const productGrid = document.getElementById('products-grid'); // Changed from 'product-grid' to 'products-grid'
    const categoryFilter = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (productGrid) {
        // Get filter values
        const category = categoryFilter ? categoryFilter.value : null;
        const searchQuery = searchInput ? searchInput.value : null;
        
        // Fetch products
        API.getAllProducts(category, searchQuery)
            .then(data => {
                if (data.error) {
                    showNotification(data.error, 'error');
                    return;
                }
                
                state.products = data.products;
                renderProducts(productGrid);
            })
            .catch(error => {
                showNotification('Failed to load products', 'error');
            });
    }
    
    // Setup filter event listeners
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => loadProducts());
    }
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadProducts();
        });
        
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                loadProducts();
            }
        });
    }
    
    // Setup add product button if it exists
    const addProductBtn = document.getElementById('add-product-btn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            window.location.href = '/add-product';
        });
    }
}

function renderProducts(container) {
    // Clear container
    container.innerHTML = '';
    
    if (state.products.length === 0) {
        container.innerHTML = '<p class="text-center py-8 text-gray-500">No products found.</p>';
        return;
    }
    
    // Create product cards
    state.products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-white rounded-lg shadow overflow-hidden';
        productCard.innerHTML = `
            <div class="h-48 bg-gray-200">
                <img src="${product.image_url || '/static/images/placeholder.jpg'}" alt="${product.title}" class="h-full w-full object-cover">
            </div>
            <div class="p-4">
                <h3 class="text-lg font-medium text-gray-900">${product.title}</h3>
                <p class="text-green-600 font-bold">$${product.price.toFixed(2)}</p>
                <p class="text-sm text-gray-500">${product.category}</p>
            </div>
        `;
        
        // Add click event to view product detail
        productCard.addEventListener('click', () => {
            window.location.href = `/product/${product._id}`;
        });
        
        container.appendChild(productCard);
    });
}

function loadProductDetail() {
    // Extract product ID from URL
    const path = window.location.pathname;
    const productId = path.split('/').pop();
    
    if (productId) {
        API.getProduct(productId)
            .then(data => {
                if (data.error) {
                    showNotification(data.error, 'error');
                    return;
                }
                
                const product = data.product;
                
                // Update product detail elements
                const imageEl = document.getElementById('product-detail-image');
                const categoryEl = document.getElementById('product-detail-category');
                const titleEl = document.getElementById('product-detail-title');
                const priceEl = document.getElementById('product-detail-price');
                const descriptionEl = document.getElementById('product-detail-description');
                
                if (imageEl) imageEl.src = product.image_url || '/static/images/placeholder.jpg';
                if (categoryEl) categoryEl.textContent = product.category;
                if (titleEl) titleEl.textContent = product.title;
                if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;
                if (descriptionEl) descriptionEl.innerHTML = product.description; // Changed from textContent to innerHTML
                
                // Setup add to cart button
                const addToCartBtn = document.getElementById('add-to-cart-btn');
                if (addToCartBtn) {
                    // Remove any existing event listeners
                    const newBtn = addToCartBtn.cloneNode(true);
                    addToCartBtn.parentNode.replaceChild(newBtn, addToCartBtn);
                    
                    newBtn.addEventListener('click', () => {
                        API.addToCart(product._id)
                            .then(data => {
                                if (data.error) {
                                    showNotification(data.error, 'error');
                                    return;
                                }
                                
                                showNotification('Product added to cart', 'success');
                                updateCartCount();
                            })
                            .catch(error => {
                                showNotification('Failed to add product to cart', 'error');
                            });
                    });
                }
            })
            .catch(error => {
                showNotification('Failed to load product details', 'error');
                console.error(error);
            });
    }
}

function setupAddProductListeners() {
    const addProductForm = document.getElementById('add-product-form');
    
    if (addProductForm) {
        addProductForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const title = document.getElementById('title').value;
            const category = document.getElementById('category').value;
            const price = document.getElementById('price').value;
            const description = document.getElementById('description').value;
            const imageInput = document.getElementById('image');
            
            if (!title || !category || !price) {
                showNotification('Title, category, and price are required', 'error');
                return;
            }
            
            const productData = {
                title,
                category,
                price,
                description
            };
            
            if (imageInput && imageInput.files.length > 0) {
                productData.image = imageInput.files[0];
            }
            
            API.createProduct(productData)
                .then(data => {
                    if (data.error) {
                        showNotification(data.error, 'error');
                        return;
                    }
                    
                    showNotification('Product created successfully', 'success');
                    window.location.href = '/my-listings';
                })
                .catch(error => {
                    showNotification('Failed to create product', 'error');
                });
        });
    }
}

function loadMyListings() {
    const listingsContainer = document.getElementById('my-listings-list');
    
    if (listingsContainer) {
        API.getUserProducts()
            .then(data => {
                if (data.error) {
                    showNotification(data.error, 'error');
                    return;
                }
                
                const products = data.products;
                
                // Clear container
                listingsContainer.innerHTML = '';
                
                if (products.length === 0) {
                    listingsContainer.innerHTML = '<li class="px-4 py-8 text-center text-gray-500">You have no listings yet.</li>';
                    return;
                }
                
                // Create listing items
                products.forEach(product => {
                    const template = document.getElementById('listing-item-template');
                    if (template) {
                        const clone = document.importNode(template.content, true);
                        
                        // Set product data
                        const imageEl = clone.querySelector('.listing-image');
                        const titleEl = clone.querySelector('.listing-title');
                        const priceEl = clone.querySelector('.listing-price');
                        const categoryEl = clone.querySelector('.listing-category');
                        
                        if (imageEl) imageEl.src = product.image_url || '/static/images/placeholder.jpg';
                        if (titleEl) titleEl.textContent = product.title;
                        if (priceEl) priceEl.textContent = `$${product.price.toFixed(2)}`;
                        if (categoryEl) categoryEl.textContent = product.category;
                        
                        // Setup edit button
                        const editBtn = clone.querySelector('.edit-listing-btn');
                        if (editBtn) {
                            editBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                setupEditProductModal(product);
                            });
                        }
                        
                        // Setup delete button
                        const deleteBtn = clone.querySelector('.delete-listing-btn');
                        if (deleteBtn) {
                            deleteBtn.addEventListener('click', (e) => {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this product?')) {
                                    API.deleteProduct(product._id)
                                        .then(data => {
                                            if (data.error) {
                                                showNotification(data.error, 'error');
                                                return;
                                            }
                                            
                                            showNotification('Product deleted successfully', 'success');
                                            loadMyListings();
                                        })
                                        .catch(error => {
                                            showNotification('Failed to delete product', 'error');
                                        });
                                }
                            });
                        }
                        
                        listingsContainer.appendChild(clone);
                    }
                });
            })
            .catch(error => {
                showNotification('Failed to load your listings', 'error');
            });
    }
}

function setupEditProductModal(product) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('edit-product-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-product-modal';
        modal.className = 'fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50';
        
        const template = document.getElementById('edit-product-template');
        if (template) {
            modal.appendChild(document.importNode(template.content, true));
            document.body.appendChild(modal);
        }
    } else {
        modal.classList.remove('hidden');
    }
    
    // Fill form with product data
    const titleInput = document.getElementById('edit-title');
    const categorySelect = document.getElementById('edit-category');
    const priceInput = document.getElementById('edit-price');
    const descriptionInput = document.getElementById('edit-description');
    
    if (titleInput) titleInput.value = product.title;
    if (categorySelect) categorySelect.value = product.category;
    if (priceInput) priceInput.value = product.price;
    if (descriptionInput) descriptionInput.value = product.description || '';
    
    // Setup close button
    const closeBtn = document.getElementById('edit-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // Setup form submission
    const editForm = document.getElementById('edit-product-form');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const updatedData = {
                title: titleInput.value,
                category: categorySelect.value,
                price: priceInput.value,
                description: descriptionInput.value
            };
            
            const imageInput = document.getElementById('edit-image');
            if (imageInput && imageInput.files.length > 0) {
                updatedData.image = imageInput.files[0];
            }
            
            API.updateProduct(product._id, updatedData)
                .then(data => {
                    if (data.error) {
                        showNotification(data.error, 'error');
                        return;
                    }
                    
                    showNotification('Product updated successfully', 'success');
                    modal.classList.add('hidden');
                    loadMyListings();
                })
                .catch(error => {
                    showNotification('Failed to update product', 'error');
                });
        });
    }
}

function loadCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cartItemsContainer) {
        API.getCart()
            .then(data => {
                if (data.error) {
                    showNotification(data.error, 'error');
                    return;
                }
                
                state.cart = data.cart_items;
                
                // Clear container
                cartItemsContainer.innerHTML = '';
                
                if (state.cart.length === 0) {
                    cartItemsContainer.innerHTML = '<div class="px-4 py-8 text-center text-gray-500">Your cart is empty.</div>';
                    if (cartTotalElement) cartTotalElement.textContent = '$0.00';
                    if (checkoutBtn) checkoutBtn.disabled = true;
                    return;
                }
                
                // Calculate total
                const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                if (cartTotalElement) cartTotalElement.textContent = `$${total.toFixed(2)}`;
                
                // Create cart items
                state.cart.forEach(item => {
                    const template = document.getElementById('cart-item-template');
                    if (template) {
                        const clone = document.importNode(template.content, true);
                        
                        // Set item data
                        const imageEl = clone.querySelector('.cart-item-image');
                        const titleEl = clone.querySelector('.cart-item-title');
                        const priceEl = clone.querySelector('.cart-item-price');
                        const quantityEl = clone.querySelector('.cart-item-quantity');
                        
                        if (imageEl) imageEl.src = item.product.image_url || '/static/images/placeholder.jpg';
                        if (titleEl) titleEl.textContent = item.product.title;
                        if (priceEl) priceEl.textContent = `$${item.product.price.toFixed(2)}`;
                        if (quantityEl) quantityEl.textContent = item.quantity;
                        
                        // Setup quantity buttons
                        const decreaseBtn = clone.querySelector('.cart-item-decrease');
                        const increaseBtn = clone.querySelector('.cart-item-increase');
                        
                        if (decreaseBtn) {
                            decreaseBtn.addEventListener('click', () => {
                                if (item.quantity > 1) {
                                    API.updateCartItem(item.product._id, item.quantity - 1)
                                        .then(() => loadCart())
                                        .catch(() => showNotification('Failed to update quantity', 'error'));
                                }
                            });
                        }
                        
                        if (increaseBtn) {
                            increaseBtn.addEventListener('click', () => {
                                API.updateCartItem(item.product._id, item.quantity + 1)
                                    .then(() => loadCart())
                                    .catch(() => showNotification('Failed to update quantity', 'error'));
                            });
                        }
                        
                        // Setup remove button
                        const removeBtn = clone.querySelector('.cart-item-remove');
                        if (removeBtn) {
                            removeBtn.addEventListener('click', () => {
                                API.removeFromCart(item.product._id)
                                    .then(() => {
                                        loadCart();
                                        updateCartCount();
                                    })
                                    .catch(() => showNotification('Failed to remove item', 'error'));
                            });
                        }
                        
                        cartItemsContainer.appendChild(clone);
                    }
                });
                
                // Setup checkout button
                if (checkoutBtn) {
                    checkoutBtn.disabled = false;
                    
                    // Remove any existing event listeners
                    const newBtn = checkoutBtn.cloneNode(true);
                    checkoutBtn.parentNode.replaceChild(newBtn, checkoutBtn);
                    
                    newBtn.addEventListener('click', () => {
                        API.checkout()
                            .then(data => {
                                if (data.error) {
                                    showNotification(data.error, 'error');
                                    return;
                                }
                                
                                showNotification('Checkout successful', 'success');
                                window.location.href = '/purchases';
                            })
                            .catch(() => showNotification('Checkout failed', 'error'));
                    });
                }
            })
            .catch(error => {
                showNotification('Failed to load cart', 'error');
                console.error(error);
            });
    }
}

function loadProfile() {
    const usernameInput = document.getElementById('profile-username');
    const emailInput = document.getElementById('profile-email');
    const profileForm = document.getElementById('profile-form');
    
    if (usernameInput && emailInput && state.user) {
        usernameInput.value = state.user.username;
        emailInput.value = state.user.email;
    }
    
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const userData = {
                username: usernameInput.value,
                email: emailInput.value
            };
            
            API.updateUserProfile(userData)
                .then(data => {
                    if (data.error) {
                        showNotification(data.error, 'error');
                        return;
                    }
                    
                    state.user = data.user;
                    showNotification('Profile updated successfully', 'success');
                    updateUserInfo();
                })
                .catch(error => {
                    showNotification('Failed to update profile', 'error');
                });
        });
    }
}

function loadPurchases() {
    const purchasesContainer = document.getElementById('purchases-list');
    
    if (purchasesContainer) {
        API.getPurchases()
            .then(data => {
                if (data.error) {
                    showNotification(data.error, 'error');
                    return;
                }
                
                state.purchases = data.purchases;
                
                // Clear container
                purchasesContainer.innerHTML = '';
                
                if (state.purchases.length === 0) {
                    purchasesContainer.innerHTML = '<div class="bg-white shadow overflow-hidden sm:rounded-lg px-4 py-8 text-center text-gray-500">You have no previous purchases.</div>';
                    return;
                }
                
                // Create purchase items
                state.purchases.forEach(purchase => {
                    const template = document.getElementById('purchase-template');
                    if (template) {
                        const clone = document.importNode(template.content, true);
                        
                        // Set purchase data
                        const idEl = clone.querySelector('.purchase-id');
                        const dateEl = clone.querySelector('.purchase-date');
                        const totalEl = clone.querySelector('.purchase-total');
                        const itemsContainer = clone.querySelector('.purchase-items');
                        
                        if (idEl) idEl.textContent = purchase._id.substring(0, 8);
                        if (dateEl) dateEl.textContent = new Date(purchase.created_at).toLocaleDateString();
                        
                        // Calculate total
                        const total = purchase.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                        if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
                        
                        // Create purchase items
                        if (itemsContainer) {
                            purchase.items.forEach(item => {
                                const itemTemplate = document.getElementById('purchase-item-template');
                                if (itemTemplate) {
                                    const itemClone = document.importNode(itemTemplate.content, true);
                                    
                                    // Set item data
                                    const titleEl = itemClone.querySelector('.purchase-item-title');
                                    const priceEl = itemClone.querySelector('.purchase-item-price');
                                    const quantityEl = itemClone.querySelector('.purchase-item-quantity');
                                    
                                    if (titleEl) titleEl.textContent = item.title;
                                    if (priceEl) priceEl.textContent = `$${item.price.toFixed(2)}`;
                                    if (quantityEl) quantityEl.textContent = item.quantity;
                                    
                                    itemsContainer.appendChild(itemClone);
                                }
                            });
                        }
                        
                        purchasesContainer.appendChild(clone);
                    }
                });
            })
            .catch(error => {
                showNotification('Failed to load purchases', 'error');
            });
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'fixed top-4 right-4 px-4 py-2 rounded-md shadow-md transform transition-all duration-300 opacity-0 translate-y-[-20px]';
        document.body.appendChild(notification);
    }
    
    // Set notification type
    notification.className = 'fixed top-4 right-4 px-4 py-2 rounded-md shadow-md transform transition-all duration-300';
    
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    // Set message
    notification.textContent = message;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('opacity-100', 'translate-y-0');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('opacity-100', 'translate-y-0');
        notification.classList.add('opacity-0', 'translate-y-[-20px]');
    }, 3000);
}