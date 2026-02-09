// Данные теста: 20 вопросов по теме Comida (10 с выбором, 10 с вводом)
const testQuestions = [
    // Вопросы с выбором ответа (10 шт)
    {
        type: 'choice',
        question: "Как переводится на испанский 'яблоко'?",
        options: ["manzana", "pera", "naranja", "plátano"],
        correct: 0,
        hint: "Manzana - одно из самых популярных слов для фруктов"
    },
    {
        type: 'choice',
        question: "Выберите правильный перевод слова 'морковь':",
        options: ["cebolla", "zanahoria", "pimiento", "tomate"],
        correct: 1,
        hint: "Zanahoria - овощ оранжевого цвета"
    },
    {
        type: 'choice',
        question: "Как будет 'курица' по-испански?",
        options: ["pavo", "pato", "pollo", "cerdo"],
        correct: 2,
        hint: "Pollo - популярное мясо в испанской кухне"
    },
    {
        type: 'choice',
        question: "Выберите испанское слово для 'сыр':",
        options: ["yogur", "mantequilla", "queso", "leche"],
        correct: 2,
        hint: "Queso - важный продукт испанской гастрономии"
    },
    {
        type: 'choice',
        question: "Как правильно: 'я хочу воды'?",
        options: ["Quiero agua", "Quiero vino", "Quiero jugo", "Quiero café"],
        correct: 0,
        hint: "Agua - вода, одно из самых важных слов"
    },
    {
        type: 'choice',
        question: "Выберите перевод 'хлеб':",
        options: ["arroz", "pasta", "pan", "harina"],
        correct: 2,
        hint: "Pan - основа испанского завтрака"
    },
    {
        type: 'choice',
        question: "Как будет 'обед' по-испански?",
        options: ["desayuno", "almuerzo", "cena", "merienda"],
        correct: 1,
        hint: "Almuerzo - основной прием пищи днем"
    },
    {
        type: 'choice',
        question: "Выберите правильное слово для 'нож':",
        options: ["tenedor", "cuchillo", "cuchara", "plato"],
        correct: 1,
        hint: "Cuchillo - столовый прибор для резки"
    },
    {
        type: 'choice',
        question: "Как переводится 'соленый'?",
        options: ["dulce", "salado", "amargo", "ácido"],
        correct: 1,
        hint: "Salado - противоположность сладкому (dulce)"
    },
    {
        type: 'choice',
        question: "Выберите испанское слово для 'ресторан':",
        options: ["cafetería", "restaurante", "bar", "mercado"],
        correct: 1,
        hint: "Restaurante - место, где подают еду"
    },
    // Вопросы с вводом ответа (10 шт)
    {
        type: 'input',
        question: "Введите испанское слово для 'рис': ______",
        answer: "arroz",
        hint: "Arroz - основа паэльи"
    },
    {
        type: 'input',
        question: "Как будет 'помидор' по-испански? ______",
        answer: "tomate",
        hint: "Tomate - красный овощ для салата"
    },
    {
        type: 'input',
        question: "Введите перевод 'картофель': ______",
        answer: "patata",
        hint: "Patata или papa в Латинской Америке"
    },
    {
        type: 'input',
        question: "Как по-испански 'вино'? ______",
        answer: "vino",
        hint: "Vino - популярный испанский напиток"
    },
    {
        type: 'input',
        question: "Введите испанское слово для 'сахар': ______",
        answer: "azúcar",
        hint: "Azúcar - для сладких блюд"
    },
    {
        type: 'input',
        question: "Как будет 'чай'? ______",
        answer: "té",
        hint: "Té - горячий напиток"
    },
    {
        type: 'input',
        question: "Введите перевод 'сок': ______",
        answer: "jugo",
        hint: "Jugo или zumo в Испании"
    },
    {
        type: 'input',
        question: "Как по-испански 'яйцо'? ______",
        answer: "huevo",
        hint: "Huevo - для завтрака"
    },
    {
        type: 'input',
        question: "Введите испанское слово для 'рыба': ______",
        answer: "pescado",
        hint: "Pescado - важная часть средиземноморской диеты"
    },
    {
        type: 'input',
        question: "Как будет 'соль'? ______",
        answer: "sal",
        hint: "Sal - приправа"
    }
];

// Глобальные переменные состояния теста
let currentStep = 1;
let studentName = "";
let currentQuestionIndex = 0;
let userAnswers = new Array(testQuestions.length).fill(null);
let startTime, endTime;
let timerInterval;

