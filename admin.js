const API_URL = "http://localhost:3000";

const serviceRules = {
    "adm-name": {
        validate: value => value.trim().length >= 3 && value.trim().length <= 80,
        message: "Название должно содержать от 3 до 80 символов."
    },
    "adm-cat": {
        validate: value => value.trim().length >= 2 && value.trim().length <= 40,
        message: "Категория должна содержать от 2 до 40 символов."
    },
    "adm-price": {
        validate: value => Number(value) > 0 && Number(value) <= 100000,
        message: "Цена должна быть больше 0 и не превышать 100000."
    },
    "adm-img": {
        validate: value => {
            try {
                const url = new URL(value);
                return url.protocol === "http:" || url.protocol === "https:";
            } catch {
                return false;
            }
        },
        message: "Введите корректную ссылку, начинающуюся с http:// или https://."
    },
    "adm-desc": {
        validate: value => value.trim().length >= 10 && value.trim().length <= 500,
        message: "Описание должно содержать от 10 до 500 символов."
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user || user.role !== "admin") {
        showToast("Доступ запрещён. Эта страница доступна только администратору.", "error");
        window.location.href = "catalog.html";
        return;
    }

    const form = document.getElementById("admin-service-form");
    form.addEventListener("submit", saveService);
    Object.keys(serviceRules).forEach(id => {
        document.getElementById(id).addEventListener("input", () => {
            validateServiceField(id);
            updateServiceSubmitButton();
        });
    });

    document.getElementById("open-service-modal").addEventListener("click", () => {
        resetForm();
        openServiceModal();
    });
    document.getElementById("close-service-modal").addEventListener("click", closeServiceModal);
    document.getElementById("service-modal").addEventListener("click", event => {
        if (event.target.id === "service-modal") closeServiceModal();
    });

    updateServiceSubmitButton();
    loadServices();
    loadReviews();
});

function openServiceModal() {
    const modal = document.getElementById("service-modal");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("interactive-modal-open");
    document.getElementById("adm-name").focus();
}

function closeServiceModal() {
    const modal = document.getElementById("service-modal");
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("interactive-modal-open");
}

function showServiceError(id, message) {
    const input = document.getElementById(id);
    const error = document.querySelector(`[data-error-for="${id}"]`);
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
    error.style.display = "block";
}

function clearServiceError(id) {
    const input = document.getElementById(id);
    const error = document.querySelector(`[data-error-for="${id}"]`);
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    error.style.display = "none";
}

function validateServiceField(id) {
    const rule = serviceRules[id];
    const valid = rule.validate(document.getElementById(id).value);
    if (valid) clearServiceError(id);
    else showServiceError(id, rule.message);
    return valid;
}

function isServiceFormValid() {
    return Object.keys(serviceRules).every(id =>
        serviceRules[id].validate(document.getElementById(id).value)
    );
}

function updateServiceSubmitButton() {
    const button = document.getElementById("saveServiceBtn");
    const valid = isServiceFormValid();
    button.disabled = !valid;
    button.classList.toggle("active", valid);
}

async function saveService(event) {
    event.preventDefault();
    Object.keys(serviceRules).forEach(validateServiceField);
    if (!isServiceFormValid()) {
        updateServiceSubmitButton();
        return;
    }

    const id = document.getElementById("edit-id").value;
    const serviceData = {
        name: document.getElementById("adm-name").value.trim(),
        category: document.getElementById("adm-cat").value.trim(),
        price: Number(document.getElementById("adm-price").value),
        image: document.getElementById("adm-img").value.trim(),
        description: document.getElementById("adm-desc").value.trim(),
        time: 15,
        rating: 5
    };
    if (id) serviceData.id = id;
    const response = await fetch(
        id ? `${API_URL}/services/${id}` : `${API_URL}/services`,
        {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(serviceData)
        }
    );

    if (!response.ok) {
        showToast("Не удалось сохранить услугу.", "error");
        return;
    }

    closeServiceModal();
    resetForm();
    await loadServices();
    showToast(id ? "Услуга обновлена." : "Услуга добавлена.", "success");
}

