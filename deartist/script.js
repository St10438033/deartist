
/* ========== script.js ========== */
// DeArtist - Vintage Music Marketplace
// Complete e-commerce functionality: products, cart, filters, vintage interactions

// ========== DATA MODELS ==========
// Product catalog (music, merch, tickets)
const products = [
    // MUSIC (vinyl / digital)
    { id: 1, title: "Midnight Echoes", artist: "The Velvet Shadows", price: 29.99, type: "music", genre: "rock", mediaIcon: "🎸", category: "music", imageIcon: "💿" },
    { id: 2, title: "Saxophone Serenade", artist: "Miles Vintage", price: 34.99, type: "music", genre: "jazz", mediaIcon: "🎷", category: "music" },
    { id: 3, title: "Neon Dreams", artist: "Synthwave Society", price: 27.99, type: "music", genre: "electronic", mediaIcon: "🕹️", category: "music" },
    { id: 4, title: "Acoustic Traveler", artist: "Willow Ridge", price: 24.99, type: "music", genre: "folk", mediaIcon: "🪕", category: "music" },
    { id: 5, title: "Retro Revolver", artist: "Blackout Kids", price: 31.99, type: "music", genre: "rock", mediaIcon: "🎸", category: "music" },
    
    // MERCH (apparel / accessories)
    { id: 6, title: "Vintage Logo Tee", artist: "DeArtist Originals", price: 39.99, type: "merch", genre: "all", mediaIcon: "👕", category: "merch" },
    { id: 7, title: "Embroidered Cap", artist: "Analog Supply", price: 28.99, type: "merch", genre: "all", mediaIcon: "🧢", category: "merch" },
    { id: 8, title: "Tour Poster (Signed)", artist: "The Velvet Shadows", price: 49.99, type: "merch", genre: "rock", mediaIcon: "🖼️", category: "merch" },
    
    // TICKETS (live shows)
    { id: 9, title: "Live at The Analog Hall", artist: "Jazz Collective", price: 45.00, type: "ticket", genre: "jazz", mediaIcon: "🎫", category: "tickets", date: "May 15, 2025" },
    { id: 10, title: "Neon Nights Tour", artist: "Synthwave Society", price: 55.00, type: "ticket", genre: "electronic", mediaIcon: "✨", category: "tickets" },
    { id: 11, title: "Folk Revival Fest", artist: "Willow Ridge & Friends", price: 65.00, type: "ticket", genre: "folk", mediaIcon: "🎵", category: "tickets" },
    { id: 12, title: "Rock the Vintage Stage", artist: "Blackout Kids", price: 49.00, type: "ticket", genre: "rock", mediaIcon: "🤘", category: "tickets" }
];

// Artists spotlight data
const artistsSpotlight = [
    { name: "The Velvet Shadows", genre: "Rock", avatar: "🎸", id: 101 },
    { name: "Miles Vintage", genre: "Jazz", avatar: "🎺", id: 102 },
    { name: "Synthwave Society", genre: "Electronic", avatar: "🌆", id: 103 },
    { name: "Willow Ridge", genre: "Folk", avatar: "🌾", id: 104 },
    { name: "Blackout Kids", genre: "Rock", avatar: "⚡", id: 105 }
];

// ========== GLOBAL STATE ==========
let currentSection = "market"; // market, merch, tickets, artists
let currentGenre = "all";
let cart = []; // each item: { id, quantity, product }

// DOM Elements
const productGrid = document.getElementById("productGrid");
const sectionTitleElem = document.getElementById("sectionTitle");
const genrePillsContainer = document.getElementById("genrePills");
const cartSidebar = document.getElementById("cartSidebar");
const cartBtn = document.getElementById("cartBtn");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsList = document.getElementById("cartItemsList");
const cartTotalPriceSpan = document.getElementById("cartTotalPrice");
const cartCountSpan = document.getElementById("cartCount");
const artistRow = document.getElementById("artistRow");
const exploreBtn = document.getElementById("exploreBtn");
const sellBtn = document.getElementById("sellBtn");

// Navigation links
const navLinks = document.querySelectorAll(".nav-link");

// ========== HELPER FUNCTIONS ==========
function saveCartToLocal() {
    localStorage.setItem("deartist_cart", JSON.stringify(cart));
}

