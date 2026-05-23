const API_URL = "http://localhost:3000";
let nickAttempts = 0;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('regForm');
    const inputs = form.querySelectorAll('input');
    const passMethod = document.getElementById('passMethod');
    const p1 = document.getElementById('pass1');
    const p2 = document.getElementById('pass2');
    const nicknameInput = document.getElementById('nickname');
    const agreeCheck = document.getElementById('agreeCheck');
    const regBtn = document.getElementById('regBtn');

    document.getElementById('genNickBtn').onclick = () => {
        nickAttempts++;
        const fName = document.getElementById('firstName').value || "User";
        const lName = document.getElementById('lastName').value || "Guest";
        
        if (nickAttempts <= 5) {
            const randomNum = Math.floor(Math.random() * 990) + 10;
            const generated = fName.slice(0, 3) + lName.slice(0, 3) + randomNum;
            nicknameInput.value = generated;
        } else {
            nicknameInput.readOnly = false;
            nicknameInput.placeholder = "Придумайте никнейм сами";
            alert("Попытки генерации исчерпаны. Введите никнейм вручную.");
        }
        validateForm();
    };

    passMethod.addEventListener('change', () => {
        if (passMethod.value === 'auto') {
            const strongPass = generateStrongPassword();
            p1.value = strongPass;
            p2.value = strongPass;
            
            p1.type = 'text';
            p2.type = 'text';
            
            p1.readOnly = true;
            p2.readOnly = true;
            
        } else {
            p1.value = '';
            p2.value = '';
            p1.type = 'password';
            p2.type = 'password';
            p1.readOnly = false;
            p2.readOnly = false;
        }
        validateForm();
    });

    function generateStrongPassword() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
        let pass = "";
        pass += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
        pass += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
        pass += "0123456789"[Math.floor(Math.random() * 10)];
        pass += "@$!%*?&"[Math.floor(Math.random() * 7)];
        
        for (let i = 0; i < 8; i++) {
            pass += chars[Math.floor(Math.random() * chars.length)];
        }
        return pass.split('').sort(() => 0.5 - Math.random()).join('');
    }

    p2.onpaste = (e) => e.preventDefault();

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            hideError(input);
            validateForm();
        });
    });
    agreeCheck.addEventListener('change', validateForm);

    async function validateForm() {
        let isAllValid = true;

        if (document.getElementById('firstName').value.length < 2) isAllValid = false;
        if (document.getElementById('lastName').value.length < 2) isAllValid = false;

        const phone = document.getElementById('phone');
        const phoneRegex = /^\+375(25|29|33|44)\d{7}$/;
        if (!phoneRegex.test(phone.value)) {
            if (phone.value.length > 0) showError(phone);
            isAllValid = false;
        }

        const email = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            if (email.value.length > 0) showError(email);
            isAllValid = false;
        }

        const birthDate = document.getElementById('birthDate');
        if (birthDate.value) {
            const birth = new Date(birthDate.value);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            
            if (age < 16) {
                showError(birthDate);
                isAllValid = false;
            }
        } else isAllValid = false;

        const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]{8,20}$/;
        if (!passRegex.test(p1.value) || TOP_100_PASSWORDS.includes(p1.value)) {
            if (p1.value.length > 0) showError(p1);
            isAllValid = false;
        }

        if (p1.value !== p2.value || p2.value === "") {
            if (p2.value.length > 0) showError(p2);
            isAllValid = false;
        }

        if (nicknameInput.value === "") isAllValid = false;

        if (!agreeCheck.checked) isAllValid = false;

        if (isAllValid) {
            regBtn.classList.add('active');
            regBtn.disabled = false;
        } else {
            regBtn.classList.remove('active');
            regBtn.disabled = true;
        }
        
        return isAllValid;
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const nick = nicknameInput.value;
        
        const res = await fetch(`${API_URL}/users?nickname=${nick}`);
        const existing = await res.json();
        
        if (existing.length > 0) {
            alert("Этот никнейм уже занят!");
            showError(nicknameInput);
            return;
        }

        const newUser = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            middleName: document.getElementById('middleName').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            birthDate: document.getElementById('birthDate').value,
            nickname: nick,
            password: p1.value,
            role: "client"
        };

        try {
            await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newUser)
            });

            alert("Регистрация завершена успешно!");
            window.location.href = "catalog.html";
        } catch (err) {
            alert("Ошибка при сохранении пользователя.");
        }
    };
});

function showError(input) {
    const group = input.closest('.form-group');
    const msg = group.querySelector('.error-msg');
    if (msg) msg.style.display = 'block';
    return false;
}

function hideError(input) {
    const group = input.closest('.form-group');
    const msg = group.querySelector('.error-msg');
    if (msg) msg.style.display = 'none';
}