async function loadServices() {
    const response = await fetch(`${API_URL}/services`);
    const services = await response.json();
    const list = document.getElementById("admin-services-list");
    list.innerHTML = "<h3>Все услуги</h3>";

    services.forEach(service => {
        const item = document.createElement("article");
        item.className = "admin-item";
        item.innerHTML = `
            <span>${escapeHtml(service.name)} ($${service.price})</span>
            <div class="admin-actions">
                <button type="button" data-edit-id="${service.id}" class="cat-btn">Редактировать</button>
                <button type="button" data-delete-id="${service.id}" class="cat-btn danger">Удалить</button>
            </div>
        `;
        list.appendChild(item);
    });

    list.querySelectorAll("[data-edit-id]").forEach(button => {
        button.addEventListener("click", () => editService(button.dataset.editId));
    });
    list.querySelectorAll("[data-delete-id]").forEach(button => {
        button.addEventListener("click", () => deleteService(button.dataset.deleteId));
    });
}

async function editService(id) {
    const response = await fetch(`${API_URL}/services/${id}`);
    if (!response.ok) return showToast("Услуга не найдена.", "error");

    const service = await response.json();
    document.getElementById("edit-id").value = service.id;
    document.getElementById("adm-name").value = service.name;
    document.getElementById("adm-cat").value = service.category;
    document.getElementById("adm-price").value = service.price;
    document.getElementById("adm-img").value = service.image;
    document.getElementById("adm-desc").value = service.description;
    document.getElementById("serviceFormTitle").textContent = "Редактировать услугу";
    document.getElementById("saveServiceBtn").textContent = "Сохранить изменения";
    Object.keys(serviceRules).forEach(clearServiceError);
    updateServiceSubmitButton();
    openServiceModal();
}

async function deleteService(id) {
    const confirmed = await showConfirm("Удалить услугу из каталога?", "Удаление услуги");
    if (!confirmed) return;
    const response = await fetch(`${API_URL}/services/${id}`, { method: "DELETE" });
    if (!response.ok) return showToast("Не удалось удалить услугу.", "error");
    await loadServices();
    showToast("Услуга удалена.", "success");
}

function resetForm() {
    document.getElementById("admin-service-form").reset();
    document.getElementById("edit-id").value = "";
    document.getElementById("serviceFormTitle").textContent = "Добавить услугу";
    document.getElementById("saveServiceBtn").textContent = "Добавить услугу";
    Object.keys(serviceRules).forEach(clearServiceError);
    updateServiceSubmitButton();
}

async function loadReviews(filterType = "", filterValue = "") {
    let url = `${API_URL}/feedback`;
    const value = filterValue.trim();
    if (filterType === "service" && value) url += `?serviceId=${encodeURIComponent(value)}`;
    if (filterType === "user" && value) url += `?userId=${encodeURIComponent(value)}`;

    const response = await fetch(url);
    const reviews = await response.json();
    const items = document.getElementById("admin-reviews-items");
    items.innerHTML = "";

    if (reviews.length === 0) {
        items.innerHTML = "<p>Отзывы не найдены.</p>";
        return;
    }

    reviews.forEach(review => {
        const item = document.createElement("article");
        item.className = "admin-item";
        item.innerHTML = `
            <div>
                <strong>${escapeHtml(review.userName)}</strong> (User ID: ${escapeHtml(review.userId)})<br>
                Услуга: ${escapeHtml(review.serviceName)} (ID: ${escapeHtml(review.serviceId)})<br>
                <span>${escapeHtml(review.text)}</span>
            </div>
            <button type="button" data-review-id="${review.id}" class="cat-btn danger">Удалить</button>
        `;
        items.appendChild(item);
    });

    items.querySelectorAll("[data-review-id]").forEach(button => {
        button.addEventListener("click", () => deleteReview(button.dataset.reviewId));
    });
}

function filterReviews(type) {
    loadReviews(type, document.getElementById("filter-id").value);
}

async function deleteReview(id) {
    const confirmed = await showConfirm("Удалить этот отзыв?", "Удаление отзыва");
    if (!confirmed) return;
    const response = await fetch(`${API_URL}/feedback/${id}`, { method: "DELETE" });
    if (!response.ok) return showToast("Не удалось удалить отзыв.", "error");
    await loadReviews();
    showToast("Отзыв удалён.", "success");
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