function loadCartFromLocal() {
    const saved = localStorage.getItem("deartist_cart");
    if(saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// Update cart count badge & total
function updateCartUI() {
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.innerText = itemCount;
    
    // render cart items list
    if(cartItemsList) {
        if(cart.length === 0) {
            cartItemsList.innerHTML = '<div class="empty-cart-msg">🎙️ no treasures yet — add some vintage goods!</div>';
        } else {
            cartItemsList.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div>
                        <strong>${item.product.title}</strong><br>
                        <small>${item.product.artist}</small>
                    </div>
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <span>$${(item.product.price * item.quantity).toFixed(2)}</span>
                        <div style="display: flex; gap: 6px;">
                            <button class="cart-qty-btn" data-id="${item.product.id}" data-delta="-1" style="background:#5a3e2a; border:none; border-radius:30px; padding:2px 8px; cursor:pointer;">-</button>
                            <span>${item.quantity}</span>
                            <button class="cart-qty-btn" data-id="${item.product.id}" data-delta="1" style="background:#5a3e2a; border:none; border-radius:30px; padding:2px 8px; cursor:pointer;">+</button>
                        </div>
                        <button class="remove-item" data-id="${item.product.id}" style="background:none; border:none; color:#d68b2c; cursor:pointer;">🗑️</button>
                    </div>
                </div>
            `).join('');
            
            // attach event listeners for cart item controls
            document.querySelectorAll('.cart-qty-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id);
                    const delta = parseInt(btn.dataset.delta);
                    updateCartItemQuantity(id, delta);
                });
            });
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = parseInt(btn.dataset.id);
                    removeFromCart(id);
                });
            });
        }
        
        const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        cartTotalPriceSpan.innerText = `$${total.toFixed(2)}`;
    }
    saveCartToLocal();
}

function addToCart(product) {
    const existing = cart.find(item => item.product.id === product.id);
    if(existing) {
        existing.quantity += 1;
    } else {
        cart.push({ product: product, quantity: 1 });
    }
    updateCartUI();
    // vintage notification vibe (subtle)
    showTemporaryToast(`🎵 ${product.title} added to bag`);
}

function updateCartItemQuantity(productId, delta) {
    const item = cart.find(i => i.product.id === productId);
    if(item) {
        const newQty = item.quantity + delta;
        if(newQty <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQty;
            updateCartUI();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    updateCartUI();
}

function showTemporaryToast(msg) {
    let toast = document.createElement('div');
    toast.innerText = msg;
    toast.style.position = 'fixed';
    toast.style.bottom = '30px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = '#2b211cee';
    toast.style.color = '#fae3b3';
    toast.style.padding = '12px 28px';
    toast.style.borderRadius = '60px';
    toast.style.border = '1px solid #e2aa60';
    toast.style.fontFamily = 'Inter';
    toast.style.fontWeight = '500';
    toast.style.zIndex = '3000';
    toast.style.backdropFilter = 'blur(8px)';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2200);
}

// ========== RENDER PRODUCTS (with genre & section filter) ==========
function getFilteredProducts() {
    let filtered = [...products];
    
    // filter by section (market = music only? but we keep music+merch+tickets? Actually DeArtist: market shows all, but merch and tickets tabs)
    if(currentSection === "market") {
        // show all types: music, merch, tickets (full marketplace)
        filtered = filtered;
    } else if(currentSection === "merch") {
        filtered = filtered.filter(p => p.type === "merch");
    } else if(currentSection === "tickets") {
        filtered = filtered.filter(p => p.type === "ticket");
    } else if(currentSection === "artists") {
        // artists tab shows just music? but we will show artist cards later anyway; for products maybe show music only
        filtered = filtered.filter(p => p.type === "music");
    } else {
        filtered = filtered.filter(p => p.type === "music");
    }
    
    // genre filter
    if(currentGenre !== "all") {
        filtered = filtered.filter(p => p.genre === currentGenre || p.genre === "all");
    }
    return filtered;
}

function renderProducts() {
    const filtered = getFilteredProducts();
    if(!productGrid) return;
    
    if(filtered.length === 0) {
        productGrid.innerHTML = `<div class="loader-vintage" style="grid-column:1/-1; text-align:center;">🎚️ no records found... adjust the dial 🎚️</div>`;
        return;
    }
    
    productGrid.innerHTML = filtered.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="card-media">
                <span style="font-size: 4rem;">${product.mediaIcon || '🎵'}</span>
            </div>
            <div class="card-info">
                <div class="product-title">${product.title}</div>
                <div class="artist-name"><i class="fas fa-user"></i> ${product.artist}</div>
                ${product.type === 'ticket' && product.date ? `<div style="font-size:0.7rem; color:#dbb06b;">📅 ${product.date}</div>` : ''}
                <div class="price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart" data-id="${product.id}"><i class="fas fa-shopping-bag"></i> add to bag</button>
            </div>
        </div>
    `).join('');
    
    // attach add-to-cart events
    document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(btn.dataset.id);
            const productToAdd = products.find(p => p.id === productId);
            if(productToAdd) addToCart(productToAdd);
        });
    });
}