// Элементы DOM
const stepElements = document.querySelectorAll('.step');
const studentNameInput = document.getElementById('studentName');
const startTestBtn = document.getElementById('startTestBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');
const timerElement = document.getElementById('timer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const currentQuestionElement = document.getElementById('currentQuestion');
const questionTextElement = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const hintTextElement = document.getElementById('hintText');

// Функция для переключения шагов
function goToStep(stepNumber) {
    stepElements.forEach(step => {
        step.classList.remove('active-step');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active-step');
    currentStep = stepNumber;
    
    if (stepNumber === 2) {
        initTest();
    } else if (stepNumber === 3) {
        showResults();
    }
}

// Инициализация теста
function initTest() {
    currentQuestionIndex = 0;
    userAnswers.fill(null);
    startTime = new Date();
    startTimer(15 * 60); // 15 минут для 20 вопросов
    shuffleQuestions();
    displayQuestion(currentQuestionIndex);
}

// Перемешивание вопросов
function shuffleQuestions() {
    for (let i = testQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [testQuestions[i], testQuestions[j]] = [testQuestions[j], testQuestions[i]];
    }
}

// Отображение вопроса
function displayQuestion(index) {
    const question = testQuestions[index];
    
    currentQuestionElement.textContent = `Вопрос ${index + 1} из ${testQuestions.length}`;
    questionTextElement.textContent = question.question;
    hintTextElement.textContent = question.hint;
    
    optionsContainer.innerHTML = '';
    
    if (question.type === 'choice') {
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            if (userAnswers[index] === optionIndex) {
                optionElement.classList.add('selected');
            }
            
            optionElement.textContent = option;
            optionElement.dataset.index = optionIndex;
            
            optionElement.addEventListener('click', () => {
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                optionElement.classList.add('selected');
                userAnswers[index] = optionIndex;
                
                if (index < testQuestions.length - 1) {
                    nextBtn.disabled = false;
                }
                updateFinishButton();
            });
            
            optionsContainer.appendChild(optionElement);
        });
    } else if (question.type === 'input') {
        const inputContainer = document.createElement('div');
        inputContainer.className = 'input-answer-container';
        
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.className = 'answer-input';
        inputElement.placeholder = 'Введите испанское слово...';
        
        if (userAnswers[index] !== null) {
            inputElement.value = userAnswers[index];
        }
        
        inputElement.addEventListener('input', () => {
            userAnswers[index] = inputElement.value.trim();
            
            if (index < testQuestions.length - 1) {
                nextBtn.disabled = false;
            }
            updateFinishButton();
        });
        
        inputContainer.appendChild(inputElement);
        optionsContainer.appendChild(inputContainer);
    }
    
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === testQuestions.length - 1;
    updateProgressBar();
    updateFinishButton();
}

// Проверка, можно ли завершить тест
function updateFinishButton() {
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const totalQuestions = testQuestions.length;
    
    if (answeredCount === totalQuestions) {
        finishBtn.style.display = 'block';
        finishBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> Завершить тест (все ответы заполнены)';
    } else {
        finishBtn.style.display = 'block';
        finishBtn.innerHTML = `<i class="fas fa-flag-checkered"></i> Завершить досрочно (ответов: ${answeredCount}/${totalQuestions})`;
    }
}

// Обновление прогресс-бара
function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
}

// Запуск таймера
function startTimer(totalSeconds) {
    let timeLeft = totalSeconds;
    
    timerInterval = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            finishTest();
        }
        
        if (timeLeft < 60) {
            timerElement.style.color = '#e74c3c';
        }
    }, 1000);
}

// Завершение теста
function finishTest() {
    clearInterval(timerInterval);
    endTime = new Date();
    
    const timeDiff = endTime - startTime;
    const minutes = Math.floor(timeDiff / 60000);
    const seconds = Math.floor((timeDiff % 60000) / 1000);
    
    window.testTimeSpent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Сохраняем результат в общую статистику
    saveTestResult();
    
    goToStep(3);
}

// Функция сохранения результата теста
function saveTestResult() {
    const testResult = {
        studentName: studentName,
        testName: 'Лексика: Comida',
        score: window.correctCount || 0,
        totalQuestions: testQuestions.length,
        timeSpent: window.testTimeSpent,
        date: new Date().toISOString(),
        percentage: window.percentage || 0
    };
    
    // Загружаем существующие результаты
    let savedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    // Добавляем новый результат
    savedResults.push(testResult);
    
    // Сохраняем обратно (ограничим до 1000 записей)
    if (savedResults.length > 1000) {
        savedResults = savedResults.slice(-1000);
    }
    
    localStorage.setItem('testResults', JSON.stringify(savedResults));
    
    // Также сохраняем для локальной статистики
    updateLocalStats();
}

function updateLocalStats() {
    let totalTests = localStorage.getItem('totalTestsCompleted') || 0;
    totalTests = parseInt(totalTests) + 1;
    localStorage.setItem('totalTestsCompleted', totalTests);
    
    let students = JSON.parse(localStorage.getItem('testStudents') || '[]');
    if (!students.includes(studentName)) {
        students.push(studentName);
        localStorage.setItem('testStudents', JSON.stringify(students));
    }
}

