const initialServices = [
    { id: 1, name: "Завтрак в номер", category: "Ресторан", description: "Круассаны и кофе.", price: 20, rating: 4.8, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800" },
    { id: 2, name: "Тайский массаж", category: "SPA", description: "Расслабление тела.", price: 60, rating: 5.0, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800" },
    { id: 3, name: "Подготовка номера", category: "Сервис", description: "Ароматерапия.", price: 0, rating: 4.5, image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800" },
    { id: 4, name: "Бизнес-трансфер", category: "Транспорт", description: "Mercedes S-Class.", price: 45, rating: 4.9, image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=800" },
    { id: 5, name: "Набор для йоги", category: "Спорт", description: "Коврик и блоки.", price: 0, rating: 4.2, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800" },
    { id: 6, name: "Винная карта", category: "Бар", description: "Коллекционные вина.", price: 30, rating: 4.7, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800" },
    { id: 7, name: "Меню подушек", category: "Сервис", description: "Анатомические подушки.", price: 0, rating: 4.6, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800" },
    { id: 8, name: "Ранний заезд", category: "Размещение", description: "Заселение до 14:00.", price: 30, rating: 4.0, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800" },
    { id: 9, name: "Прачечная", category: "Сервис", description: "Стирка и глажка.", price: 15, rating: 4.3, image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800" },
    { id: 10, name: "Ужин от шефа", category: "Ресторан", description: "Сет из 5 блюд.", price: 85, rating: 5.0, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800" },
    { id: 11, name: "Электросамокат", category: "Досуг", description: "Прогулка по городу.", price: 15, rating: 4.4, image: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=800" },
    { id: 12, name: "Настольные игры", category: "Досуг", description: "Игры для компании.", price: 5, rating: 4.1, image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800" },
    { id: 13, name: "Детский набор", category: "Сервис", description: "Все для детей.", price: 0, rating: 4.8, image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=800" },
    { id: 14, name: "Коктейль", category: "Бар", description: "Напиток у бассейна.", price: 12, rating: 4.5, image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800" },
    { id: 15, name: "Поздний выезд", category: "Размещение", description: "Выезд до 18:00.", price: 40, rating: 4.2, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800" }
];

function renderCatalog(data) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';
    if (data.length === 0) {
        container.innerHTML = `<div class="no-results pop-in"><h2>Ничего не найдено</h2></div>`;
        return;
    }
    data.forEach(item => {
        const card = document.createElement('article');
        card.className = 'service-card pop-in';
        card.innerHTML = `
            <div class="service-card__image-container">
                <img src="${item.image}" class="service-card__image">
                <span class="service-card__badge">${item.category}</span>
            </div>
            <div class="service-card__content">
                <h3 class="service-card__title text-body-34">${item.name}</h3>
                <p class="service-card__description text-body-gray-30">${item.description}</p>
                <div class="service-card__footer">
                    <span class="service-card__price text-price-large">${item.price === 0 ? 'Free' : '$'+item.price}</span>
                    <span class="service-card__rating">Rating: ${item.rating}</span>
                </div>
            </div>`;
        container.appendChild(card);
    });
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const sort = document.getElementById('sort-select').value;
    const activeBtn = document.querySelector('.cat-btn.active');
    const category = activeBtn ? activeBtn.getAttribute('data-category') : 'all';
    let filtered = initialServices.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search) || s.description.toLowerCase().includes(search);
        const matchesCat = category === 'all' || s.category === category;
        return matchesSearch && matchesCat;
    });
    if (sort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    else if (sort === 'name-asc') filtered.sort((a,b) => a.name.localeCompare(b.name));
    else if (sort === 'rating-desc') filtered.sort((a,b) => b.rating - a.rating);
    renderCatalog(filtered);
}

document.getElementById('btn-filter').onclick = () => renderCatalog(initialServices.filter(s => s.price < 25));
document.getElementById('btn-map').onclick = () => renderCatalog(initialServices.map(s => ({...s, name: "HIT: " + s.name})));
document.getElementById('btn-slice').onclick = () => renderCatalog(initialServices.slice(0, 6));
document.getElementById('btn-reduce').onclick = () => alert("Total price: $" + initialServices.reduce((sum, s) => sum + s.price, 0));

document.addEventListener('DOMContentLoaded', () => {
    const catList = document.getElementById('category-list');
    const categories = ['all', ...new Set(initialServices.map(s => s.category))];
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `cat-btn ${cat === 'all' ? 'active' : ''}`;
        btn.setAttribute('data-category', cat);
        btn.textContent = cat === 'all' ? 'Все' : cat;
        btn.onclick = (e) => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            applyFilters();
        };
        catList.appendChild(btn);
    });
    document.getElementById('search-input').oninput = applyFilters;
    document.getElementById('sort-select').onchange = applyFilters;
    renderCatalog(initialServices);
    const burger = document.getElementById('burgerToggle');
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    if (burger) {
        burger.onclick = () => {
            burger.classList.toggle('is-active');
            menu.classList.toggle('is-open');
            overlay.classList.toggle('is-active');
        };
    }
});