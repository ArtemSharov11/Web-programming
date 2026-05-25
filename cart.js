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
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        alert("Для оформления заказа необходимо авторизоваться!");
        window.location.href = "auth.html";
        return;
    }

    const res = await fetch(`${API_URL}/cart`);
    const cartItems = await res.json();
    
    if (cartItems.length === 0) return alert("Корзина пуста!");

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = {
        userId: user.id,         
        items: cartItems,         
        totalPrice: total,       
        date: new Date().toLocaleString('ru-RU') 
    };

    try {
        const orderResponse = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newOrder)
        });

        if (!orderResponse.ok) {
            throw new Error(`Order request failed: ${orderResponse.status}`);
        }

        for (const item of cartItems) {
            const deleteResponse = await fetch(`${API_URL}/cart/${item.id}`, { method: 'DELETE' });
            if (!deleteResponse.ok) {
                throw new Error(`Cart cleanup failed: ${deleteResponse.status}`);
            }
        }

        alert(`Покупка успешно оформлена!\nЗаказ сохранен в истории. Корзина очищена.`);
        fetchCart();
        
    } catch (error) {
        console.error("Ошибка при оформлении заказа:", error);
        alert("Произошла ошибка при сохранении заказа.");
    }
};

document.addEventListener('DOMContentLoaded', fetchCart);
