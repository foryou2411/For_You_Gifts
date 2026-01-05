// Mock Product Data
const products = [
    // Gift Boxes
    {
        id: 1,
        name: "Premium Luxury Box",
        category: "giftboxes",
        price: 5500,
        image: "images/gift-box.png",
        rating: 5
    },


    // Flowers
    {
        id: 3,
        name: "Red Rose Bouquet",
        category: "flowers",
        price: 3500,
        image: "images/red-roses.png",
        rating: 5
    },
    {
        id: 4,
        name: "White Lilies",
        category: "flowers",
        price: 2800,
        image: "https://placehold.co/400x400/f8fafc/64748b?text=White+Lilies",
        rating: 4
    },

    // Chocolates
    {
        id: 5,
        name: "Ferrero Rocher (24 Pack)",
        category: "chocolates",
        price: 4800,
        image: "images/chocolates.png",
        rating: 5
    },
    {
        id: 6,
        name: "Lindt Swiss Luxury",
        category: "chocolates",
        price: 3200,
        image: "https://placehold.co/400x400/fff7ed/9a3412?text=Lindt",
        rating: 5
    },

    // Teddy Bears
    {
        id: 7,
        name: "Giant Cuddly Bear",
        category: "teddybears",
        price: 6500,
        image: "https://placehold.co/400x400/ede9fe/6d28d9?text=Giant+Bear",
        rating: 5
    },
    {
        id: 8,
        name: "Pink Ribbon Teddy",
        category: "teddybears",
        price: 2500,
        image: "images/teddy-bear.png",
        rating: 4
    }
];

// Cart State
let cart = JSON.parse(localStorage.getItem('forYouCart')) || [];

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Check which page we are on
    if (productsGrid) {
        renderProducts();
        setupFilters();
    }

    if (cartItemsContainer) {
        renderCart();
    }

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});

// Render Products
function renderProducts(filterCategory = 'all') {
    if (!productsGrid) return;

    productsGrid.innerHTML = '';

    const filteredProducts = filterCategory === 'all'
        ? products
        : products.filter(p => p.category === filterCategory);

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500">No products found in this category.</div>`;
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 group";
        card.innerHTML = `
            <div class="relative overflow-hidden rounded-xl mb-4 aspect-square">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500">
                <button onclick="addToCart(${product.id})" class="absolute bottom-3 right-3 bg-white text-brand-500 w-10 h-10 rounded-full shadow-lg flex items-center justify-center hover:bg-brand-500 hover:text-white transition-colors">
                    <i class="fa-solid fa-plus"></i>
                </button>
            </div>
            <div>
                <span class="text-xs font-bold text-brand-500 uppercase tracking-wider">${product.category}</span>
                <h3 class="text-lg font-bold text-slate-800 mb-1">${product.name}</h3>
                <div class="flex items-center justify-between mt-2">
                    <span class="text-lg font-bold text-slate-900">Rs. ${product.price.toLocaleString()}</span>
                    <div class="text-yellow-400 text-sm">
                        ${getStarRating(product.rating)}
                    </div>
                </div>
            </div>
        `;
        productsGrid.appendChild(card);
    });
}

function getStarRating(rating) {
    return '<i class="fa-solid fa-star"></i>'.repeat(rating) + '<i class="fa-regular fa-star"></i>'.repeat(5 - rating);
}

// Setup Filters
function setupFilters() {
    const filters = document.querySelectorAll('.category-filter');

    // specific URL param check
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');

    if (categoryParam) {
        renderProducts(categoryParam);
        // Highlight active filter
        filters.forEach(btn => {
            if (btn.dataset.category === categoryParam) {
                btn.classList.add('bg-brand-500', 'text-white');
                btn.classList.remove('bg-white', 'text-slate-600');
            } else {
                btn.classList.remove('bg-brand-500', 'text-white');
                btn.classList.add('bg-white', 'text-slate-600');
            }
        });
    }

    filters.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all
            filters.forEach(b => {
                b.classList.remove('bg-brand-500', 'text-white');
                b.classList.add('bg-white', 'text-slate-600');
            });
            // Add active class to clicked
            e.target.closest('button').classList.add('bg-brand-500', 'text-white');
            e.target.closest('button').classList.remove('bg-white', 'text-slate-600');

            const category = e.target.closest('button').dataset.category;
            renderProducts(category);

            // Update URL without reload (optional, for shareability)
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('category', category);
            window.history.pushState({}, '', newUrl);
        });
    });
}

// Cart Logic
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartCount();

    // Simple notification (custom toast replacement)
    // In a real app, use a toast library
    const btn = event.target.closest('button');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    btn.classList.add('bg-green-500', 'text-white');
    setTimeout(() => {
        btn.innerHTML = originalContent;
        btn.classList.remove('bg-green-500', 'text-white');
    }, 1000);
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart(); // Re-render cart page
    updateCartCount();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity < 1) item.quantity = 1;
        saveCart();
        renderCart();
        updateCartCount();
    }
}

function saveCart() {
    localStorage.setItem('forYouCart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) {
        cartCount.textContent = count;
        if (count > 0) {
            cartCount.classList.remove('scale-0');
            cartCount.classList.add('scale-100');
        } else {
            cartCount.classList.remove('scale-100');
            cartCount.classList.add('scale-0');
        }
    }
}

function renderCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <tr>
                <td colspan="4" class="py-8 text-center text-slate-500">Your cart is empty.</td>
            </tr>
        `;
        if (cartTotalElement) cartTotalElement.textContent = 'Rs. 0';
        return;
    }

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const row = document.createElement('tr');
        row.className = "border-b border-slate-100 last:border-0";
        row.innerHTML = `
            <td class="py-4 pl-4">
                <div class="flex items-center gap-4">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover bg-slate-100">
                    <div>
                        <h4 class="font-bold text-slate-800">${item.name}</h4>
                        <p class="text-sm text-slate-500">Rs. ${item.price}</p>
                    </div>
                </div>
            </td>
            <td class="py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                    <button onclick="updateQuantity(${item.id}, -1)" class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"><i class="fa-solid fa-minus"></i></button>
                    <span class="w-8 text-center font-medium">${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)" class="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs"><i class="fa-solid fa-plus"></i></button>
                </div>
            </td>
            <td class="py-4 text-right pr-4 font-bold text-slate-800">Rs. ${itemTotal.toLocaleString()}</td>
            <td class="py-4 text-center pr-4">
                <button onclick="removeFromCart(${item.id})" class="text-rose-400 hover:text-rose-600 transition-colors"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        cartItemsContainer.appendChild(row);
    });

    if (cartTotalElement) cartTotalElement.textContent = `Rs. ${total.toLocaleString()}`;
}
