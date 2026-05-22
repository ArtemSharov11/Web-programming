const API_URL = 'http://localhost:3000';

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    return response.status === 204 ? null : response.json();
}

async function fetchCart() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '<p class="catalog-message">Загрузка корзины...</p>';

    try {
        const items = await fetchJson(`${API_URL}/cart`);
        calculateTotal(items);
        renderCart(items);
    } catch (error) {
        console.error('Не удалось загрузить корзину:', error);
        calculateTotal([]);
        container.innerHTML = `
            <div class="catalog-message">
                <h2 class="text-h2">Сервер недоступен</h2>
                <p class="text-body-gray-30">Запустите JSON Server командой npm start.</p>
            </div>
        `;
    }
}

function calculateTotal(items) {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('total-price').textContent = `$${total.toFixed(2)}`;
}

function renderCart(items) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';

    if (!items.length) {
        container.innerHTML = `
            <div class="catalog-message">
                <h2 class="text-h2">Корзина пуста</h2>
                <a class="catalog-link" href="catalog.html">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'service-card pop-in';
        card.innerHTML = `
            <div class="service-card__image-container">
                <img src="${item.image}" alt="${item.name}" class="service-card__image">
                <span class="service-card__badge">${item.category}</span>
            </div>
            <div class="service-card__content">
                <h3 class="service-card__title text-body-34">${item.name}</h3>
                <p class="text-body-gray-30">Цена за единицу: $${item.price}</p>
                <div class="quantity-control" aria-label="Количество услуги ${item.name}">
                    <button type="button" data-quantity="${item.id}" data-value="${item.quantity - 1}" class="cat-btn" ${item.quantity === 1 ? 'disabled' : ''}>−</button>
                    <span class="text-body-34">${item.quantity}</span>
                    <button type="button" data-quantity="${item.id}" data-value="${item.quantity + 1}" class="cat-btn">+</button>
                </div>
                <div class="service-card__footer">
                    <strong class="service-card__price text-price-large">$${(item.price * item.quantity).toFixed(2)}</strong>
                    <button type="button" data-remove="${item.id}" class="cat-btn cat-btn--danger">Удалить</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function updateQuantity(id, quantity) {
    if (quantity < 1) return;

    try {
        await fetchJson(`${API_URL}/cart/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity })
        });
        fetchCart();
    } catch (error) {
        console.error('Не удалось изменить количество:', error);
        alert('Не удалось изменить количество услуги.');
    }
}

async function removeItem(id) {
    try {
        await fetchJson(`${API_URL}/cart/${id}`, { method: 'DELETE' });
        fetchCart();
    } catch (error) {
        console.error('Не удалось удалить услугу:', error);
        alert('Не удалось удалить услугу из корзины.');
    }
}

async function checkout() {
    try {
        const items = await fetchJson(`${API_URL}/cart`);
        if (!items.length) {
            alert('Корзина пуста.');
            return;
        }

        await Promise.all(
            items.map(item => fetchJson(`${API_URL}/cart/${item.id}`, { method: 'DELETE' }))
        );
        alert('Покупка успешно оформлена. Корзина очищена.');
        fetchCart();
    } catch (error) {
        console.error('Не удалось оформить покупку:', error);
        alert('Не удалось оформить покупку.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCart();
    document.getElementById('checkout-btn').addEventListener('click', checkout);
    document.getElementById('catalog-container').addEventListener('click', event => {
        const quantityButton = event.target.closest('[data-quantity]');
        const removeButton = event.target.closest('[data-remove]');

        if (quantityButton) {
            updateQuantity(
                quantityButton.dataset.quantity,
                Number(quantityButton.dataset.value)
            );
        }
        if (removeButton) removeItem(removeButton.dataset.remove);
    });
});
