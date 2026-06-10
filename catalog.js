const API_URL = "http://localhost:3000";
const limit = 6;

let currentPage = 1;
let activeCategory = "all";
let catalogServices = [];
let isMethodDemoActive = false;

const fallbackServices = [
    { id: "1", name: "Завтрак в номер", category: "Ресторан", description: "Континентальный завтрак: круассаны, джем и кофе.", price: 20, time: 20, rating: 4.8, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800" },
    { id: "2", name: "Тайский массаж", category: "SPA", description: "Традиционный массаж для глубокого расслабления.", price: 60, time: 60, rating: 5.0, image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800" },
    { id: "3", name: "Подготовка номера", category: "Сервис", description: "Обновление запаса воды и ароматерапия перед сном.", price: 10, time: 10, rating: 4.5, image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800" },
    { id: "4", name: "Бизнес-трансфер", category: "Транспорт", description: "Комфортная поездка в аэропорт на автомобиле бизнес-класса.", price: 45, time: 30, rating: 4.9, image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?q=80&w=800" },
    { id: "5", name: "Набор для йоги", category: "Спорт", description: "Коврик и блоки для занятий в номере.", price: 5, time: 5, rating: 4.2, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800" },
    { id: "6", name: "Винная карта", category: "Бар", description: "Эксклюзивная подборка вин из нашего погреба.", price: 30, time: 10, rating: 4.7, image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800" },
    { id: "7", name: "Меню подушек", category: "Сервис", description: "Выбор идеальной подушки для комфортного сна.", price: 0, time: 10, rating: 4.6, image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=800" },
    { id: "8", name: "Ранний заезд", category: "Размещение", description: "Заселение в номер до стандартного времени.", price: 30, time: 0, rating: 4.0, image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800" },
    { id: "9", name: "Прачечная", category: "Сервис", description: "Бережный уход за одеждой гостя.", price: 15, time: 720, rating: 4.3, image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=800" },
    { id: "10", name: "Ужин от шефа", category: "Ресторан", description: "Авторское сет-меню из пяти блюд.", price: 85, time: 40, rating: 5.0, image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800" },
    { id: "11", name: "Электросамокат", category: "Досуг", description: "Аренда транспорта для прогулки по городу.", price: 15, time: 60, rating: 4.4, image: "https://images.unsplash.com/photo-1557053910-d9eadeed1c58?q=80&w=800" },
    { id: "12", name: "Настольные игры", category: "Досуг", description: "Популярные игры для компании.", price: 5, time: 10, rating: 4.1, image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=800" },
    { id: "13", name: "Детский набор", category: "Сервис", description: "Халат, тапочки и безопасная косметика для детей.", price: 0, time: 15, rating: 4.8, image: "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=800" },
    { id: "14", name: "Коктейль у бассейна", category: "Бар", description: "Освежающий напиток с доставкой к бассейну.", price: 12, time: 10, rating: 4.5, image: "https://images.unsplash.com/photo-1536935338788-846bb9981813?q=80&w=800" },
    { id: "15", name: "Поздний выезд", category: "Размещение", description: "Продление номера до 18:00.", price: 40, time: 0, rating: 4.2, image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=800" }
];

function normalizeService(item, index) {
    const fallback = fallbackServices[index] || {};
    return {
        id: String(item.id ?? fallback.id ?? index + 1),
        name: item.name ?? fallback.name ?? "Услуга отеля",
        category: item.category ?? fallback.category ?? "Сервис",
        description: item.description ?? fallback.description ?? "Описание услуги",
        price: Number(item.price ?? fallback.price ?? 0),
        time: Number(item.time ?? fallback.time ?? 10),
        rating: Number(item.rating ?? fallback.rating ?? 4),
        image: item.image ?? fallback.image ?? "img/hero-photo.png"
    };
}

async function loadCatalogServices() {
    try {
        const response = await fetch(`${API_URL}/services`);
        if (!response.ok) throw new Error(`Services request failed: ${response.status}`);
        const result = await response.json();
        const services = Array.isArray(result) ? result : (result.data || []);
        catalogServices = services.length ? services.map(normalizeService) : [...fallbackServices];
    } catch (error) {
        console.warn("Каталог с сервера недоступен, используется локальный массив:", error);
        catalogServices = [...fallbackServices];
    }
}

function getControlValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
}

function formatPrice(price) {
    return price === 0 ? "Бесплатно" : `$${price}`;
}

function renderCatalog(services, options = {}) {
    const { showActions = true } = options;
    const container = document.getElementById("catalog-container");
    if (!container) return;

    container.innerHTML = "";

    if (!Array.isArray(services) || services.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h2 class="text-h2">Услуги не найдены</h2>
                <p class="text-body-gray-30">Попробуйте сбросить фильтры или изменить поисковый запрос.</p>
            </div>`;
        return;
    }

    services.forEach(item => {
        const card = document.createElement("article");
        card.className = "service-card pop-in";
        card.tabIndex = 0;
        card.dataset.serviceId = item.id;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `Подробнее: ${item.name}`);
        card.innerHTML = `
            <div class="service-card__image-container">
                <img src="${item.image}" alt="${item.name}" class="service-card__image">
                <span class="service-card__badge">${item.category}</span>
            </div>
            <div class="service-card__content">
                <h3 class="service-card__title text-body-34">${item.name}</h3>
                <p class="service-card__description text-body-gray-30">${item.description}</p>
                <div class="service-card__meta">
                    <span>Рейтинг: ${item.rating}</span>
                    <span>Время: ${item.time} мин.</span>
                </div>
                <div class="service-card__footer">
                    <span class="service-card__price text-price-large" style="font-size: 1.8rem;">${formatPrice(item.price)}</span>
                    ${showActions ? `
                        <div style="display: flex; gap: 10px;">
                            <button type="button" onclick="addToFavorites('${item.id}')" class="cat-btn" aria-label="Добавить в избранное">♥</button>
                            <button type="button" onclick="addToCart('${item.id}')" class="cat-btn" aria-label="Добавить в корзину">🛒</button>
                        </div>` : ""}
                </div>
            </div>
        `;
        card.addEventListener("click", event => {
            if (event.target.closest("button")) return;
            openServiceDetails(item.id);
        });
        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openServiceDetails(item.id);
            }
        });
        container.appendChild(card);
    });
}

function openServiceDetails(id) {
    const item = catalogServices.find(service => service.id === String(id));
    if (!item || typeof openInteractiveModal !== "function") return;

    openInteractiveModal({
        title: item.name,
        content: `
            <div class="interactive-detail">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <p>${item.description}</p>
                    <div class="interactive-detail__meta">
                        <span class="interactive-pill">${item.category}</span>
                        <span class="interactive-pill">Цена: ${formatPrice(item.price)}</span>
                        <span class="interactive-pill">Рейтинг: ${item.rating}</span>
                        <span class="interactive-pill">Время: ${item.time} мин.</span>
                    </div>
                    <button type="button" class="cat-btn active" data-modal-cart="${item.id}">Добавить в корзину</button>
                    <button type="button" class="cat-btn" data-modal-fav="${item.id}">В избранное</button>
                </div>
            </div>
        `
    });

    document.querySelector("[data-modal-cart]")?.addEventListener("click", event => addToCart(event.currentTarget.dataset.modalCart));
    document.querySelector("[data-modal-fav]")?.addEventListener("click", event => addToFavorites(event.currentTarget.dataset.modalFav));
}

function getFilteredServices() {
    const search = getControlValue("search-input").toLowerCase();
    const minPrice = Number(getControlValue("price-min"));
    const maxPrice = Number(getControlValue("price-max"));
    const sort = document.getElementById("sort-select")?.value || "default";

    let services = catalogServices.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search);
        const matchesCategory = activeCategory === "all" || item.category === activeCategory;
        const matchesMin = !getControlValue("price-min") || item.price >= minPrice;
        const matchesMax = !getControlValue("price-max") || item.price <= maxPrice;
        return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });

    if (sort === "price-asc") services = [...services].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") services = [...services].sort((a, b) => b.price - a.price);
    if (sort === "name-asc") services = [...services].sort((a, b) => a.name.localeCompare(b.name, "ru"));
    if (sort === "rating-desc") services = [...services].sort((a, b) => b.rating - a.rating);

    return services;
}

function updatePagination(totalItems) {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    if (currentPage > totalPages) currentPage = totalPages;

    const info = document.getElementById("current-page-info");
    const prev = document.getElementById("prev-page");
    const next = document.getElementById("next-page");

    if (info) info.textContent = `Страница ${currentPage} из ${totalPages}`;
    if (prev) prev.disabled = currentPage <= 1 || isMethodDemoActive;
    if (next) next.disabled = currentPage >= totalPages || isMethodDemoActive;
}

function fetchServices() {
    isMethodDemoActive = false;
    clearMethodDemo();
    const filtered = getFilteredServices();
    updatePagination(filtered.length);
    const start = (currentPage - 1) * limit;
    renderCatalog(filtered.slice(start, start + limit));
}

function clearMethodDemo() {
    document.querySelectorAll(".method-btn").forEach(button => {
        button.classList.remove("active");
    });

    const result = document.getElementById("method-result");
    if (result && !isMethodDemoActive) result.textContent = "";
}

function showMethodResult(button, message, services) {
    isMethodDemoActive = true;
    document.querySelectorAll(".method-btn").forEach(item => item.classList.remove("active"));
    button.classList.add("active");
    document.getElementById("method-result").textContent = message;
    updatePagination(services.length);
    renderCatalog(services, { showActions: false });
}

function runArrayMethod(button) {
    const methodName = button.dataset.method;
    const services = [...catalogServices];
    let resultServices = services;
    let message = "";

    if (methodName === "map") {
        resultServices = services.map(item => ({
            ...item,
            price: Math.round(item.price * 0.9),
            description: `${item.description} Скидка 10% добавлена методом map().`
        }));
        message = "map(): создан новый массив, где у каждой услуги цена уменьшена на 10%.";
    }

    if (methodName === "filter") {
        resultServices = services.filter(item => item.price <= 20);
        message = `filter(): выбраны услуги стоимостью до $20. Найдено: ${resultServices.length}.`;
    }

    if (methodName === "reduce") {
        const totalPrice = services.reduce((sum, item) => sum + item.price, 0);
        const mostExpensive = services.reduce((max, item) => item.price > max.price ? item : max, services[0]);
        resultServices = [mostExpensive];
        message = `reduce(): сумма цен всех услуг равна $${totalPrice}, самая дорогая услуга - "${mostExpensive.name}".`;
    }

    if (methodName === "sort") {
        resultServices = [...services].sort((a, b) => b.rating - a.rating);
        message = "sort(): услуги отсортированы по рейтингу от большего к меньшему.";
    }

    if (methodName === "find") {
        const spaService = services.find(item => item.category.toLowerCase().includes("spa"));
        resultServices = spaService ? [spaService] : [];
        message = spaService ? `find(): найдена первая SPA-услуга - "${spaService.name}".` : "find(): SPA-услуга не найдена.";
    }

    if (methodName === "findIndex") {
        const index = services.findIndex(item => item.rating < 4.5);
        resultServices = index >= 0 ? [services[index]] : [];
        message = index >= 0
            ? `findIndex(): первая услуга с рейтингом ниже 4.5 находится под индексом ${index}.`
            : "findIndex(): услуг с рейтингом ниже 4.5 нет.";
    }

    if (methodName === "some") {
        const hasFreeServices = services.some(item => item.price === 0);
        resultServices = services.filter(item => item.price === 0);
        message = `some(): есть ли бесплатные услуги? ${hasFreeServices ? "Да" : "Нет"}.`;
    }

    if (methodName === "every") {
        const everyHighRated = services.every(item => item.rating >= 4);
        resultServices = services.filter(item => item.rating >= 4);
        message = `every(): у всех услуг рейтинг не ниже 4? ${everyHighRated ? "Да" : "Нет"}.`;
    }

    if (methodName === "slice") {
        resultServices = services.slice(0, 5);
        message = "slice(): показана копия части массива - первые пять услуг.";
    }

    if (methodName === "forEach") {
        const fastServices = [];
        services.forEach(item => {
            if (item.time <= 10) fastServices.push(item);
        });
        resultServices = fastServices;
        message = `forEach(): перебором собраны быстрые услуги до 10 минут. Найдено: ${fastServices.length}.`;
    }

    showMethodResult(button, message, resultServices);
}

function initArrayMethods() {
    document.querySelectorAll(".method-btn").forEach(button => {
        button.addEventListener("click", () => runArrayMethod(button));
    });

    document.getElementById("method-reset")?.addEventListener("click", () => {
        isMethodDemoActive = false;
        currentPage = 1;
        clearMethodDemo();
        fetchServices();
    });
}

function initCategories() {
    const catList = document.getElementById("category-list");
    if (!catList) return;

    const categories = ["all", ...new Set(catalogServices.map(s => s.category))];
    catList.innerHTML = "";

    categories.forEach(cat => {
        const btn = document.createElement("button");
        btn.className = `cat-btn ${cat === activeCategory ? "active" : ""}`;
        btn.type = "button";
        btn.textContent = cat === "all" ? "Все" : cat;

        btn.addEventListener("click", () => {
            catList.querySelectorAll(".cat-btn").forEach(button => button.classList.remove("active"));
            btn.classList.add("active");
            activeCategory = cat;
            currentPage = 1;
            fetchServices();
        });

        catList.appendChild(btn);
    });
}

async function getServiceById(id) {
    const localService = catalogServices.find(item => item.id === String(id));
    if (localService) return localService;

    const response = await fetch(`${API_URL}/services/${id}`);
    if (!response.ok) throw new Error("Услуга не найдена");
    return response.json();
}

async function addToFavorites(id) {
    const item = await getServiceById(id);
    await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    });
    showToast(`"${item.name}" добавлено в избранное.`, "success");
    window.updateLabCounters?.();
}

async function addToCart(id) {
    const item = await getServiceById(id);
    await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...item, quantity: 1 })
    });
    showToast(`"${item.name}" добавлено в корзину.`, "success");
    window.updateLabCounters?.();
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadCatalogServices();
    initCategories();
    initArrayMethods();
    fetchServices();

    document.getElementById("search-input")?.addEventListener("input", () => {
        currentPage = 1;
        fetchServices();
    });

    document.getElementById("sort-select")?.addEventListener("change", () => {
        currentPage = 1;
        fetchServices();
    });

    document.getElementById("apply-filters")?.addEventListener("click", () => {
        currentPage = 1;
        fetchServices();
    });

    document.getElementById("next-page")?.addEventListener("click", () => {
        currentPage++;
        fetchServices();
    });

    document.getElementById("prev-page")?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchServices();
        }
    });
});

