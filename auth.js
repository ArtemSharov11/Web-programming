const API_URL = "http://localhost:3000";
const MAX_NICKNAME_GENERATIONS = 5;

const registrationFields = {
    lastName: {
        validate: value => /^[А-ЯЁA-Z][а-яёa-z-]{1,39}$/u.test(value.trim()),
        message: "Введите фамилию: 2-40 букв, первая буква заглавная."
    },
    firstName: {
        validate: value => /^[А-ЯЁA-Z][а-яёa-z-]{1,39}$/u.test(value.trim()),
        message: "Введите имя: 2-40 букв, первая буква заглавная."
    },
    middleName: {
        validate: value => !value.trim() || /^[А-ЯЁA-Z][а-яёa-z-]{1,39}$/u.test(value.trim()),
        message: "Отчество должно содержать 2-40 букв."
    },
    phone: {
        validate: value => /^\+375(?:25|29|33|44)\d{7}$/.test(value.trim()),
        message: "Введите номер РБ: +375 и 9 цифр, код 25, 29, 33 или 44."
    },
    email: {
        validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value.trim()),
        message: "Введите корректный email."
    },
    birthDate: {
        validate: value => isAtLeast16(value),
        message: "Зарегистрироваться можно с 16 лет."
    },
    nickname: {
        validate: value => /^[A-Za-zА-ЯЁа-яё][A-Za-zА-ЯЁа-яё0-9_]{2,19}$/u.test(value.trim()),
        message: "Никнейм: 3-20 символов, буквы, цифры и знак подчёркивания."
    }
};

let nicknameGenerationCount = 0;
let nicknameIsUnique = false;

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const regForm = document.getElementById("regForm");

    loginForm.addEventListener("submit", login);
    regForm.addEventListener("submit", register);
    document.getElementById("genNickBtn").addEventListener("click", generateNickname);
    document.getElementById("passMethod").addEventListener("change", updatePasswordMethod);

    Object.keys(registrationFields).forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener("input", () => {
            if (id === "nickname") nicknameIsUnique = false;
            validateField(id);
            updateRegisterButton();
        });
        input.addEventListener("blur", async () => {
            validateField(id);
            if (id === "nickname" && registrationFields.nickname.validate(input.value)) {
                await validateNicknameUnique();
            }
            updateRegisterButton();
        });
    });

    ["pass1", "pass2"].forEach(id => {
        document.getElementById(id).addEventListener("input", () => {
            validatePasswords();
            updateRegisterButton();
        });
    });

    document.getElementById("pass2").addEventListener("paste", event => {
        event.preventDefault();
        showFieldError("pass2", "Повторный пароль необходимо ввести вручную.");
    });

    document.getElementById("agreeCheck").addEventListener("change", updateRegisterButton);
    updatePasswordMethod();
    updateRegisterButton();
});

function isAtLeast16(value) {
    if (!value) return false;
    const birthDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) return false;

    const threshold = new Date();
    threshold.setFullYear(threshold.getFullYear() - 16);
    return birthDate <= threshold;
}

function getErrorElement(id) {
    return document.querySelector(`[data-error-for="${id}"]`);
}

function showFieldError(id, message) {
    const input = document.getElementById(id);
    const error = getErrorElement(id);
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
    error.style.display = "block";
}

function clearFieldError(id) {
    const input = document.getElementById(id);
    const error = getErrorElement(id);
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    error.style.display = "none";
}

function validateField(id) {
    const field = registrationFields[id];
    const value = document.getElementById(id).value;
    const valid = field.validate(value);
    if (valid) clearFieldError(id);
    else showFieldError(id, field.message);
    return valid;
}

function validatePasswords() {
    const method = document.getElementById("passMethod").value;
    const password = document.getElementById("pass1").value;
    const repeatedPassword = document.getElementById("pass2").value;

    if (method === "auto") {
        clearFieldError("pass1");
        clearFieldError("pass2");
        return true;
    }

    const passwordValid =
        password.length >= 8 &&
        password.length <= 20 &&
        /[A-ZА-ЯЁ]/u.test(password) &&
        /[a-zа-яё]/u.test(password) &&
        /\d/.test(password) &&
        /[^A-Za-zА-ЯЁа-яё0-9]/u.test(password) &&
        !TOP_100_PASSWORDS.some(item => item.toLowerCase() === password.toLowerCase());

    if (passwordValid) clearFieldError("pass1");
    else {
        showFieldError(
            "pass1",
            "8-20 символов: заглавная и строчная буквы, цифра и специальный символ; пароль не должен входить в TOP-100."
        );
    }

    const repeatedValid = passwordValid && password === repeatedPassword;
    if (repeatedValid) clearFieldError("pass2");
    else showFieldError("pass2", "Пароли должны совпадать.");

    return passwordValid && repeatedValid;
}

function createSecurePassword() {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghijkmnopqrstuvwxyz";
    const digits = "23456789";
    const special = "!@#$%&*?";
    const all = upper + lower + digits + special;
    const random = array => array[crypto.getRandomValues(new Uint32Array(1))[0] % array.length];
    const chars = [random(upper), random(lower), random(digits), random(special)];

    while (chars.length < 12) chars.push(random(all));
    return chars
        .map(value => ({ value, order: crypto.getRandomValues(new Uint32Array(1))[0] }))
        .sort((a, b) => a.order - b.order)
        .map(item => item.value)
        .join("");
}

