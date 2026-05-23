const API_URL = "http://localhost:3000";

async function fetchCart() {
    const res = await fetch(`${API_URL}/cart`);
    const items = await res.json();
    calculateTotal(items);
    renderCart(items);
}

function calculateTotal(items) {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('total-price').textContent = `Итого: $${total}`;
}

function renderCart(items) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = items.length ? '' : '<h2 class="text-h2">Корзина пуста</h2>';

    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'service-card pop-in';
        card.innerHTML = `
            <div class="service-card__image-container">
                <img src="${item.image}" class="service-card__image">
            </div>
            <div class="service-card__content">
                <h3 class="service-card__title text-body-34">${item.name}</h3>
                <p class="text-body-gray-30">Цена: $${item.price}</p>
                <div style="display:flex; align-items:center; gap:10px; margin: 1rem 0;">
                    <button onclick="updateQty('${item.id}', ${item.quantity - 1})" class="cat-btn">-</button>
                    <span class="text-body-34">${item.quantity}</span>
                    <button onclick="updateQty('${item.id}', ${item.quantity + 1})" class="cat-btn">+</button>
                </div>
                <button onclick="removeItem('${item.id}')" class="cat-btn" style="background:#ff4d4d">Удалить</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function updateQty(id, newQty) {
    if (newQty < 1) return;
    await fetch(`${API_URL}/cart/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ quantity: newQty })
    });
    fetchCart();
}

async function removeItem(id) {
    await fetch(`${API_URL}/cart/${id}`, { method: 'DELETE' });
    fetchCart();
}

document.getElementById('checkout-btn').onclick = async () => {
    const res = await fetch(`${API_URL}/cart`);
    const items = await res.json();
    
    if (items.length === 0) return alert("Корзина пуста!");

    for (const item of items) {
        await fetch(`${API_URL}/cart/${item.id}`, { method: 'DELETE' });
    }

    alert("🎉 Покупка успешно оформлена! Ваша корзина очищена.");
    fetchCart();
};

document.addEventListener('DOMContentLoaded', fetchCart);