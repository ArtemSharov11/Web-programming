const API_URL = "http://localhost:3000";
let currentPage = 1;
const limit = 6;
let activeCategory = 'all';

async function fetchServices() {
    try {
        const searchInput = document.getElementById('search-input');
        const sortSelect = document.getElementById('sort-select');
        const minPriceInput = document.getElementById('price-min');
        const maxPriceInput = document.getElementById('price-max');

        const search = searchInput.value;
        const sort = sortSelect.value;
        const minPrice = minPriceInput.value;
        const maxPrice = maxPriceInput.value;
        let url = `${API_URL}/services?_page=${currentPage}&_per_page=${limit}`;
        
        if (search) url += `&name_like=${encodeURIComponent(search)}`;
        
        if (activeCategory !== 'all') url += `&category=${encodeURIComponent(activeCategory)}`;

        if (sort !== 'default') {
            if (sort === 'price-asc') url += `&_sort=price`;
            if (sort === 'price-desc') url += `&_sort=-price`;
            if (sort === 'name-asc') url += `&_sort=name`;
            if (sort === 'rating-desc') url += `&_sort=-rating`;
        }

        if (minPrice) url += `&price_gte=${minPrice}`;
        if (maxPrice) url += `&price_lte=${maxPrice}`;

        console.log("Новый формат запроса:", url);

        const response = await fetch(url);
        const result = await response.json();

        const services = result.data || result;

        console.log("Услуги найдены:", services);
        renderCatalog(services);
        
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

function renderCatalog(services) {
    const container = document.getElementById('catalog-container');
    if (!container) return;
    
    container.innerHTML = '';

    if (!Array.isArray(services) || services.length === 0) {
        container.innerHTML = `
            <div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h2 class="text-h2">Услуги не найдены</h2>
                <p class="text-body-gray-30">Попробуйте сбросить фильтры или изменить поиск</p>
            </div>`;
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
                <div class="service-card__footer">
                    <span class="service-card__price text-price-large" style="font-size: 1.8rem;">$${item.price}</span>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="addToFavorites('${item.id}')" class="cat-btn">❤</button>
                        <button onclick="addToCart('${item.id}')" class="cat-btn">🛒</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function initCategories() {
    try {
        const response = await fetch(`${API_URL}/services`);
        const result = await response.json();
        const allServices = Array.isArray(result) ? result : (result.data || []);
        
        const categories = ['all', ...new Set(allServices.map(s => s.category))];
        const catList = document.getElementById('category-list');
        if (!catList) return;

        catList.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `cat-btn ${cat === activeCategory ? 'active' : ''}`;
            btn.textContent = cat === 'all' ? 'Все' : cat;
            
            btn.onclick = () => {
                document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeCategory = cat;
                currentPage = 1;
                fetchServices();
            };
            catList.appendChild(btn);
        });
    } catch (e) { console.error("Ошибка категорий:", e); }
}

async function addToFavorites(id) {
    const res = await fetch(`${API_URL}/services/${id}`);
    const item = await res.json();
    await fetch(`${API_URL}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    });
    alert('Добавлено в избранное!');
}

async function addToCart(id) {
    const res = await fetch(`${API_URL}/services/${id}`);
    const item = await res.json();
    await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, quantity: 1 })
    });
    alert('Добавлено в корзину!');
}

document.addEventListener('DOMContentLoaded', () => {
    initCategories();
    fetchServices();

    document.getElementById('search-input').oninput = () => {
        currentPage = 1;
        fetchServices();
    };

    document.getElementById('sort-select').onchange = () => fetchServices();
    document.getElementById('apply-filters').onclick = () => fetchServices();

    document.getElementById('next-page').onclick = () => {
        currentPage++;
        document.getElementById('current-page-info').textContent = `Страница ${currentPage}`;
        fetchServices();
    };

    document.getElementById('prev-page').onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            document.getElementById('current-page-info').textContent = `Страница ${currentPage}`;
            fetchServices();
        }
    };
});