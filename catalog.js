const API_URL = 'http://localhost:3000';
const PAGE_SIZE = 6;

let currentPage = 1;
let totalPages = 1;
let activeCategory = 'all';
let searchTimer;

function getElement(id) {
    return document.getElementById(id);
}

function showCatalogMessage(title, text) {
    const container = getElement('catalog-container');
    container.innerHTML = `
        <div class="catalog-message">
            <h2 class="text-h2">${title}</h2>
            <p class="text-body-gray-30">${text}</p>
        </div>
    `;
}

function buildServicesUrl() {
    const search = getElement('search-input').value.trim();
    const sort = getElement('sort-select').value;
    const minPrice = getElement('price-min').value;
    const maxPrice = getElement('price-max').value;
    const minRating = getElement('rating-min').value;
    const params = new URLSearchParams({
        _page: currentPage,
        _per_page: PAGE_SIZE
    });
    const where = {};

    if (search) {
        where.or = [
            { name: { contains: search } },
            { description: { contains: search } },
            { category: { contains: search } }
        ];
    }

    if (activeCategory !== 'all') {
        where.category = { eq: activeCategory };
    }

    if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (minRating) {
        where.rating = { gte: Number(minRating) };
    }

    if (Object.keys(where).length) {
        params.set('_where', JSON.stringify(where));
    }

    const sortFields = {
        'price-asc': 'price',
        'price-desc': '-price',
        'name-asc': 'name',
        'rating-desc': '-rating'
    };
    if (sortFields[sort]) params.set('_sort', sortFields[sort]);

    return `${API_URL}/services?${params.toString()}`;
}

async function fetchJson(url, options) {
    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    return response.json();
}

async function fetchServices() {
    showCatalogMessage('Загрузка...', 'Получаем услуги с JSON Server');

    try {
        const result = await fetchJson(buildServicesUrl());
        const services = Array.isArray(result) ? result : result.data;

        totalPages = Array.isArray(result) ? 1 : Math.max(result.pages || 1, 1);
        if (currentPage > totalPages) {
            currentPage = totalPages;
            return fetchServices();
        }

        renderCatalog(services);
        updatePagination();
    } catch (error) {
        console.error('Не удалось загрузить каталог:', error);
        showCatalogMessage(
            'Сервер недоступен',
            'Запустите JSON Server командой npm start и обновите страницу.'
        );
        updatePagination();
    }
}

function renderCatalog(services) {
    const container = getElement('catalog-container');
    container.innerHTML = '';

    if (!services.length) {
        showCatalogMessage(
            'Услуги не найдены',
            'Попробуйте сбросить фильтры или изменить поисковый запрос.'
        );
        return;
    }

    services.forEach(item => {
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
                <p class="service-card__rating">Рейтинг: ${item.rating}</p>
                <div class="service-card__footer">
                    <span class="service-card__price text-price-large">$${item.price}</span>
                    <div class="service-card__actions">
                        <button type="button" data-favorite="${item.id}" class="cat-btn" aria-label="Добавить ${item.name} в избранное">В избранное</button>
                        <button type="button" data-cart="${item.id}" class="cat-btn" aria-label="Добавить ${item.name} в корзину">В корзину</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function updatePagination() {
    getElement('current-page-info').textContent = `Страница ${currentPage} из ${totalPages}`;
    getElement('prev-page').disabled = currentPage <= 1;
    getElement('next-page').disabled = currentPage >= totalPages;
}

async function initCategories() {
    try {
        const result = await fetchJson(`${API_URL}/services`);
        const services = Array.isArray(result) ? result : result.data;
        const categories = ['all', ...new Set(services.map(service => service.category))];
        const categoryList = getElement('category-list');

        categoryList.innerHTML = '';
        categories.forEach(category => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `cat-btn ${category === activeCategory ? 'active' : ''}`;
            button.textContent = category === 'all' ? 'Все' : category;
            button.addEventListener('click', () => {
                categoryList.querySelectorAll('.cat-btn').forEach(item => {
                    item.classList.remove('active');
                });
                button.classList.add('active');
                activeCategory = category;
                currentPage = 1;
                fetchServices();
            });
            categoryList.appendChild(button);
        });
    } catch (error) {
        console.error('Не удалось загрузить категории:', error);
    }
}

async function addToFavorites(serviceId) {
    try {
        const where = encodeURIComponent(JSON.stringify({
            serviceId: { eq: serviceId }
        }));
        const existing = await fetchJson(
            `${API_URL}/favorites?_where=${where}`
        );
        if (existing.length) {
            alert('Эта услуга уже находится в избранном.');
            return;
        }

        const service = await fetchJson(`${API_URL}/services/${serviceId}`);
        const { id, ...serviceData } = service;
        await fetchJson(`${API_URL}/favorites`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...serviceData, serviceId: id })
        });
        alert('Услуга добавлена в избранное.');
    } catch (error) {
        console.error('Не удалось добавить в избранное:', error);
        alert('Не удалось добавить услугу в избранное.');
    }
}

async function addToCart(serviceId) {
    try {
        const where = encodeURIComponent(JSON.stringify({
            serviceId: { eq: serviceId }
        }));
        const existing = await fetchJson(
            `${API_URL}/cart?_where=${where}`
        );

        if (existing.length) {
            const item = existing[0];
            await fetchJson(`${API_URL}/cart/${item.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity: item.quantity + 1 })
            });
        } else {
            const service = await fetchJson(`${API_URL}/services/${serviceId}`);
            const { id, ...serviceData } = service;
            await fetchJson(`${API_URL}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...serviceData, serviceId: id, quantity: 1 })
            });
        }

        alert('Услуга добавлена в корзину.');
    } catch (error) {
        console.error('Не удалось добавить в корзину:', error);
        alert('Не удалось добавить услугу в корзину.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    fetchServices();

    getElement('search-input').addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            currentPage = 1;
            fetchServices();
        }, 300);
    });

    getElement('sort-select').addEventListener('change', () => {
        currentPage = 1;
        fetchServices();
    });

    getElement('apply-filters').addEventListener('click', () => {
        currentPage = 1;
        fetchServices();
    });

    getElement('reset-filters').addEventListener('click', () => {
        getElement('search-input').value = '';
        getElement('sort-select').value = 'default';
        getElement('price-min').value = '';
        getElement('price-max').value = '';
        getElement('rating-min').value = '';
        activeCategory = 'all';
        currentPage = 1;
        initCategories();
        fetchServices();
    });

    getElement('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchServices();
        }
    });

    getElement('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchServices();
        }
    });

    getElement('catalog-container').addEventListener('click', event => {
        const favoriteButton = event.target.closest('[data-favorite]');
        const cartButton = event.target.closest('[data-cart]');
        if (favoriteButton) addToFavorites(favoriteButton.dataset.favorite);
        if (cartButton) addToCart(cartButton.dataset.cart);
    });
});
