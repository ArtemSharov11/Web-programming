const API_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', () => {
    loadServicesForSelect();
    loadAllReviews();

    const sendBtn = document.getElementById('send-review-btn');
    sendBtn.addEventListener('click', submitReview);
});

async function loadServicesForSelect() {
    const res = await fetch(`${API_URL}/services`);
    const services = await res.json();
    const select = document.getElementById('service-select');
    
    select.innerHTML = '<option value="">-- Выберите услугу из списка --</option>';
    services.forEach(s => {
        select.innerHTML += `<option value="${s.id}">${s.name}</option>`;
    });
}

async function submitReview() {
    console.log("Кнопка нажата!"); // Проверим, работает ли кнопка

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const serviceSelect = document.getElementById('service-select');
    const reviewTextarea = document.getElementById('review-text');

    // Проверка, найдены ли элементы на странице
    if (!serviceSelect || !reviewTextarea) {
        console.error("Ошибка: Не найдены ID 'service-select' или 'review-text' в HTML!");
        return;
    }

    const serviceId = serviceSelect.value;
    const text = reviewTextarea.value.trim();

    console.log("Данные для отправки:", { user, serviceId, textLength: text.length });

    if (!user) {
        alert("Ошибка: Вы не авторизованы! Зайдите на страницу регистрации.");
        return;
    }

    if (user.role === 'admin') {
        alert("Администраторы не могут оставлять отзывы.");
        return;
    }

    if (!serviceId) {
        alert("Выберите услугу из списка!");
        return;
    }

    if (text.length < 20) {
        alert("Отзыв слишком короткий (минимум 20 символов)!");
        return;
    }

    // Проверяем покупки
    console.log("Проверяем историю заказов для пользователя:", user.id);
    const resOrders = await fetch(`${API_URL}/orders?userId=${user.id}`);
    const orders = await resOrders.json();
    
    const hasBought = orders.some(order => 
        order.items.some(item => String(item.id) === String(serviceId))
    );

    if (!hasBought) {
        alert("Вы не можете оставить отзыв: услуга не найдена в ваших заказах.");
        return;
    }

    const newFeedback = {
        userId: user.id,
        userName: `${user.firstName} ${user.lastName}`,
        serviceId: serviceId,
        serviceName: serviceSelect.options[serviceSelect.selectedIndex].text,
        text: text,
        date: new Date().toLocaleDateString('ru-RU')
    };

    try {
        const response = await fetch(`${API_URL}/feedback`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newFeedback)
        });

        if (response.ok) {
            alert("Отзыв успешно отправлен!");
            reviewTextarea.value = '';
            loadAllReviews();
        }
    } catch (e) {
        console.error("Ошибка при отправке на сервер:", e);
    }
}

async function loadAllReviews() {
    const res = await fetch(`${API_URL}/feedback`);
    const reviews = await res.json();
    const list = document.getElementById('reviews-list');
    
    list.innerHTML = reviews.length ? '' : '<p>Отзывов пока нет. Будьте первым!</p>';

    reviews.reverse().forEach(rev => {
        list.innerHTML += `
            <div class="review-item">
                <div class="review-author">${rev.userName} <span style="font-weight:400; color:#808080">об услуге</span> "${rev.serviceName}"</div>
                <div class="review-date">${rev.date}</div>
                <div class="text-body-30">${rev.text}</div>
            </div>
        `;
    });
}

function showError(msg) {
    const errorDiv = document.getElementById('review-error');
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 4000);
}