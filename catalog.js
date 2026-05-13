const initialServices = [
    { id: 1, name: "Завтрак в номер", category: "Ресторан", description: "Континентальный завтрак: круассаны, джем и кофе.", price: 20, rating: 4.8, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800" },
    { id: 2, name: "Тайский массаж", category: "SPA", description: "Традиционный массаж для глубокого расслабления.", price: 60, rating: 5.0, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800" },
    { id: 3, name: "Подготовка номера", category: "Сервис", description: "Обновление запаса воды и ароматерапия.", price: 0, rating: 4.5, image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800" },
    { id: 4, name: "Бизнес-трансфер", category: "Транспорт", description: "Mercedes S-Class для поездок в аэропорт.", price: 45, rating: 4.9, image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=800" },
    { id: 5, name: "Набор для йоги", category: "Спорт", description: "Коврик и блоки для занятий в номере.", price: 0, rating: 4.2, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800" },
    { id: 6, name: "Винная карта", category: "Бар", description: "Эксклюзивная подборка вин из нашего погреба.", price: 30, rating: 4.7, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800" },
    { id: 7, name: "Меню подушек", category: "Сервис", description: "Выбор идеальной подушки для сна.", price: 0, rating: 4.6, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800" },
    { id: 8, name: "Ранний заезд", category: "Размещение", description: "Заселение в номер до 14:00.", price: 30, rating: 4.0, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800" },
    { id: 9, name: "Прачечная", category: "Сервис", description: "Бережный уход за вашими вещами.", price: 15, rating: 4.3, image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800" },
    { id: 10, name: "Ужин от шефа", category: "Ресторан", description: "Авторское сет-меню из 5 блюд.", price: 85, rating: 5.0, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800" },
    { id: 11, name: "Электросамокат", category: "Досуг", description: "Осмотр достопримечательностей.", price: 15, rating: 4.4, image: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=800" },
    { id: 12, name: "Настольные игры", category: "Досуг", description: "Популярные игры для компании.", price: 5, rating: 4.1, image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800" },
    { id: 13, name: "Детский набор", category: "Сервис", description: "Халат и косметика для детей.", price: 0, rating: 4.8, image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=800" },
    { id: 14, name: "Коктейль", category: "Бар", description: "Освежающий напиток у бассейна.", price: 12, rating: 4.5, image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800" },
    { id: 15, name: "Поздний выезд", category: "Размещение", description: "Продление номера до 18:00.", price: 40, rating: 4.2, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800" }
];

const formatPrice = (price) => {
    return price === 0 ? "Free" : `$${price}`;
};


function getFilteredData(list, searchValue, category) {
    return list.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchValue.toLowerCase()) || 
                             item.description.toLowerCase().includes(searchValue.toLowerCase());
        const matchesCategory = category === 'all' || item.category === category;
        return matchesSearch && matchesCategory;
    });
}

function renderCatalog(data) {
    const container = document.getElementById('catalog-container');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `<div class="no-results pop-in"><h2 class="text-h2">No results found</h2></div>`;
        return;
    }

    data.forEach(item => {
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
                    <span class="service-card__price text-price-large" style="font-size: 1.6rem;">${formatPrice(item.price)}</span>
                    <span class="service-card__rating">⭐ ${item.rating}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function applyFilters() {
    const searchValue = document.getElementById('search-input').value;
    const sortValue = document.getElementById('sort-select').value;
    const activeCat = document.querySelector('.cat-btn.active').getAttribute('data-category');

    let data = getFilteredData(initialServices, searchValue, activeCat);

    if (sortValue === 'price-asc') data.sort((a, b) => a.price - b.price);
    else if (sortValue === 'price-desc') data.sort((a, b) => b.price - a.price);
    else if (sortValue === 'rating-desc') data.sort((a, b) => b.rating - a.rating);

    renderCatalog(data);
}

document.addEventListener('DOMContentLoaded', () => {
    renderCatalog(initialServices);

    document.getElementById('search-input').oninput = applyFilters;
    document.getElementById('sort-select').onchange = applyFilters;
    
    const burger = document.getElementById('burgerToggle');
    if (burger) {
        burger.onclick = () => {
            burger.classList.toggle('is-active');
            document.getElementById('sideMenu').classList.toggle('is-open');
            document.getElementById('overlay').classList.toggle('is-active');
        };
    }
});