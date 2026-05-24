const API_URL = "http://localhost:3000";

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        alert("Доступ запрещен!");
        window.location.href = "catalog.html";
        return;
    }
    loadServices();
    loadReviews();
});

async function loadServices() {
    const res = await fetch(`${API_URL}/services`);
    const data = await res.json();
    const list = document.getElementById('admin-services-list');
    list.innerHTML = '<h4>Список услуг:</h4>';
    data.forEach(s => {
        list.innerHTML += `
            <div class="admin-item">
                <span>${s.name} ($${s.price})</span>
                <div>
                    <button onclick="editService('${s.id}')" style="cursor:pointer">✏️</button>
                    <button onclick="deleteService('${s.id}')" style="cursor:pointer">🗑️</button>
                </div>
            </div>`;
    });
}

async function deleteService(id) {
    if (confirm("Удалить услугу?")) {
        await fetch(`${API_URL}/services/${id}`, { method: 'DELETE' });
        loadServices();
    }
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
    alert("Готово!");
};

function resetForm() {
    document.getElementById('admin-service-form').reset();
    document.getElementById('edit-id').value = '';
}

async function loadReviews(filterType = '', filterValue = '') {
    let url = `${API_URL}/feedback`;
    
    if (filterType === 'service') url += `?serviceId=${filterValue}`;
    if (filterType === 'user') url += `?userId=${filterValue}`;

    const res = await fetch(url);
    const data = await res.json();
    const list = document.getElementById('admin-reviews-list');
    
    list.innerHTML = `
        <div style="margin-bottom: 10px; display:flex; gap:5px;">
            <button onclick="loadReviews()" class="cat-btn" style="font-size:0.7rem">Все</button>
            <input type="text" id="filter-input" placeholder="ID (товара или юзера)" style="width:120px; margin:0;">
            <button onclick="loadReviews('service', document.getElementById('filter-input').value)" class="cat-btn" style="font-size:0.7rem">По товару</button>
            <button onclick="loadReviews('user', document.getElementById('filter-input').value)" class="cat-btn" style="font-size:0.7rem">По юзеру</button>
        </div>
    `;

    data.forEach(r => {
        list.innerHTML += `
            <div class="admin-item">
                <div style="font-size:0.8rem">
                    <b>${r.userName}</b> (ID: ${r.userId}) <br>
                    <small>о товаре ID: ${r.serviceId}</small><br>
                    <i>"${r.text}"</i>
                </div>
                <button onclick="deleteReview('${r.id}')" style="background:none; border:none; cursor:pointer;">🗑️</button>
            </div>`;
    });
}

async function deleteReview(id) {
    await fetch(`${API_URL}/feedback/${id}`, { method: 'DELETE' });
    loadReviews();
}