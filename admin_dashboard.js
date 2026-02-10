// Модель данных
class TestResult {
    constructor(studentName, testName, score, totalQuestions, timeSpent, date) {
        // Обрабатываем как старые, так и новые форматы данных
        if (typeof studentName === 'object' && studentName !== null) {
            // Если первый аргумент - объект (старый формат)
            const data = studentName;
            this.id = data.id || Date.now() + Math.random();
            this.studentName = data.studentName || 'Неизвестный';
            this.testName = data.testName || 'Неизвестный тест';
            this.score = parseInt(data.score) || 0;
            this.totalQuestions = parseInt(data.totalQuestions) || 20;
            this.timeSpent = data.timeSpent || '0:00';
            this.date = data.date || new Date().toISOString();
        } else {
            // Новый корректный формат
            this.id = Date.now() + Math.random();
            this.studentName = studentName || 'Неизвестный';
            this.testName = testName || 'Неизвестный тест';
            this.score = parseInt(score) || 0;
            this.totalQuestions = parseInt(totalQuestions) || 20;
            this.timeSpent = timeSpent || '0:00';
            this.date = date || new Date().toISOString();
        }
        
        this.percentage = Math.round((this.score / this.totalQuestions) * 100);
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
    
    toJSON() {
        return {
            id: this.id,
            studentName: this.studentName,
            testName: this.testName,
            score: this.score,
            totalQuestions: this.totalQuestions,
            timeSpent: this.timeSpent,
            date: this.date,
            percentage: this.percentage
        };
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
// ===== УПРАВЛЕНИЕ ТЕСТАМИ =====
class TestsManager {
    constructor() {
        this.tests = [];
        this.filteredTests = [];
        this.currentTestsPage = 1;
        this.testsPageSize = 10;
        this.testsFilters = {
            search: '',
            category: 'all',
            status: 'all'
        };
        
        this.initTestsManager();
    }
    
    initTestsManager() {
        this.loadTests();
        this.bindTestsEvents();
    }
    
    loadTests() {
        // Загружаем тесты из localStorage
        const teacherTests = JSON.parse(localStorage.getItem('teacherTests') || '[]');
        const availableTests = JSON.parse(localStorage.getItem('availableTests') || '[]');
        
        // Объединяем данные
        this.tests = teacherTests.map(teacherTest => {
            const hubTest = availableTests.find(t => t.id === teacherTest.id);
            
            // Получаем статистику прохождений для этого теста
            const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
            const testAttempts = testResults.filter(r => r.testName === teacherTest.title);
            const totalAttempts = testAttempts.length;
            const avgScore = totalAttempts > 0 ? 
                (testAttempts.reduce((sum, r) => sum + (r.percentage || 0), 0) / totalAttempts).toFixed(1) : 0;
            
            return {
                id: teacherTest.id,
                title: teacherTest.title,
                description: teacherTest.description,
                category: teacherTest.category,
                questions: teacherTest.questions ? teacherTest.questions.length : 0,
                time: teacherTest.time,
                level: teacherTest.level,
                status: teacherTest.draft ? 'draft' : 'active',
                created: teacherTest.created,
                modified: teacherTest.modified,
                totalAttempts: totalAttempts,
                avgScore: parseFloat(avgScore),
                filename: hubTest ? hubTest.filename : `test_${teacherTest.id}.html`
            };
        });
        
        // Добавляем фиксированные тесты, если их нет в списке
        const fixedTests = [
            {
                id: 1,
                title: 'Глаголы: Presente',
                description: 'Проверь знание правильных и неправильных глаголов',
                category: 'grammar',
                questions: 20,
                time: 15,
                level: 'intermediate',
                status: 'active',
                created: new Date().toISOString(),
                totalAttempts: this.getTestAttemptsCount('Глаголы: Presente'),
                avgScore: this.getTestAvgScore('Глаголы: Presente'),
                filename: 'test_presente.html'
            },
            {
                id: 2,
                title: 'Лексика: Comida',
                description: 'Испанская лексика по теме еды и напитков',
                category: 'vocabulary',
                questions: 20,
                time: 15,
                level: 'intermediate',
                status: 'active',
                created: new Date().toISOString(),
                totalAttempts: this.getTestAttemptsCount('Лексика: Comida'),
                avgScore: this.getTestAvgScore('Лексика: Comida'),
                filename: 'test_comida.html'
            }
        ];
        
        fixedTests.forEach(fixedTest => {
            if (!this.tests.some(t => t.id === fixedTest.id)) {
                this.tests.push(fixedTest);
            }
        });
        
        this.applyTestsFilters();
        this.updateTestsStats();
        this.renderTestsTable();
    }
    
    getTestAttemptsCount(testName) {
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        return results.filter(r => r.testName === testName).length;
    }
    
    getTestAvgScore(testName) {
        const results = JSON.parse(localStorage.getItem('testResults') || '[]');
        const testResults = results.filter(r => r.testName === testName);
        if (testResults.length === 0) return 0;
        
        const avg = testResults.reduce((sum, r) => sum + (r.percentage || 0), 0) / testResults.length;
        return parseFloat(avg.toFixed(1));
    }
    
    applyTestsFilters() {
        let filtered = [...this.tests];
        
        // Фильтр по поиску
        if (this.testsFilters.search) {
            const searchLower = this.testsFilters.search.toLowerCase();
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(searchLower) ||
                t.description.toLowerCase().includes(searchLower)
            );
        }
        
        // Фильтр по категории
        if (this.testsFilters.category !== 'all') {
            filtered = filtered.filter(t => t.category === this.testsFilters.category);
        }
        
        // Фильтр по статусу
        if (this.testsFilters.status !== 'all') {
            filtered = filtered.filter(t => t.status === this.testsFilters.status);
        }
        
        this.filteredTests = filtered;
        this.currentTestsPage = 1;
    }
    
    updateTestsStats() {
        const totalTests = this.tests.length;
        const activeTests = this.tests.filter(t => t.status === 'active').length;
        const totalAttempts = this.tests.reduce((sum, t) => sum + t.totalAttempts, 0);
        const avgScore = totalAttempts > 0 ? 
            (this.tests.reduce((sum, t) => sum + (t.avgScore * t.totalAttempts), 0) / totalAttempts).toFixed(1) : 0;
        
        document.getElementById('totalTestsCount').textContent = totalTests;
        document.getElementById('activeTestsCount').textContent = activeTests;
        document.getElementById('totalAttemptsCount').textContent = totalAttempts;
        document.getElementById('avgTestScore').textContent = avgScore;
    }
    
    renderTestsTable() {
        const tableBody = document.getElementById('testsTableBody');
        if (!tableBody) return;
        
        const startIndex = (this.currentTestsPage - 1) * this.testsPageSize;
        const endIndex = Math.min(startIndex + this.testsPageSize, this.filteredTests.length);
        const pageTests = this.filteredTests.slice(startIndex, endIndex);
        
        if (pageTests.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="11" style="text-align: center; padding: 40px; color: #666;">
                        <i class="fas fa-search" style="font-size: 2em; margin-bottom: 10px; display: block;"></i>
                        Тесты не найдены
                    </td>
                </tr>
            `;
        } else {
            tableBody.innerHTML = pageTests.map(test => `
                <tr>
                    <td>${test.id}</td>
                    <td>
                        <strong>${test.title}</strong>
                        <p style="font-size: 0.9em; color: #666; margin-top: 5px;">${test.description}</p>
                    </td>
                    <td>
                        <span class="category-badge category-${test.category}">
                            ${this.getCategoryName(test.category)}
                        </span>
                    </td>
                    <td>${test.questions}</td>
                    <td>${test.time} мин</td>
                    <td>${this.getLevelName(test.level)}</td>
                    <td>${test.totalAttempts}</td>
                    <td>
                        <span class="${test.avgScore >= 70 ? 'result-excellent' : test.avgScore >= 50 ? 'result-good' : 'result-poor'}">
                            ${test.avgScore}%
                        </span>
                    </td>
                    <td>
                        <span class="status-badge status-${test.status}">
                            ${this.getStatusName(test.status)}
                        </span>
                    </td>
                    <td>${new Date(test.created).toLocaleDateString('ru-RU')}</td>
                    <td>
                        <div class="test-actions">
                            <button class="test-action-btn edit" onclick="testsManager.editTest(${test.id})" title="Редактировать">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="test-action-btn stats" onclick="testsManager.viewTestStats(${test.id})" title="Статистика">
                                <i class="fas fa-chart-bar"></i>
                            </button>
                            <button class="test-action-btn duplicate" onclick="testsManager.duplicateTest(${test.id})" title="Дублировать">
                                <i class="fas fa-copy"></i>
                            </button>
                            ${test.id > 2 ? `
                                <button class="test-action-btn delete" onclick="testsManager.deleteTest(${test.id})" title="Удалить">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        
        this.updateTestsPagination();
    }
    
    updateTestsPagination() {
        const totalPages = Math.ceil(this.filteredTests.length / this.testsPageSize);
        
        document.getElementById('testsShownCount').textContent = 
            Math.min((this.currentTestsPage - 1) * this.testsPageSize + 1, this.filteredTests.length) + 
            ' - ' + 
            Math.min(this.currentTestsPage * this.testsPageSize, this.filteredTests.length);
        
        document.getElementById('testsTotalCount').textContent = this.filteredTests.length;
    }
    
    getCategoryName(category) {
        const categories = {
            'grammar': 'Грамматика',
            'vocabulary': 'Лексика',
            'listening': 'Аудирование',
            'reading': 'Чтение',
            'culture': 'Культура'
        };
        return categories[category] || category;
    }
    
    getLevelName(level) {
        const levels = {
            'beginner': 'Начальный',
            'intermediate': 'Средний',
            'advanced': 'Продвинутый'
        };
        return levels[level] || level;
    }
    
    getStatusName(status) {
        const statuses = {
            'active': 'Активный',
            'draft': 'Черновик',
            'archived': 'Архив'
        };
        return statuses[status] || status;
    }
    
    bindTestsEvents() {
        const searchInput = document.getElementById('searchTestsInput');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.testsFilters.search = e.target.value;
                    this.applyTestsFilters();
                    this.renderTestsTable();
                }, 300);
            });
        }
        
        const categoryFilter = document.getElementById('filterCategory');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.testsFilters.category = e.target.value;
                this.applyTestsFilters();
                this.renderTestsTable();
            });
        }
        
        const statusFilter = document.getElementById('filterStatus');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.testsFilters.status = e.target.value;
                this.applyTestsFilters();
                this.renderTestsTable();
            });
        }
    }
    
    editTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            // Открываем конструктор тестов в новой вкладке
            window.open('admin_create_test.html', '_blank');
            
            // Можно передать ID теста через localStorage
            localStorage.setItem('editTestId', testId);
        }
    }
    
    viewTestStats(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            alert(`Статистика теста: ${test.title}\n\n` +
                  `Всего прохождений: ${test.totalAttempts}\n` +
                  `Средний балл: ${test.avgScore}%\n` +
                  `Вопросов: ${test.questions}\n` +
                  `Время: ${test.time} минут\n` +
                  `Уровень: ${this.getLevelName(test.level)}\n` +
                  `Статус: ${this.getStatusName(test.status)}`);
        }
    }
    
    duplicateTest(testId) {
        const test = this.tests.find(t => t.id === testId);
        if (test) {
            const newTest = {
                ...test,
                id: Date.now(),
                title: `${test.title} (копия)`,
                created: new Date().toISOString(),
                modified: new Date().toISOString(),
                totalAttempts: 0,
                avgScore: 0
            };
            
            // Загружаем полные данные теста
            const teacherTests = JSON.parse(localStorage.getItem('teacherTests') || '[]');
            const originalTest = teacherTests.find(t => t.id === testId);
            
            if (originalTest) {
                const newTeacherTest = {
                    ...originalTest,
                    id: newTest.id,
                    title: newTest.title,
                    created: newTest.created,
                    modified: newTest.modified,
                    draft: true
                };
                
                teacherTests.push(newTeacherTest);
                localStorage.setItem('teacherTests', JSON.stringify(teacherTests));
                
                // Обновляем хаб
                const availableTests = JSON.parse(localStorage.getItem('availableTests') || '[]');
                const newHubTest = {
                    id: newTest.id,
                    title: newTest.title,
                    description: newTest.description,
                    category: newTest.category,
                    time: newTest.time,
                    questions: newTest.questions,
                    level: newTest.level,
                    icon: 'language',
                    filename: `test_${newTest.id}.html`
                };
                
                availableTests.push(newHubTest);
                localStorage.setItem('availableTests', JSON.stringify(availableTests));
                
                this.loadTests();
                alert(`Тест "${test.title}" скопирован как "${newTest.title}"`);
            }
        }
    }
    
    deleteTest(testId) {
        if (testId <= 2) {
            alert('Фиксированные тесты нельзя удалить');
            return;
        }
        
        if (confirm('Удалить этот тест? Все связанные данные будут потеряны.')) {
            // Удаляем из teacherTests
            let teacherTests = JSON.parse(localStorage.getItem('teacherTests') || '[]');
            teacherTests = teacherTests.filter(t => t.id !== testId);
            localStorage.setItem('teacherTests', JSON.stringify(teacherTests));
            
            // Удаляем из availableTests
            let availableTests = JSON.parse(localStorage.getItem('availableTests') || '[]');
            availableTests = availableTests.filter(t => t.id !== testId);
            localStorage.setItem('availableTests', JSON.stringify(availableTests));
            
            // Перезагружаем список
            this.loadTests();
            alert('Тест удален');
        }
    }
    
    applyBulkAction() {
        const action = document.getElementById('bulkAction').value;
        if (!action) {
            alert('Выберите действие');
            return;
        }
        
        // В реальном приложении здесь была бы обработка выбранных тестов
        alert(`Групповое действие "${action}" будет применено к выбранным тестам`);
    }
    
    exportAllTests() {
        const teacherTests = JSON.parse(localStorage.getItem('teacherTests') || '[]');
        const dataStr = JSON.stringify(teacherTests, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_tests_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    importTests() {
        alert('Функция импорта тестов будет реализована в следующей версии');
    }
    
    generateTestReport() {
        let report = `ОТЧЕТ ПО ТЕСТАМ\n`;
        report += `Дата: ${new Date().toLocaleDateString('ru-RU')}\n`;
        report += `Всего тестов: ${this.tests.length}\n`;
        report += `Активных тестов: ${this.tests.filter(t => t.status === 'active').length}\n`;
        report += `Всего прохождений: ${this.tests.reduce((sum, t) => sum + t.totalAttempts, 0)}\n\n`;
        
        this.tests.forEach(test => {
            report += `${test.title}\n`;
            report += `  Категория: ${this.getCategoryName(test.category)}\n`;
            report += `  Прохождения: ${test.totalAttempts}\n`;
            report += `  Средний балл: ${test.avgScore}%\n`;
            report += `  Статус: ${this.getStatusName(test.status)}\n\n`;
        });
        
        alert(report);
    }
}

// Глобальный экземпляр менеджера тестов
let testsManager;

// Навигация между разделами
function showTestsManagement() {
    // Скрываем текущие разделы
    document.querySelector('.stats-cards').style.display = 'none';
    document.querySelector('.results-table-container').style.display = 'none';
    document.querySelector('.charts-section').style.display = 'none';
    
    // Показываем управление тестами
    document.getElementById('testsManagementSection').style.display = 'block';
    
    // Обновляем активный пункт меню
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    document.querySelector('#manageTests').parentElement.classList.add('active');
    
    // Инициализируем менеджер тестов при первом открытии
    if (!testsManager) {
        testsManager = new TestsManager();
    }
}

function showCreateTest() {
    window.open('admin_create_test.html', '_blank');
}

function refreshTestsList() {
    if (testsManager) {
        testsManager.loadTests();
        alert('Список тестов обновлен');
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Добавляем обработчики для навигации
    document.getElementById('manageTests').addEventListener('click', (e) => {
        e.preventDefault();
        showTestsManagement();
    });
    
    document.getElementById('createTestBtn').addEventListener('click', (e) => {
        e.preventDefault();
        showCreateTest();
    });
    
    document.getElementById('viewStatistics').addEventListener('click', (e) => {
        e.preventDefault();
        showResults(); // Возвращаемся к результатам
    });
    
    function showResults() {
        // Показываем результаты тестов
        document.querySelector('.stats-cards').style.display = 'grid';
        document.querySelector('.results-table-container').style.display = 'block';
        document.querySelector('.charts-section').style.display = 'grid';
        
        // Скрываем управление тестами
        document.getElementById('testsManagementSection').style.display = 'none';
        
        // Обновляем активный пункт меню
        document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
        document.querySelector('.sidebar-menu li:first-child').classList.add('active');
    }
    
    // Глобальные функции для кнопок
    window.refreshTestsList = refreshTestsList;
    window.duplicateTest = () => {
        if (testsManager) {
            const testId = prompt('Введите ID теста для копирования:');
            if (testId) {
                testsManager.duplicateTest(parseInt(testId));
            }
        }
    };
    window.exportAllTests = () => {
        if (testsManager) {
            testsManager.exportAllTests();
        }
    };
    window.importTests = () => {
        if (testsManager) {
            testsManager.importTests();
        }
    };
    window.generateTestReport = () => {
        if (testsManager) {
            testsManager.generateTestReport();
        }
    };
    window.applyBulkAction = () => {
        if (testsManager) {
            testsManager.applyBulkAction();
        }
    };
    
    // Глобальный доступ к менеджеру тестов
    window.testsManager = testsManager;
});
