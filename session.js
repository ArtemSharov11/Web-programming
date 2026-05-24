document.addEventListener('DOMContentLoaded', () => {
    const userStatus = document.getElementById('user-status');
    const authLink = document.getElementById('auth-link');
    const user = JSON.parse(localStorage.getItem('currentUser'));

    if (user && userStatus) {
        if (authLink) authLink.style.display = 'none';
        
        userStatus.innerHTML = `
            <span style="font-weight: 500;">Привет, ${user.firstName}!</span>
            ${user.role === 'admin' ? '<a href="admin.html" style="color: #9EF01A; font-weight: bold; margin-left:10px;">Админка</a>' : ''}
            <button onclick="logout()" style="background: none; border: 1px solid #ccc; cursor: pointer; padding: 5px 10px; border-radius: 20px; margin-left:10px;">Выйти</button>
        `;
    }
});

function logout() {
    localStorage.removeItem('currentUser');
    alert("Вы вышли из системы");
    window.location.href = "auth.html";
}