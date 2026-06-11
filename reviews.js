const API_URL = "http://localhost:3000";
const MIN_REVIEW_LENGTH = 20;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("review-form").addEventListener("submit", submitReview);
    document.getElementById("service-select").addEventListener("change", validateReviewForm);
    document.getElementById("review-text").addEventListener("input", validateReviewForm);
    validateReviewForm();
    loadServicesForSelect();
    loadAllReviews();
});

function setReviewError(id, message) {
    const error = document.querySelector(`[data-error-for="${id}"]`);
    error.textContent = message;
    error.style.display = message ? "block" : "none";
}

function validateReviewForm(showErrors = false) {
    const serviceId = document.getElementById("service-select").value;
    const text = document.getElementById("review-text").value.trim();
    const serviceValid = Boolean(serviceId);
    const textValid = text.length >= MIN_REVIEW_LENGTH;

    if (showErrors || serviceValid) {
        setReviewError("service-select", serviceValid ? "" : "Выберите услугу.");
    }
    if (showErrors || text.length > 0) {
        setReviewError(
            "review-text",
            textValid ? "" : `Введите не менее ${MIN_REVIEW_LENGTH} символов.`
        );
    }

    const button = document.getElementById("send-review-btn");
    button.disabled = !(serviceValid && textValid);
    return serviceValid && textValid;
}

async function loadServicesForSelect() {
    const response = await fetch(`${API_URL}/services`);
    const services = await response.json();
    const select = document.getElementById("service-select");
    select.innerHTML = '<option value="">-- Выберите купленную услугу --</option>';

    services.forEach(service => {
        const option = document.createElement("option");
        option.value = service.id;
        option.textContent = service.name;
        select.appendChild(option);
    });
}

async function submitReview(event) {
    event.preventDefault();
    if (!validateReviewForm(true)) return;

    const user = JSON.parse(localStorage.getItem("currentUser"));
    const serviceSelect = document.getElementById("service-select");
    const reviewTextarea = document.getElementById("review-text");
    const serviceId = serviceSelect.value;

    if (!user) return showFormMessage("Авторизуйтесь, чтобы оставить отзыв.");
    if (user.role === "admin") return showFormMessage("Администраторы не могут оставлять отзывы.");

    try {
        const ordersResponse = await fetch(`${API_URL}/orders?userId=${encodeURIComponent(user.id)}`);
        const orders = await ordersResponse.json();
        const hasBought = orders.some(order =>
            Array.isArray(order.items) &&
            order.items.some(item => String(item.id) === String(serviceId))
        );

        if (!hasBought) return showFormMessage("Эта услуга не найдена в истории ваших покупок.");

        const response = await fetch(`${API_URL}/feedback`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                serviceId,
                serviceName: serviceSelect.options[serviceSelect.selectedIndex].text,
                text: reviewTextarea.value.trim(),
                date: new Date().toLocaleDateString("ru-RU")
            })
        });

        if (!response.ok) throw new Error("Feedback request failed");
        reviewTextarea.value = "";
        serviceSelect.value = "";
        validateReviewForm();
        showFormMessage("Отзыв успешно отправлен.", true);
        await loadAllReviews();
    } catch {
        showFormMessage("Не удалось отправить отзыв. Проверьте JSON Server.");
    }
}

async function loadAllReviews() {
    const response = await fetch(`${API_URL}/feedback`);
    const reviews = await response.json();
    const list = document.getElementById("reviews-list");
    list.innerHTML = "";

    if (reviews.length === 0) {
        list.innerHTML = "<p>Отзывов пока нет.</p>";
        return;
    }

    reviews.slice().reverse().forEach(review => {
        const item = document.createElement("article");
        item.className = "review-item";
        const author = document.createElement("div");
        author.className = "review-author";
        author.textContent = `${review.userName} об услуге "${review.serviceName}"`;
        const date = document.createElement("div");
        date.className = "review-date";
        date.textContent = review.date;
        const text = document.createElement("p");
        text.className = "text-body-30";
        text.textContent = review.text;
        item.append(author, date, text);
        list.appendChild(item);
    });
}

function showFormMessage(message, success = false) {
    const element = document.getElementById("review-form-message");
    element.textContent = message;
    element.classList.toggle("success", success);
    element.style.display = "block";
}
