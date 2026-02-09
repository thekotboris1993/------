// Модель данных
class TestResult {
    constructor(studentName, testName, score, totalQuestions, timeSpent, date) {
        this.id = Date.now() + Math.random();
        this.studentName = studentName;
        this.testName = testName;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.timeSpent = timeSpent;
        this.date = date || new Date().toISOString();
        this.percentage = Math.round((score / totalQuestions) * 100);
    }
    
    getResultClass() {
        if (this.percentage >= 90) return 'result-excellent';
        if (this.percentage >= 70) return 'result-good';
        if (this.percentage >= 50) return 'result-satisfactory';
        return 'result-poor';
    }
    
    getResultText() {
        if (this.percentage >= 90) return 'Отлично';
        if (this.percentage >= 70) return 'Хорошо';
        if (this.percentage >= 50) return 'Удовлетворительно';
        return 'Повторить';
    }
}

// Класс для управления результатами
class ResultsManager {
    constructor() {
        this.results = [];
        this.filteredResults = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.filters = {
            test: 'all',
            date: 'all',
            search: ''
        };
        this.loadResults();
    }
    
    loadResults() {
        // Загружаем результаты из localStorage
        const saved = localStorage.getItem('testResults');
        if (saved) {
            const data = JSON.parse(saved);
            this.results = data.map(r => new TestResult(
                r.studentName,
                r.testName,
                r.score,
                r.totalQuestions || 20, // По умолчанию 20 вопросов
                r.timeSpent,
                r.date
            ));
        }
        
        // Для демонстрации добавляем тестовые данные
        if (this.results.length === 0) {
            this.generateDemoData();
        }
        
        this.applyFilters();
        this.updateStats();
        this.renderTable();
    }
    