// ========== RENDER ARTISTS SPOTLIGHT ==========
function renderArtistsSpotlight() {
    if(!artistRow) return;
    artistRow.innerHTML = artistsSpotlight.map(artist => `
        <div class="artist-card">
            <div class="artist-avatar">${artist.avatar}</div>
            <div>
                <strong>${artist.name}</strong><br>
                <small style="color:#e0b276;">${artist.genre}</small>
            </div>
        </div>
    `).join('');
}

// ========== UPDATE SECTION AND GENRE ==========
function setActiveSection(sectionId) {
    currentSection = sectionId;
    // update active nav style
    navLinks.forEach(link => {
        const section = link.dataset.section;
        if(section === sectionId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // update header title based on section
    let title = "🎸 Hot releases";
    if(sectionId === "merch") title = "🧥 vintage merch & apparel";
    else if(sectionId === "tickets") title = "🎟️ upcoming live shows";
    else if(sectionId === "artists") title = "🎙️ featured analog artists";
    else title = "💿 vinyl & digital treasures";
    sectionTitleElem.innerText = title;
    
    // hide/show genre pills for some sections? keep it universal for better UX
    renderProducts();
}

// Genre handling
function setupGenreFilters() {
    const genreBtns = document.querySelectorAll('.genre-pill');
    genreBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const genre = btn.dataset.genre;
            currentGenre = genre;
            genreBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        });
    });
}

// ========== CART SIDEBAR LOGIC ==========
function openCart() {
    cartSidebar.classList.add('open');
}
function closeCartSidebar() {
    cartSidebar.classList.remove('open');
}

// ========== INITIALIZE EVENT LISTENERS ==========
function initEventListeners() {
    if(cartBtn) cartBtn.addEventListener('click', openCart);
    if(closeCartBtn) closeCartBtn.addEventListener('click', closeCartSidebar);
    
    // navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            if(section) setActiveSection(section);
            // if section is artists, keep product display but we also render artist spotlight anyway, but that's separate
            if(section === "artists") {
                // subtle scroll or just refresh product view
                renderProducts();
            }
            window.scrollTo({ top: 300, behavior: 'smooth' });
        });
    });
    
    // Explore button scrolls to product grid
    if(exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            document.getElementById('mainContent').scrollIntoView({ behavior: 'smooth' });
        });
    }
    if(sellBtn) {
        sellBtn.addEventListener('click', () => {
            showTemporaryToast("🎙️ Artist signup coming soon! Get ready to sell your sound.");
        });
    }
    
    // close sidebar on outside click? (optional)
    document.addEventListener('click', (e) => {
        if(cartSidebar && cartSidebar.classList.contains('open')) {
            if(!cartSidebar.contains(e.target) && e.target !== cartBtn && !cartBtn.contains(e.target)) {
                closeCartSidebar();
            }
        }
    });
    
    // checkout simulation
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if(cart.length === 0) {
                showTemporaryToast("📀 your bag is empty, add some vintage treasures!");
            } else {
                showTemporaryToast("✨ Checkout demo: order placed! (analog receipt sent) ✨");
                cart = [];
                updateCartUI();
                closeCartSidebar();
            }
        });
    }
}

// ========== MOCK INITIAL LOAD ==========
function init() {
    loadCartFromLocal();
    renderArtistsSpotlight();
    renderProducts();
    setupGenreFilters();
    initEventListeners();
    setActiveSection("market"); // default market view
    updateCartUI();
    
    // extra vintage scanline effect: dynamic window glimmer (just for vibe)
    setInterval(() => {
        const scan = document.querySelector('.scanlines');
        if(scan) scan.style.opacity = Math.random() * 0.3 + 0.4;
        setTimeout(() => { if(scan) scan.style.opacity = 0.5; }, 120);
    }, 4000);
}

// start everything when DOM ready
document.addEventListener('DOMContentLoaded', init);