// Показать результаты
function showResults() {
    let correctCount = 0;
    const resultDetails = [];
    
    testQuestions.forEach((question, index) => {
        let isCorrect = false;
        let userAnswer = userAnswers[index];
        
        if (question.type === 'choice') {
            isCorrect = userAnswer === question.correct;
            userAnswer = userAnswer !== null ? question.options[userAnswer] : 'Нет ответа';
        } else if (question.type === 'input') {
            const normalizedUserAnswer = userAnswer ? userAnswer.toLowerCase().trim() : '';
            const normalizedCorrectAnswer = question.answer.toLowerCase().trim();
            isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
            userAnswer = userAnswer || 'Нет ответа';
        }
        
        if (isCorrect) correctCount++;
        
        resultDetails.push({
            question: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.type === 'choice' ? question.options[question.correct] : question.answer,
            isCorrect: isCorrect
        });
    });
    
    // Сохраняем для использования в saveTestResult
    window.correctCount = correctCount;
    window.percentage = Math.round((correctCount / testQuestions.length) * 100);
    
    // Обновление интерфейса результатов
    document.getElementById('studentGreeting').textContent = 
        `${studentName || 'Студент'}, вот твой результат!`;
    
    document.getElementById('scoreValue').textContent = correctCount;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = testQuestions.length - correctCount;
    document.getElementById('timeSpent').textContent = window.testTimeSpent || '0:00';
    
    document.getElementById('scorePercent').textContent = `${window.percentage}%`;
    
    // Анимация круга прогресса
    const circle = document.querySelector('.progress-ring-fill');
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (window.percentage / 100) * circumference;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    
    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1.5s ease';
        circle.style.strokeDashoffset = offset;
    }, 300);
    
    // Мотивационное сообщение
    const resultMessage = document.getElementById('resultMessage');
    if (window.percentage >= 90) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-trophy"></i> ¡Excelente! Отлично! (${correctCount}/20)</h3>
            <p>Ты прекрасно знаешь испанскую лексику о еде! ¡Fantástico!</p>
        `;
        resultMessage.style.borderLeftColor = '#27ae60';
    } else if (window.percentage >= 75) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-star"></i> ¡Muy bien! Очень хорошо! (${correctCount}/20)</h3>
            <p>Отличный результат! Ты хорошо ориентируешься в кулинарной лексике.</p>
        `;
        resultMessage.style.borderLeftColor = '#f1bf00';
    } else if (window.percentage >= 50) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> ¡Bien! Хорошо! (${correctCount}/20)</h3>
            <p>Неплохо! Для уверенного общения в ресторане стоит повторить слова.</p>
        `;
        resultMessage.style.borderLeftColor = '#3498db';
    } else {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-book"></i> ¡A practicar! Нужно повторить (${correctCount}/20)</h3>
            <p>Лексика требует повторения. Сосредоточься на словах о еде!</p>
        `;
        resultMessage.style.borderLeftColor = '#e74c3c';
    }
    
    // Детализация ответов
    const answersDetails = document.getElementById('answersDetails');
    answersDetails.innerHTML = '';
    
    resultDetails.forEach((detail, index) => {
        const detailElement = document.createElement('div');
        detailElement.className = `question-detail ${detail.isCorrect ? 'correct' : 'incorrect'}`;
        
        detailElement.innerHTML = `
            <h4>Вопрос ${index + 1}: ${detail.question}</h4>
            <p><strong>Ваш ответ:</strong> ${detail.userAnswer}</p>
            <p><strong>Правильный ответ:</strong> ${detail.correctAnswer}</p>
            <p class="result-status">
                <i class="fas fa-${detail.isCorrect ? 'check' : 'times'}"></i>
                ${detail.isCorrect ? 'Правильно' : 'Неправильно'}
            </p>
        `;
        
        answersDetails.appendChild(detailElement);
    });
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    startTestBtn.addEventListener('click', () => {
        if (studentNameInput.value.trim()) {
            studentName = studentNameInput.value.trim();
            goToStep(2);
        } else {
            alert('Пожалуйста, введите ваше имя');
            studentNameInput.focus();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            displayQuestion(currentQuestionIndex);
        }
    });
    
    nextBtn.addEventListener('click', () => {
        if (currentQuestionIndex < testQuestions.length - 1) {
            currentQuestionIndex++;
            displayQuestion(currentQuestionIndex);
        }
    });
    
    finishBtn.addEventListener('click', finishTest);
    
    document.getElementById('restartBtn').addEventListener('click', () => {
        goToStep(1);
    });
    
    document.getElementById('detailsBtn').addEventListener('click', () => {
        const detailsSection = document.getElementById('detailsSection');
        const detailsBtn = document.getElementById('detailsBtn');
        if (detailsSection.style.display === 'none') {
            detailsSection.style.display = 'block';
            detailsBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Скрыть детали';
        } else {
            detailsSection.style.display = 'none';
            detailsBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Посмотреть детали';
        }
    });
    
    studentNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startTestBtn.click();
        }
    });
});