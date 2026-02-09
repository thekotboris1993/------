// Конфигурация пользователей (упрощенная версия без хеширования для отладки)
const VALID_USERS = [
    {
        username: 'teacher',
        password: 'spanish123', // Пароль в открытом виде для отладки
        name: 'Преподаватель',
        role: 'admin'
    },
    {
        username: 'assistant',
        password: '1234',
        name: 'Ассистент',
        role: 'assistant'
    }
];

// Элементы DOM
const loginForm = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberCheckbox = document.getElementById('remember');
const errorMessage = document.getElementById('errorMessage');

// Переключение видимости пароля
togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
});

// Обработка формы входа
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Сброс ошибки
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    
    // Валидация
    if (!username || !password) {
        showError('Пожалуйста, заполните все поля');
        return;
    }
    
    // Поиск пользователя (упрощенная проверка без хеширования)
    const user = VALID_USERS.find(u => u.username === username);
    
    if (!user) {
        showError('Пользователь с таким логином не найден');
        return;
    }
    
    // Прямое сравнение пароля (только для отладки!)
    if (user.password !== password) {
        showError('Неверный пароль');
        return;
    }
    
    // Успешный вход
    const sessionData = {
        username: user.username,
        name: user.name,
        role: user.role,
        loggedIn: true,
        timestamp: new Date().getTime()
    };
    
    // Сохранение сессии
    if (rememberCheckbox.checked) {
        localStorage.setItem('teacherSession', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('teacherSession', JSON.stringify(sessionData));
    }
    
    // Редирект в личный кабинет
    window.location.href = 'admin_dashboard.html';
});

// Показать ошибку
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    
    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// Автозаполнение сохраненных данных
document.addEventListener('DOMContentLoaded', () => {
    const savedSession = localStorage.getItem('teacherSession');
    if (savedSession) {
        try {
            const session = JSON.parse(savedSession);
            usernameInput.value = session.username || '';
            rememberCheckbox.checked = true;
        } catch (e) {
            console.log('Не удалось загрузить сохраненную сессию');
        }
    }
    
    // Автоматическое заполнение демо-данных (только для разработки)
    if (window.location.href.includes('localhost') || window.location.href.includes('127.0.0.1')) {
        usernameInput.value = 'teacher';
        passwordInput.value = 'spanish123';
    }
});