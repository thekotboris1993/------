class TestConstructor {
    constructor() {
        this.questions = [];
        this.currentQuestionId = 1;
        this.testData = {
            id: Date.now(),
            title: '',
            description: '',
            category: 'grammar',
            time: 15,
            totalQuestions: 20,
            level: 'intermediate',
            questions: []
        };
        
        this.init();
    }
    
    init() {
        this.loadFromLocalStorage();
        this.bindEvents();
        this.updateStats();
    }
    
    bindEvents() {
        // Автосохранение при изменении полей
        document.getElementById('testTitle').addEventListener('input', () => this.autoSave());
        document.getElementById('testDescription').addEventListener('input', () => this.autoSave());
        document.getElementById('testCategory').addEventListener('change', () => this.autoSave());
        document.getElementById('testTime').addEventListener('input', () => this.autoSave());
        document.getElementById('testQuestions').addEventListener('input', () => this.autoSave());
        document.getElementById('testLevel').addEventListener('change', () => this.autoSave());
    }
    
    addQuestion(type) {
        const questionId = this.currentQuestionId++;
        
        const question = {
            id: questionId,
            type: type,
            question: '',
            hint: '',
            options: type === 'choice' || type === 'multiple' ? [
                { text: '', correct: type === 'choice' ? true : false }
            ] : [],
            answer: type === 'input' ? '' : null,
            correct: type === 'choice' ? 0 : null
        };
        
        this.questions.push(question);
        this.renderQuestion(question);
        this.updateEmptyState();
        this.updateStats();
        this.autoSave();
        
        return question;
    }
    
    renderQuestion(question) {
        const questionsList = document.getElementById('questionsList');
        const emptyState = document.getElementById('emptyState');
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.dataset.id = question.id;
        questionCard.draggable = true;
        
        let optionsHtml = '';
        let answerField = '';
        
        // Генерация HTML в зависимости от типа вопроса
        switch(question.type) {
            case 'choice':
                optionsHtml = this.renderChoiceOptions(question);
                break;
            case 'input':
                answerField = `
                    <div class="form-group">
                        <label>Правильный ответ:</label>
                        <input type="text" class="correct-answer" 
                               value="${question.answer || ''}" 
                               placeholder="Введите правильный ответ..."
                               oninput="testConstructor.updateQuestion(${question.id}, 'answer', this.value)">
                    </div>
                `;
                break;
            case 'multiple':
                optionsHtml = this.renderMultipleOptions(question);
                break;
            case 'matching':
                optionsHtml = this.renderMatchingOptions(question);
                break;
        }
        
        questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-number">
                    <span class="badge">Вопрос ${question.id}</span>
                    <span class="question-type">
                        <i class="fas fa-${this.getQuestionIcon(question.type)}"></i>
                        ${this.getQuestionTypeName(question.type)}
                    </span>
                </div>
                <div class="question-actions">
                    <button class="action-icon move" title="Переместить">
                        <i class="fas fa-arrows-alt"></i>
                    </button>
                    <button class="action-icon delete" onclick="testConstructor.deleteQuestion(${question.id})" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="question-content">
                <div class="form-group question-text">
                    <label>Текст вопроса:</label>
                    <textarea placeholder="Введите текст вопроса..." 
                              oninput="testConstructor.updateQuestion(${question.id}, 'question', this.value)">${question.question || ''}</textarea>
                </div>
                
                <div class="form-group question-hint">
                    <label>Подсказка (необязательно):</label>
                    <textarea placeholder="Подсказка для студента..." 
                              oninput="testConstructor.updateQuestion(${question.id}, 'hint', this.value)">${question.hint || ''}</textarea>
                </div>
                
                ${optionsHtml}
                ${answerField}
            </div>
        `;
        
        questionsList.appendChild(questionCard);
        
        // Добавляем обработчики для опций
        if (question.type === 'choice' || question.type === 'multiple') {
            this.bindOptionEvents(question.id);
        }
    }
    
    renderChoiceOptions(question) {
        let optionsHtml = `
            <div class="options-section">
                <div class="options-header">
                    <h4><i class="fas fa-list-ul"></i> Варианты ответов</h4>
                    <button class="add-option" onclick="testConstructor.addOption(${question.id})">
                        <i class="fas fa-plus"></i> Добавить вариант
                    </button>
                </div>
        `;
        
        question.options.forEach((option, index) => {
            optionsHtml += `
                <div class="option-item">
                    <input type="radio" name="correct-${question.id}" 
                           ${option.correct ? 'checked' : ''}
                           onchange="testConstructor.setCorrectAnswer(${question.id}, ${index})">
                    <input type="text" class="option-text" 
                           value="${option.text || ''}"
                           placeholder="Вариант ответа ${index + 1}"
                           oninput="testConstructor.updateOption(${question.id}, ${index}, 'text', this.value)">
                    <div class="option-actions">
                        <button class="action-icon delete" onclick="testConstructor.removeOption(${question.id}, ${index})" title="Удалить">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        optionsHtml += '</div>';
        return optionsHtml;
    }
    
    renderMultipleOptions(question) {
        let optionsHtml = `
            <div class="options-section">
                <div class="options-header">
                    <h4><i class="fas fa-check-square"></i> Варианты ответов (можно выбрать несколько)</h4>
                    <button class="add-option" onclick="testConstructor.addOption(${question.id})">
                        <i class="fas fa-plus"></i> Добавить вариант
                    </button>
                </div>
        `;
        
        question.options.forEach((option, index) => {
            optionsHtml += `
                <div class="option-item">
                    <input type="checkbox" 
                           ${option.correct ? 'checked' : ''}
                           onchange="testConstructor.toggleOptionCorrect(${question.id}, ${index}, this.checked)">
                    <input type="text" class="option-text" 
                           value="${option.text || ''}"
                           placeholder="Вариант ответа ${index + 1}"
                           oninput="testConstructor.updateOption(${question.id}, ${index}, 'text', this.value)">
                    <div class="option-actions">
                        <button class="action-icon delete" onclick="testConstructor.removeOption(${question.id}, ${index})" title="Удалить">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        optionsHtml += '</div>';
        return optionsHtml;
    }
    
    renderMatchingOptions(question) {
        if (!question.options.pairs) {
            question.options.pairs = [{ left: '', right: '' }];
        }
        
        let optionsHtml = `
            <div class="options-section">
                <div class="options-header">
                    <h4><i class="fas fa-random"></i> Пары для соответствия</h4>
                    <button class="add-option" onclick="testConstructor.addMatchingPair(${question.id})">
                        <i class="fas fa-plus"></i> Добавить пару
                    </button>
                </div>
        `;
        
        question.options.pairs.forEach((pair, index) => {
            optionsHtml += `
                <div class="option-item" style="flex-wrap: wrap; gap: 10px;">
                    <div style="flex: 1;">
                        <input type="text" class="pair-left" 
                               value="${pair.left || ''}"
                               placeholder="Левая часть пары"
                               oninput="testConstructor.updateMatchingPair(${question.id}, ${index}, 'left', this.value)">
                    </div>
                    <div style="display: flex; align-items: center;">
                        <i class="fas fa-arrow-right"></i>
                    </div>
                    <div style="flex: 1;">
                        <input type="text" class="pair-right" 
                               value="${pair.right || ''}"
                               placeholder="Правая часть пары"
                               oninput="testConstructor.updateMatchingPair(${question.id}, ${index}, 'right', this.value)">
                    </div>
                    <div class="option-actions">
                        <button class="action-icon delete" onclick="testConstructor.removeMatchingPair(${question.id}, ${index})" title="Удалить">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        optionsHtml += '</div>';
        return optionsHtml;
    }
    
    bindOptionEvents(questionId) {
        // Обработчики добавляются через HTML-атрибуты
    }
    
    updateQuestion(questionId, field, value) {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question[field] = value;
            this.autoSave();
        }
    }
    
    updateOption(questionId, optionIndex, field, value) {
        const question = this.questions.find(q => q.id === questionId);
        if (question && question.options[optionIndex]) {
            question.options[optionIndex][field] = value;
            this.autoSave();
        }
    }
    
    addOption(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (question) {
            question.options.push({ text: '', correct: false });
            this.renderQuestionsList();
            this.autoSave();
        }
    }
    
    removeOption(questionId, optionIndex) {
        const question = this.questions.find(q => q.id === questionId);
        if (question && question.options.length > 1) {
            question.options.splice(optionIndex, 1);
            this.renderQuestionsList();
            this.autoSave();
        }
    }
    
    setCorrectAnswer(questionId, optionIndex) {
        const question = this.questions.find(q => q.id === questionId);
        if (question && question.type === 'choice') {
            question.options.forEach((option, index) => {
                option.correct = index === optionIndex;
            });
            question.correct = optionIndex;
            this.renderQuestionsList();
            this.autoSave();
        }
    }
    
    toggleOptionCorrect(questionId, optionIndex, isCorrect) {
        const question = this.questions.find(q => q.id === questionId);
        if (question && question.type === 'multiple') {
            if (question.options[optionIndex]) {
                question.options[optionIndex].correct = isCorrect;
                this.autoSave();
            }
        }
    }
    
    addMatchingPair(questionId) {
        const question = this.questions.find(q => q.id === questionId);
        if (question && question.type === 'matching') {
            if (!question.options.pairs) {
                question.options.pairs = [];
            }
            question.options.pairs.push({ left: '', right: '' });
            this.renderQuestionsList();
            this.autoSave();
        }
    }
    
    updateMatchingPair(questionId, pairIndex, field, value) {
        const question = this.questions.find(q => q.id === questionId);
        if (question && question.type === 'matching' && question.options.pairs[pairIndex]) {
            question.options.pairs[pairIndex][field] = value;
            this.autoSave();
        }
    }
    
    removeMatchingPair(questionId, pairIndex) {
        const question = this.questions.find(q => q.id === questionId);
        if (question && question.type === 'matching' && question.options.pairs.length > 1) {
            question.options.pairs.splice(pairIndex, 1);
            this.renderQuestionsList();
            this.autoSave();
        }
    }
    
    deleteQuestion(questionId) {
        if (confirm('Удалить этот вопрос?')) {
            this.questions = this.questions.filter(q => q.id !== questionId);
            this.renderQuestionsList();
            this.updateStats();
            this.autoSave();
        }
    }
    
    renderQuestionsList() {
        const questionsList = document.getElementById('questionsList');
        const emptyState = document.getElementById('emptyState');
        
        questionsList.innerHTML = '';
        
        if (this.questions.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else {
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            this.questions.forEach(question => {
                this.renderQuestion(question);
            });
        }
    }
    
    updateEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const questionsList = document.getElementById('questionsList');
        
        if (this.questions.length === 0 && emptyState) {
            emptyState.style.display = 'block';
        } else if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    updateStats() {
        document.getElementById('totalQuestionsCount').textContent = this.questions.length;
        
        const estimatedTime = Math.ceil(this.questions.length * 0.75); // ~45 секунд на вопрос
        document.getElementById('estimatedTime').textContent = `${estimatedTime} мин`;
    }
    
    getQuestionIcon(type) {
        const icons = {
            'choice': 'dot-circle',
            'input': 'keyboard',
            'multiple': 'check-square',
            'matching': 'random'
        };
        return icons[type] || 'question-circle';
    }
    
    getQuestionTypeName(type) {
        const names = {
            'choice': 'Выбор ответа',
            'input': 'Ввод ответа',
            'multiple': 'Несколько ответов',
            'matching': 'Соответствие'
        };
        return names[type] || 'Неизвестный тип';
    }
    
    saveTest() {
        this.collectTestData();
        
        if (!this.validateTest()) {
            return;
        }
        
        // Сохраняем тест в localStorage
        const savedTests = JSON.parse(localStorage.getItem('teacherTests') || '[]');
        const existingIndex = savedTests.findIndex(test => test.id === this.testData.id);
        
        if (existingIndex !== -1) {
            savedTests[existingIndex] = this.testData;
        } else {
            savedTests.push(this.testData);
        }
        
        localStorage.setItem('teacherTests', JSON.stringify(savedTests));
        
        // Обновляем хаб тестов
        this.updateTestsHub();
        
        alert(`Тест "${this.testData.title}" успешно сохранен!`);
        
        // Предлагаем создать HTML-страницу теста
        if (confirm('Создать HTML-страницу для этого теста?')) {
            this.generateTestPage();
        }
    }
    
    collectTestData() {
        this.testData = {
            id: this.testData.id || Date.now(),
            title: document.getElementById('testTitle').value,
            description: document.getElementById('testDescription').value,
            category: document.getElementById('testCategory').value,
            time: parseInt(document.getElementById('testTime').value),
            totalQuestions: parseInt(document.getElementById('testQuestions').value),
            level: document.getElementById('testLevel').value,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            questions: this.questions.map(q => ({
                type: q.type,
                question: q.question,
                hint: q.hint,
                options: q.options,
                answer: q.answer,
                correct: q.correct
            }))
        };
    }
    
    validateTest() {
        if (!this.testData.title.trim()) {
            alert('Введите название теста');
            document.getElementById('testTitle').focus();
            return false;
        }
        
        if (this.questions.length === 0) {
            alert('Добавьте хотя бы один вопрос');
            return false;
        }
        
        // Проверяем каждый вопрос
        for (const question of this.questions) {
            if (!question.question.trim()) {
                alert(`Вопрос #${question.id}: введите текст вопроса`);
                return false;
            }
            
            if (question.type === 'choice') {
                const hasCorrect = question.options.some(opt => opt.correct);
                if (!hasCorrect) {
                    alert(`Вопрос #${question.id}: выберите правильный вариант ответа`);
                    return false;
                }
                
                const hasEmptyOptions = question.options.some(opt => !opt.text.trim());
                if (hasEmptyOptions) {
                    alert(`Вопрос #${question.id}: заполните все варианты ответов`);
                    return false;
                }
            }
            
            if (question.type === 'input' && !question.answer.trim()) {
                alert(`Вопрос #${question.id}: введите правильный ответ`);
                return false;
            }
        }
        
        return true;
    }
    
    updateTestsHub() {
        // Обновляем localStorage с информацией о тестах для хаба
        const testsForHub = JSON.parse(localStorage.getItem('availableTests') || '[]');
        const existingIndex = testsForHub.findIndex(test => test.id === this.testData.id);
        
        const hubTest = {
            id: this.testData.id,
            title: this.testData.title,
            description: this.testData.description,
            category: this.testData.category,
            time: this.testData.time,
            questions: this.testData.questions.length,
            level: this.testData.level,
            icon: this.getTestIcon(this.testData.category),
            filename: `test_${this.testData.id}.html`
        };
        
        if (existingIndex !== -1) {
            testsForHub[existingIndex] = hubTest;
        } else {
            testsForHub.push(hubTest);
        }
        
        localStorage.setItem('availableTests', JSON.stringify(testsForHub));
    }
    
    getTestIcon(category) {
        const icons = {
            'grammar': 'language',
            'vocabulary': 'utensils',
            'listening': 'headphones',
            'reading': 'book',
            'culture': 'globe'
        };
        return icons[category] || 'question-circle';
    }
    
    generateTestPage() {
        // Генерируем HTML-страницу теста на основе шаблона
        const testHtml = this.createTestHtml();
        const filename = `test_${this.testData.id}.html`;
        
        // Создаем blob и скачиваем файл
        const blob = new Blob([testHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`HTML-файл теста сохранен как ${filename}\nЗагрузите его на сервер рядом с другими файлами тестов.`);
    }
    
    createTestHtml() {
        // Шаблон HTML для теста (упрощенная версия)
        return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.testData.title}</title>
    <link rel="stylesheet" href="test_template.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <div class="test-container" id="testContainer">
            <!-- Тест будет загружен динамически из localStorage -->
        </div>
    </div>
    
    <script>
        const testData = ${JSON.stringify(this.testData, null, 2)};
        
        // Загружаем тест из localStorage (если есть более свежая версия)
        const savedTest = localStorage.getItem('test_' + testData.id);
        if (savedTest) {
            try {
                const parsed = JSON.parse(savedTest);
                if (new Date(parsed.modified) > new Date(testData.modified)) {
                    testData = parsed;
                }
            } catch(e) {
                console.log('Используем встроенные данные теста');
            }
        }
        
        // Здесь будет код для отображения теста
        // (можно использовать существующий код из test_presente.js)
        
        console.log('Тест загружен:', testData);
        document.getElementById('testContainer').innerHTML = 
            '<h1>' + testData.title + '</h1>' +
            '<p>' + testData.description + '</p>' +
            '<p>Вопросов: ' + testData.questions.length + '</p>' +
            '<button onclick="startTest()">Начать тест</button>';
    </script>
</body>
</html>`;
    }
    
    previewTest() {
        this.collectTestData();
        
        if (this.questions.length === 0) {
            alert('Добавьте вопросы для предпросмотра');
            return;
        }
        
        const previewContent = document.getElementById('previewContent');
        const previewContainer = document.getElementById('previewContainer');
        
        let previewHtml = `
            <div class="preview-test">
                <h2>${this.testData.title || 'Без названия'}</h2>
                <p class="preview-description">${this.testData.description || 'Без описания'}</p>
                
                <div class="preview-meta">
                    <span><i class="fas fa-clock"></i> ${this.testData.time} мин</span>
                    <span><i class="fas fa-question-circle"></i> ${this.questions.length} вопросов</span>
                    <span><i class="fas fa-signal"></i> ${this.getLevelName(this.testData.level)}</span>
                </div>
                
                <div class="preview-questions">
        `;
        
        this.questions.forEach((question, index) => {
            previewHtml += `
                <div class="preview-question">
                    <h4>Вопрос ${index + 1}: ${this.getQuestionTypeName(question.type)}</h4>
                    <p><strong>${question.question || 'Текст вопроса не заполнен'}</strong></p>
                    ${question.hint ? `<p class="preview-hint"><i>Подсказка:</i> ${question.hint}</p>` : ''}
            `;
            
            if (question.type === 'choice' || question.type === 'multiple') {
                previewHtml += `<div class="preview-options">`;
                question.options.forEach((option, optIndex) => {
                    const isCorrect = option.correct ? ' ✓' : '';
                    previewHtml += `
                        <div class="preview-option ${option.correct ? 'correct' : ''}">
                            ${option.text || `Вариант ${optIndex + 1}`}${isCorrect}
                        </div>
                    `;
                });
                previewHtml += `</div>`;
            } else if (question.type === 'input') {
                previewHtml += `
                    <div class="preview-input">
                        <p><strong>Правильный ответ:</strong> ${question.answer || 'Не указан'}</p>
                    </div>
                `;
            } else if (question.type === 'matching') {
                previewHtml += `<div class="preview-matching">`;
                (question.options.pairs || []).forEach((pair, pairIndex) => {
                    previewHtml += `
                        <div class="preview-pair">
                            ${pair.left || 'Левая часть'} → ${pair.right || 'Правая часть'}
                        </div>
                    `;
                });
                previewHtml += `</div>`;
            }
            
            previewHtml += `</div>`;
        });
        
        previewHtml += `
                </div>
            </div>
        `;
        
        previewContent.innerHTML = previewHtml;
        previewContainer.style.display = 'flex';
    }
    
    getLevelName(level) {
        const levels = {
            'beginner': 'Начальный',
            'intermediate': 'Средний',
            'advanced': 'Продвинутый'
        };
        return levels[level] || level;
    }
    
    closePreview() {
        document.getElementById('previewContainer').style.display = 'none';
    }
    
    exportTest() {
        this.collectTestData();
        const exportModal = document.getElementById('exportModal');
        const exportPreview = document.getElementById('exportPreview');
        
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        
        let exportData;
        switch(format) {
            case 'json':
                exportData = JSON.stringify(this.testData, null, 2);
                break;
            case 'html':
                exportData = this.createTestHtml();
                break;
            case 'text':
                exportData = this.createTextExport();
                break;
        }
        
        exportPreview.textContent = exportData;
        exportModal.style.display = 'flex';
    }
    
    createTextExport() {
        let text = `ТЕСТ: ${this.testData.title}\n`;
        text += `Описание: ${this.testData.description}\n`;
        text += `Категория: ${this.testData.category}\n`;
        text += `Время: ${this.testData.time} минут\n`;
        text += `Уровень: ${this.getLevelName(this.testData.level)}\n\n`;
        text += `ВОПРОСЫ (${this.questions.length}):\n\n`;
        
        this.questions.forEach((q, index) => {
            text += `${index + 1}. [${this.getQuestionTypeName(q.type)}] ${q.question}\n`;
            if (q.hint) text += `   Подсказка: ${q.hint}\n`;
            
            if (q.type === 'choice' || q.type === 'multiple') {
                q.options.forEach((opt, optIndex) => {
                    text += `   ${optIndex + 1}) ${opt.text} ${opt.correct ? '✓' : ''}\n`;
                });
            } else if (q.type === 'input') {
                text += `   Ответ: ${q.answer}\n`;
            } else if (q.type === 'matching') {
                (q.options.pairs || []).forEach(pair => {
                    text += `   ${pair.left} → ${pair.right}\n`;
                });
            }
            text += '\n';
        });
        
        return text;
    }
    
    closeExportModal() {
        document.getElementById('exportModal').style.display = 'none';
    }
    
    downloadExport() {
        const format = document.querySelector('input[name="exportFormat"]:checked').value;
        const exportPreview = document.getElementById('exportPreview').textContent;
        
        const extensions = {
            'json': 'json',
            'html': 'html',
            'text': 'txt'
        };
        
        const extension = extensions[format];
        const filename = `test_${this.testData.id}_${Date.now()}.${extension}`;
        
        const blob = new Blob([exportPreview], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Файл ${filename} скачан`);
        this.closeExportModal();
    }
    
    copyToClipboard() {
        const exportPreview = document.getElementById('exportPreview').textContent;
        navigator.clipboard.writeText(exportPreview)
            .then(() => alert('Данные скопированы в буфер обмена'))
            .catch(err => alert('Ошибка копирования: ' + err));
    }
    
    clearAll() {
        if (confirm('Очистить весь тест? Все вопросы будут удалены.')) {
            this.questions = [];
            this.currentQuestionId = 1;
            this.testData = {
                id: Date.now(),
                title: '',
                description: '',
                category: 'grammar',
                time: 15,
                totalQuestions: 20,
                level: 'intermediate',
                questions: []
            };
            
            // Очищаем поля формы
            document.getElementById('testTitle').value = '';
            document.getElementById('testDescription').value = '';
            document.getElementById('testCategory').value = 'grammar';
            document.getElementById('testTime').value = 15;
            document.getElementById('testQuestions').value = 20;
            document.getElementById('testLevel').value = 'intermediate';
            
            this.renderQuestionsList();
            this.updateStats();
            this.saveToLocalStorage();
        }
    }
    
    autoSave() {
        this.collectTestData();
        this.saveToLocalStorage();
    }
    
    saveToLocalStorage() {
        const draft = {
            ...this.testData,
            questions: this.questions,
            draft: true,
            saved: new Date().toISOString()
        };
        
        localStorage.setItem('testDraft', JSON.stringify(draft));
    }
    
loadFromLocalStorage() {
    // Проверяем, нужно ли загрузить конкретный тест для редактирования
    const editTestId = localStorage.getItem('editTestId');
    if (editTestId) {
        this.loadTestForEditing(editTestId);
        localStorage.removeItem('editTestId'); // Очищаем после загрузки
        return;
    }
    
    // ... существующий код загрузки черновика ...
}

loadTestForEditing(testId) {
    const teacherTests = JSON.parse(localStorage.getItem('teacherTests') || '[]');
    const testToEdit = teacherTests.find(test => test.id === parseInt(testId));
    
    if (testToEdit) {
        // Загружаем данные теста
        document.getElementById('testTitle').value = testToEdit.title;
        document.getElementById('testDescription').value = testToEdit.description;
        document.getElementById('testCategory').value = testToEdit.category;
        document.getElementById('testTime').value = testToEdit.time;
        document.getElementById('testQuestions').value = testToEdit.totalQuestions;
        document.getElementById('testLevel').value = testToEdit.level;
        
        // Загружаем вопросы
        if (testToEdit.questions && Array.isArray(testToEdit.questions)) {
            this.questions = testToEdit.questions.map((q, index) => ({
                id: index + 1,
                ...q
            }));
            this.currentQuestionId = this.questions.length + 1;
            this.renderQuestionsList();
        }
        
        this.testData.id = testToEdit.id;
        
        console.log('Тест загружен для редактирования:', testToEdit.title);
    }
}
    
    importQuestions() {
        alert('Функция импорта будет реализована в следующей версии');
        // Можно импортировать из CSV, JSON или текстового файла
    }
    
    arrangeQuestions() {
        // Сортировка вопросов по ID
        this.questions.sort((a, b) => a.id - b.id);
        this.renderQuestionsList();
    }
    
    togglePreview() {
        // Переключение адаптивного просмотра
        document.body.classList.toggle('mobile-preview');
    }
}

// Инициализация конструктора
let testConstructor;

document.addEventListener('DOMContentLoaded', () => {
    testConstructor = new TestConstructor();
    
    // Глобальные функции для вызова из HTML
    window.testConstructor = testConstructor;
    
    window.addQuestion = (type) => testConstructor.addQuestion(type);
    window.saveTest = () => testConstructor.saveTest();
    window.previewTest = () => testConstructor.previewTest();
    window.exportTest = () => testConstructor.exportTest();
    window.clearAll = () => testConstructor.clearAll();
    window.closePreview = () => testConstructor.closePreview();
    window.closeExportModal = () => testConstructor.closeExportModal();
    window.downloadExport = () => testConstructor.downloadExport();
    window.copyToClipboard = () => testConstructor.copyToClipboard();
    window.importQuestions = () => testConstructor.importQuestions();
    window.arrangeQuestions = () => testConstructor.arrangeQuestions();
    window.togglePreview = () => testConstructor.togglePreview();
});