function updatePasswordMethod() {
    const automatic = document.getElementById("passMethod").value === "auto";
    const pass1 = document.getElementById("pass1");
    const pass2 = document.getElementById("pass2");

    pass1.readOnly = automatic;
    pass2.readOnly = automatic;
    if (automatic) {
        const generatedPassword = createSecurePassword();
        pass1.value = generatedPassword;
        pass2.value = generatedPassword;
        clearFieldError("pass1");
        clearFieldError("pass2");
    } else {
        pass1.value = "";
        pass2.value = "";
    }
    updateRegisterButton();
}

function nicknamePart(value) {
    return value
        .trim()
        .replace(/[^A-Za-zА-ЯЁа-яё]/gu, "")
        .slice(0, 3);
}

async function generateNickname() {
    if (!validateField("firstName") || !validateField("lastName")) {
        updateRegisterButton();
        return;
    }

    nicknameGenerationCount += 1;
    const first = nicknamePart(document.getElementById("firstName").value);
    const last = nicknamePart(document.getElementById("lastName").value);
    const randomNumber = crypto.getRandomValues(new Uint32Array(1))[0] % 990 + 10;
    const nicknameInput = document.getElementById("nickname");

    nicknameInput.value = `${first}${last}${randomNumber}`;
    nicknameInput.readOnly = nicknameGenerationCount < MAX_NICKNAME_GENERATIONS;
    document.getElementById("nicknameHint").textContent =
        nicknameGenerationCount < MAX_NICKNAME_GENERATIONS
            ? `Попытка ${nicknameGenerationCount} из ${MAX_NICKNAME_GENERATIONS}.`
            : "Доступен самостоятельный ввод никнейма.";

    validateField("nickname");
    await validateNicknameUnique();
    updateRegisterButton();
}

async function validateNicknameUnique() {
    const nickname = document.getElementById("nickname").value.trim();
    if (!registrationFields.nickname.validate(nickname)) {
        nicknameIsUnique = false;
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/users?nickname=${encodeURIComponent(nickname)}`);
        const users = await response.json();
        nicknameIsUnique = users.length === 0;
        if (nicknameIsUnique) clearFieldError("nickname");
        else showFieldError("nickname", "Этот никнейм уже занят.");
        return nicknameIsUnique;
    } catch {
        nicknameIsUnique = false;
        showFieldError("nickname", "Не удалось проверить никнейм. Проверьте JSON Server.");
        return false;
    }
}

function isRegistrationValid() {
    const fieldsValid = Object.keys(registrationFields).every(id =>
        registrationFields[id].validate(document.getElementById(id).value)
    );
    return fieldsValid &&
        nicknameIsUnique &&
        validatePasswords() &&
        document.getElementById("agreeCheck").checked;
}

function updateRegisterButton() {
    const button = document.getElementById("regBtn");
    const valid = isRegistrationValid();
    button.disabled = !valid;
    button.classList.toggle("active", valid);
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPass").value;
    const error = document.getElementById("loginError");

    try {
        const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}`);
        const users = await response.json();
        const user = users.find(item => item.email.toLowerCase() === email && item.password === password);

        if (!user) {
            error.textContent = "Неверный email или пароль.";
            error.style.display = "block";
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        window.location.href = user.role === "admin" ? "admin.html" : "catalog.html";
    } catch {
        error.textContent = "Не удалось подключиться к JSON Server.";
        error.style.display = "block";
    }
}

async function register(event) {
    event.preventDefault();
    Object.keys(registrationFields).forEach(validateField);
    await validateNicknameUnique();

    if (!isRegistrationValid()) {
        updateRegisterButton();
        return;
    }

    const email = document.getElementById("email").value.trim().toLowerCase();
    const phone = document.getElementById("phone").value.trim();
    const duplicateResponse = await fetch(
        `${API_URL}/users?email=${encodeURIComponent(email)}`
    );
    const duplicateUsers = await duplicateResponse.json();

    if (duplicateUsers.length > 0) {
        showFieldError("email", "Пользователь с таким email уже существует.");
        updateRegisterButton();
        return;
    }

    const user = {
        lastName: document.getElementById("lastName").value.trim(),
        firstName: document.getElementById("firstName").value.trim(),
        middleName: document.getElementById("middleName").value.trim(),
        phone,
        email,
        birthDate: document.getElementById("birthDate").value,
        nickname: document.getElementById("nickname").value.trim(),
        password: document.getElementById("pass1").value,
        role: "client"
    };

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        if (!response.ok) throw new Error("Registration failed");
        const createdUser = await response.json();
        localStorage.setItem("currentUser", JSON.stringify(createdUser));
        window.location.href = "catalog.html";
    } catch {
        document.getElementById("registrationError").textContent =
            "Не удалось зарегистрироваться. Проверьте JSON Server.";
        document.getElementById("registrationError").style.display = "block";
    }
}
