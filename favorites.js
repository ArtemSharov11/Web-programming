const API_URL = "http://localhost:3000";

async function fetchFavorites() {
    try {
        const res = await fetch(`${API_URL}/favorites`);
        const items = await res.json();
        renderFavorites(items);
    } catch (e) { console.error(e); }
}

function renderFavorites(items) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<h2 class="text-h2" style="text-align:center; width:100%;">Список избранного пуст</h2>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('article');
        card.className = 'service-card pop-in';
        card.innerHTML = `
            <div class="service-card__image-container">
                <img src="${item.image}" class="service-card__image">
            </div>
            <div class="service-card__content">
                <h3 class="service-card__title text-body-34">${item.name}</h3>
                <p class="service-card__price text-price-large">$${item.price}</p>
                <!-- Кнопка удаления -->
                <button onclick="removeFromFav('${item.id}')" class="cat-btn" style="background:#ff4d4d; margin-top:10px;">Удалить</button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function removeFromFav(id) {
    if (confirm("Удалить из избранного?")) {
        await fetch(`${API_URL}/favorites/${id}`, { method: 'DELETE' });
        fetchFavorites();
    }
}

document.addEventListener('DOMContentLoaded', fetchFavorites);