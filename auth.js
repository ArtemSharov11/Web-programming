const API_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        alert("Доступ запрещен! Эта страница только для администраторов.");
        window.location.href = "catalog.html";
        return;
    }

    loadServices();
    loadReviews();

    const serviceForm = document.getElementById('admin-service-form');
    const inputs = serviceForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateServiceForm();
        });
    });
});

function validateServiceForm() {
    const name = document.getElementById('adm-name').value;
    const cat = document.getElementById('adm-cat').value;
    const price = document.getElementById('adm-price').value;
    const img = document.getElementById('adm-img').value;
    const btn = document.getElementById('saveServiceBtn');

    let isValid = true;

    if (name.length < 3) isValid = false;
    if (cat.length < 2) isValid = false;
    if (Number(price) <= 0) isValid = false;
    if (!img.startsWith('http')) isValid = false;

    btn.disabled = !isValid;
    btn.style.opacity = isValid ? "1" : "0.5";
}

document.getElementById('admin-service-form').onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    
    const serviceData = {
        name: document.getElementById('adm-name').value,
        category: document.getElementById('adm-cat').value,
        price: Number(document.getElementById('adm-price').value),
        image: document.getElementById('adm-img').value,
        description: document.getElementById('adm-desc').value,
        rating: 5
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/services/${id}` : `${API_URL}/services`;

    await fetch(url, {
        method: method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(serviceData)
    });

    resetForm();
    loadServices();
    alert("Услуга сохранена!");
};

async function loadReviews(filterType = '', filterValue = '') {
    let url = `${API_URL}/feedback`;
    if (filterType === 'service' && filterValue) url += `?serviceId=${filterValue}`;
    if (filterType === 'user' && filterValue) url += `?userId=${filterValue}`;

    const res = await fetch(url);
    const data = await res.json();
    const list = document.getElementById('admin-reviews-list');
    
    list.innerHTML = `
        <div style="margin-bottom: 15px; display:flex; gap:10px; flex-wrap:wrap;">
            <input type="text" id="filter-id" placeholder="Введите ID" style="width:100px; margin:0;">
            <button onclick="loadReviews('service', document.getElementById('filter-id').value)" class="cat-btn" style="padding:5px 10px;">По товару</button>
            <button onclick="loadReviews('user', document.getElementById('filter-id').value)" class="cat-btn" style="padding:5px 10px;">По юзеру</button>
            <button onclick="loadReviews()" class="cat-btn" style="padding:5px 10px; background:#ccc;">Сброс</button>
        </div>
    `;

    if (data.length === 0) {
        list.innerHTML += '<p>Отзывов не найдено.</p>';
        return;
    }

    data.forEach(r => {
        list.innerHTML += `
            <div class="admin-item">
                <div style="font-size:0.85rem">
                    <b>${r.userName}</b> (User ID: ${r.userId})<br>
                    Услуга: ${r.serviceName} (ID: ${r.serviceId})<br>
                    <i>"${r.text}"</i>
                </div>
                <button onclick="deleteReview('${r.id}')" class="cat-btn" style="background:#ff4d4d">🗑️</button>
            </div>`;
    });
}

async function loadServices() {
    const res = await fetch(`${API_URL}/services`);
    const data = await res.json();
    const list = document.getElementById('admin-services-list');
    list.innerHTML = '<h4>Все услуги:</h4>';
    data.forEach(s => {
        list.innerHTML += `
            <div class="admin-item">
                <span>${s.name} ($${s.price})</span>
                <div>
                    <button onclick="editService('${s.id}')" class="cat-btn">✏️</button>
                    <button onclick="deleteService('${s.id}')" class="cat-btn" style="background:#ff4d4d">🗑️</button>
                </div>
            </div>`;
    });
}

async function editService(id) {
    const res = await fetch(`${API_URL}/services/${id}`);
    const s = await res.json();
    document.getElementById('edit-id').value = s.id;
    document.getElementById('adm-name').value = s.name;
    document.getElementById('adm-cat').value = s.category;
    document.getElementById('adm-price').value = s.price;
    document.getElementById('adm-img').value = s.image;
    document.getElementById('adm-desc').value = s.description;
    validateServiceForm();
}

async function deleteService(id) {
    if (confirm("Удалить услугу из каталога?")) {
        await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
        loadServices();
    }
}

async function deleteReview(id) {
    if (confirm("Удалить этот отзыв?")) {
        await fetch(`${API_URL}/feedback/${id}`, { method: 'DELETE' });
        loadReviews();
    }
}

function resetForm() {
    document.getElementById('admin-service-form').reset();
    document.getElementById('edit-id').value = '';
    validateServiceForm();
}