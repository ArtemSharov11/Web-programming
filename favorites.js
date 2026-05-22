const API_URL = 'http://localhost:3000';

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    return response.status === 204 ? null : response.json();
}

async function fetchFavorites() {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '<p class="catalog-message">Загрузка избранного...</p>';

    try {
        const items = await fetchJson(`${API_URL}/favorites`);
        renderFavorites(items);
    } catch (error) {
        console.error('Не удалось загрузить избранное:', error);
        container.innerHTML = `
            <div class="catalog-message">
                <h2 class="text-h2">Сервер недоступен</h2>
                <p class="text-body-gray-30">Запустите JSON Server командой npm start.</p>
            </div>
        `;
    }
}

function renderFavorites(items) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';

    if (!items.length) {
        container.innerHTML = `
            <div class="catalog-message">
                <h2 class="text-h2">Список избранного пуст</h2>
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
                <p class="service-card__description text-body-gray-30">${item.description}</p>
                <div class="service-card__footer">
                    <span class="service-card__price text-price-large">$${item.price}</span>
                    <button type="button" data-remove="${item.id}" class="cat-btn cat-btn--danger">Удалить</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function removeFromFavorites(id) {
    if (!confirm('Удалить услугу из избранного?')) return;

    try {
        await fetchJson(`${API_URL}/favorites/${id}`, { method: 'DELETE' });
        fetchFavorites();
    } catch (error) {
        console.error('Не удалось удалить услугу:', error);
        alert('Не удалось удалить услугу из избранного.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchFavorites();
    document.getElementById('catalog-container').addEventListener('click', event => {
        const button = event.target.closest('[data-remove]');
        if (button) removeFromFavorites(button.dataset.remove);
    });
});