    generateDemoData() {
        const students = ['Мария Иванова', 'Алексей Петров', 'Екатерина Сидорова', 'Дмитрий Козлов', 'Ольга Васильева'];
        const tests = ['Глаголы: Presente'];
        const dates = [
            new Date(2024, 0, 15).toISOString(),
            new Date(2024, 0, 16).toISOString(),
            new Date(2024, 0, 17).toISOString(),
            new Date(2024, 0, 18).toISOString(),
            new Date().toISOString()
        ];
        
        for (let i = 0; i < 25; i++) {
            const result = new TestResult(
                students[Math.floor(Math.random() * students.length)],
                tests[0],
                Math.floor(Math.random() * 21), // 0-20 баллов
                20,
                `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
                dates[Math.floor(Math.random() * dates.length)]
            );
            this.results.push(result);
        }
        
        this.saveResults();
    }
    
    saveResults() {
        localStorage.setItem('testResults', JSON.stringify(this.results));
    }
    
    applyFilters() {
        let filtered = [...this.results];
        
        // Фильтр по тесту
        if (this.filters.test !== 'all') {
            filtered = filtered.filter(r => r.testName.toLowerCase().includes(this.filters.test));
        }
        
        // Фильтр по дате
        if (this.filters.date !== 'all') {
            const now = new Date();
            const resultDate = new Date();
            
            filtered = filtered.filter(r => {
                resultDate.setTime(new Date(r.date).getTime());
                
                switch (this.filters.date) {
                    case 'today':
                        return resultDate.toDateString() === now.toDateString();
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return resultDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return resultDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }
        
        // Поиск по имени
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            filtered = filtered.filter(r => 
                r.studentName.toLowerCase().includes(searchLower)
            );
        }
        
        // Сортировка
        filtered.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            
            switch (this.filters.sortBy) {
                case 'date-asc':
                    return dateA - dateB;
                case 'score-desc':
                    return b.percentage - a.percentage;
                case 'score-asc':
                    return a.percentage - b.percentage;
                default: // date-desc
                    return dateB - dateA;
            }
        });
        
        this.filteredResults = filtered;
        this.currentPage = 1;
    }
    
    updateStats() {
        const totalTests = this.results.length;
        const uniqueStudents = new Set(this.results.map(r => r.studentName)).size;
        
        // Средний балл
        const totalPercentage = this.results.reduce((sum, r) => sum + r.percentage, 0);
        const avgScore = totalTests > 0 ? (totalPercentage / totalTests).toFixed(1) : 0;
        
        // Процент полных прохождений (100%)
        const perfectResults = this.results.filter(r => r.percentage === 100).length;
        const completionRate = totalTests > 0 ? Math.round((perfectResults / totalTests) * 100) : 0;
        
        // Обновляем UI
        document.getElementById('totalTests').textContent = totalTests;
        document.getElementById('uniqueStudents').textContent = uniqueStudents;
        document.getElementById('avgScore').textContent = avgScore;
        document.getElementById('completionRate').textContent = `${completionRate}%`;
    }
    
    renderTable() {
        const tableBody = document.getElementById('tableBody');
        if (!tableBody) return;
        
        // Рассчитываем пагинацию
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = Math.min(startIndex + this.pageSize, this.filteredResults.length);
        const pageResults = this.filteredResults.slice(startIndex, endIndex);
        
        if (pageResults.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-search" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                        По вашему запросу ничего не найдено
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageResults.map(result => `
                <tr>
                    <td><input type="checkbox" class="result-checkbox" data-id="${result.id}"></td>
                    <td>${result.id.toString().slice(-6)}</td>
                    <td><strong>${result.studentName}</strong></td>
                    <td>${result.testName}</td>
                    <td class="result-cell ${result.getResultClass()}">
                        ${result.getResultText()} (${result.percentage}%)
                    </td>
                    <td>${result.score}/${result.totalQuestions}</td>
                    <td>${result.timeSpent}</td>
                    <td>${new Date(result.date).toLocaleDateString('ru-RU')}</td>
                    <td>
                        <button class="action-btn view" onclick="showResultDetails('${result.id}')" title="Просмотреть детали">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                    <td>
                        <button class="action-btn delete" onclick="deleteResult('${result.id}')" title="Удалить результат">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
        
        // Обновляем информацию о пагинации
        this.updatePagination();
    }
    
    updatePagination() {
        const totalPages = Math.ceil(this.filteredResults.length / this.pageSize);
        
        document.getElementById('shownCount').textContent = 
            Math.min((this.currentPage - 1) * this.pageSize + 1, this.filteredResults.length) + 
            ' - ' + 
            Math.min(this.currentPage * this.pageSize, this.filteredResults.length);
        
        document.getElementById('totalCount').textContent = this.filteredResults.length;
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = totalPages;
        
        // Кнопки пагинации
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages || totalPages === 0;
        
        // Выделение всех чекбоксов
        const selectAll = document.getElementById('selectAll');
        if (selectAll) {
            selectAll.checked = false;
            selectAll.onchange = (e) => {
                const checkboxes = document.querySelectorAll('.result-checkbox');
                checkboxes.forEach(cb => cb.checked = e.target.checked);
            };
        }
    }
    
    setFilter(filterType, value) {
        this.filters[filterType] = value;
        if (filterType === 'sortBy') {
            this.filters.sortBy = value;
        }
        this.applyFilters();
        this.renderTable();
    }
    
    setSearch(searchTerm) {
        this.filters.search = searchTerm;
        this.applyFilters();
        this.renderTable();
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.renderTable();
    }
    
    deleteResult(id) {
        if (confirm('Вы уверены, что хотите удалить этот результат?')) {
            this.results = this.results.filter(r => r.id !== id);
            this.saveResults();
            this.applyFilters();
            this.updateStats();
            this.renderTable();
        }
    }
    
    exportToCSV() {
        if (this.filteredResults.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }
        
        const headers = ['Студент', 'Тест', 'Баллы', 'Результат%', 'Время', 'Дата'];
        const csvContent = [
            headers.join(','),
            ...this.filteredResults.map(r => [
                `"${r.studentName}"`,
                `"${r.testName}"`,
                `${r.score}/${r.totalQuestions}`,
                `${r.percentage}%`,
                r.timeSpent,
                new Date(r.date).toLocaleDateString('ru-RU')
            ].join(','))
        ].join('\n');
        
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `test_results_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
    }
}

// Глобальный экземпляр менеджера результатов
let resultsManager;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию
    if (typeof AuthGuard !== 'undefined') {
        AuthGuard.updateUserInfo();
    }
    
    // Инициализируем менеджер результатов
    resultsManager = new ResultsManager();
    
    // Настройка фильтров
    document.getElementById('testFilter').addEventListener('change', (e) => {
        resultsManager.setFilter('test', e.target.value);
    });
    
    document.getElementById('dateFilter').addEventListener('change', (e) => {
        resultsManager.setFilter('date', e.target.value);
    });
    
    document.getElementById('sortBy').addEventListener('change', (e) => {
        resultsManager.setFilter('sortBy', e.target.value);
    });
    
    // Поиск
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            resultsManager.setSearch(e.target.value);
        }, 300);
    });
    
    // Кнопки
    document.getElementById('refreshBtn').addEventListener('click', () => {
        resultsManager.loadResults();
    });
    
    document.getElementById('exportBtn').addEventListener('click', () => {
        resultsManager.exportToCSV();
    });
    
    document.getElementById('clearFilters').addEventListener('click', () => {
        document.getElementById('testFilter').value = 'all';
        document.getElementById('dateFilter').value = 'all';
        document.getElementById('sortBy').value = 'date-desc';
        searchInput.value = '';
        
        resultsManager.setFilter('test', 'all');
        resultsManager.setFilter('date', 'all');
        resultsManager.setFilter('sortBy', 'date-desc');
        resultsManager.setSearch('');
    });
    
    // Пагинация
    document.getElementById('prevPage').addEventListener('click', () => {
        if (resultsManager.currentPage > 1) {
            resultsManager.goToPage(resultsManager.currentPage - 1);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(resultsManager.filteredResults.length / resultsManager.pageSize);
        if (resultsManager.currentPage < totalPages) {
            resultsManager.goToPage(resultsManager.currentPage + 1);
        }
    });
    
    // Модальное окно
    const modal = document.getElementById('resultDetailsModal');
    const closeModal = document.querySelector('.close-modal');
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Функция для отображения деталей результата
function showResultDetails(resultId) {
    const result = resultsManager.results.find(r => r.id === resultId);
    if (!result) return;
    
    const modal = document.getElementById('resultDetailsModal');
    const modalBody = document.getElementById('modalBody');
    
    const date = new Date(result.date);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    modalBody.innerHTML = `
        <div class="result-details-content">
            <div class="detail-section">
                <h3><i class="fas fa-user-graduate"></i> Информация о студенте</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Студент:</span>
                        <span class="detail-value">${result.studentName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Тест:</span>
                        <span class="detail-value">${result.testName}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-chart-line"></i> Результаты</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Баллы:</span>
                        <span class="detail-value score-highlight ${result.getResultClass()}">
                            ${result.score}/${result.totalQuestions}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Процент:</span>
                        <span class="detail-value">${result.percentage}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Оценка:</span>
                        <span class="detail-value ${result.getResultClass()}">
                            ${result.getResultText()}
                        </span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Затраченное время:</span>
                        <span class="detail-value">${result.timeSpent}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-calendar"></i> Дата и время</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">Дата прохождения:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-lightbulb"></i> Рекомендации</h3>
                <div class="recommendations">
                    ${result.percentage >= 90 ? 
                        '<p><i class="fas fa-check-circle success"></i> Студент отлично усвоил материал. Можно переходить к следующей теме.</p>' : 
                      result.percentage >= 70 ?
                        '<p><i class="fas fa-check-circle warning"></i> Хороший результат. Рекомендуется повторить сложные моменты.</p>' :
                      result.percentage >= 50 ?
                        '<p><i class="fas fa-exclamation-circle warning"></i> Удовлетворительный результат. Требуется повторение материала.</p>' :
                        '<p><i class="fas fa-times-circle error"></i> Низкий результат. Необходимо подробно разобрать тему.</p>'
                    }
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}

// Функция для удаления результата
function deleteResult(resultId) {
    resultsManager.deleteResult(resultId);
}