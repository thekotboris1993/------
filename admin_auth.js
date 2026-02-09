// В начале файла добавьте
console.log('Проверка авторизации...', {
    sessionStorage: sessionStorage.getItem('teacherSession') ? 'Есть' : 'Нет',
    localStorage: localStorage.getItem('teacherSession') ? 'Есть' : 'Нет'
});
// Проверка авторизации для защищенных страниц
class AuthGuard {
    static checkAuth() {
        // Проверяем сессию в sessionStorage и localStorage
        const session = sessionStorage.getItem('teacherSession') || localStorage.getItem('teacherSession');
        
        if (!session) {
            // Если нет сессии, редирект на страницу входа
            if (!window.location.pathname.includes('admin_login.html')) {
                window.location.href = 'admin_login.html';
            }
            return null;
        }
        
        try {
            const sessionData = JSON.parse(session);
            
            // Проверяем, не устарела ли сессия (24 часа)
            const now = new Date().getTime();
            const sessionAge = now - sessionData.timestamp;
            const maxAge = 24 * 60 * 60 * 1000; // 24 часа
            
            if (sessionAge > maxAge) {
                this.logout();
                return null;
            }
            
            return sessionData;
        } catch (e) {
            console.error('Ошибка при проверке сессии:', e);
            this.logout();
            return null;
        }
    }
    
    static logout() {
        // Удаляем сессии
        sessionStorage.removeItem('teacherSession');
        localStorage.removeItem('teacherSession');
        
        // Редирект на страницу входа
        window.location.href = 'admin_login.html';
    }
    
    static updateUserInfo() {
        const session = this.checkAuth();
        if (session) {
            // Обновляем информацию о пользователе на странице
            const userNameElements = document.querySelectorAll('#userName, #userFullName');
            userNameElements.forEach(el => {
                if (el.id === 'userName') {
                    el.textContent = session.username;
                } else {
                    el.textContent = session.name;
                }
            });
            
            const userRoleElement = document.getElementById('userRole');
            if (userRoleElement) {
                userRoleElement.textContent = session.role === 'admin' ? 'Администратор' : 'Ассистент';
            }
            
            const lastLoginElement = document.getElementById('lastLogin');
            if (lastLoginElement) {
                const lastLogin = new Date(session.timestamp);
                lastLoginElement.textContent = lastLogin.toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
            
            // Настраиваем кнопку выхода
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (confirm('Вы уверены, что хотите выйти?')) {
                        this.logout();
                    }
                });
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Для страниц админки проверяем авторизацию
    if (window.location.pathname.includes('admin_') && 
        !window.location.pathname.includes('admin_login.html')) {
        AuthGuard.checkAuth();
    }
    
    // Обновляем информацию о пользователе
    AuthGuard.updateUserInfo();
});