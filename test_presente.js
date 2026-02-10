// Данные теста: 20 вопросов (10 с выбором, 10 с вводом)
const testQuestions = [
    // Вопросы с выбором ответа (10 шт)
    {
        type: 'choice',
        question: "Как правильно спрягается глагол 'hablar' (говорить) для местоимения 'yo' (я)?",
        options: ["hablo", "hablas", "habla", "hablamos"],
        correct: 0,
        hint: "Глаголы на -ar: yo = -o, tú = -as, él/ella = -a, nosotros = -amos"
    },
    {
        type: 'choice',
        question: "Выберите правильную форму глагола 'comer' (есть) для 'nosotros' (мы):",
        options: ["como", "comes", "come", "comemos"],
        correct: 3,
        hint: "Глаголы на -er: nosotros = -emos"
    },
    {
        type: 'choice',
        question: "Как будет 'они живут' по-испански (глагол vivir)?",
        options: ["vivo", "vives", "vive", "viven"],
        correct: 3,
        hint: "Глаголы на -ir: ellos/ellas = -en"
    },
    {
        type: 'choice',
        question: "Выберите неправильную форму глагола 'tener' (иметь) для 'yo' (я):",
        options: ["tengo", "tienes", "tiene", "tenemos"],
        correct: 0,
        hint: "Глагол 'tener' неправильный: yo = tengo"
    },
    {
        type: 'choice',
        question: "Как правильно: 'él _____ (ser) estudiante' (он студент)?",
        options: ["soy", "eres", "es", "somos"],
        correct: 2,
        hint: "Глагол 'ser' (быть): yo = soy, tú = eres, él/ella = es"
    },
    {
        type: 'choice',
        question: "Выберите форму глагола 'ir' (идти) для 'yo' (я):",
        options: ["voy", "vas", "va", "vamos"],
        correct: 0,
        hint: "Глагол 'ir' полностью неправильный: yo = voy"
    },
    {
        type: 'choice',
        question: "Как будет 'ты понимаешь' (глагол entender, изменение e→ie)?",
        options: ["entiendo", "entiendes", "entiende", "entendemos"],
        correct: 1,
        hint: "Глаголы с e→ie меняются во всех формах кроме nosotros/vosotros"
    },
    {
        type: 'choice',
        question: "Выберите правильную форму 'они могут' (глагол poder, изменение o→ue):",
        options: ["puedo", "puedes", "puede", "pueden"],
        correct: 3,
        hint: "Poder: yo = puedo, tú = puedes, él = puede, ellos = pueden"
    },
    {
        type: 'choice',
        question: "Как правильно: 'yo _____ (levantarse) temprano' (я встаю рано)?",
        options: ["me levanto", "te levantas", "se levanta", "nos levantamos"],
        correct: 0,
        hint: "Возвратные глаголы: местоимение соответствует подлежащему"
    },
    {
        type: 'choice',
        question: "Выберите форму глагола 'jugar' (играть) для 'nosotros' (мы):",
        options: ["juego", "juegas", "juega", "jugamos"],
        correct: 3,
        hint: "Jugar (u→ue): меняется везде кроме nosotros/vosotros"
    },
    // Вопросы с вводом окончаний (10 шт)
    {
        type: 'input',
        question: "Введите окончание глагола 'cantar' для 'yo': cant___",
        answer: "o",
        hint: "Глаголы на -ar: yo = -o"
    },
    {
        type: 'input',
        question: "Введите окончание глагола 'beber' для 'tú': beb___",
        answer: "es",
        hint: "Глаголы на -er: tú = -es"
    },
    {
        type: 'input',
        question: "Введите окончание глагола 'escribir' для 'él': escrib___",
        answer: "e",
        hint: "Глаголы на -ir: él = -e"
    },
    {
        type: 'input',
        question: "Введите полную форму глагола 'tener' для 'yo': _______",
        answer: "tengo",
        hint: "Неправильный глагол: yo tengo"
    },
    {
        type: 'input',
        question: "Введите полную форму глагола 'hacer' для 'nosotros': _______",
        answer: "hacemos",
        hint: "Hacer: nosotros hacemos"
    },
    {
        type: 'input',
        question: "Введите окончание глагола 'entender' для 'yo' (e→ie): entend___",
        answer: "iendo",
        hint: "Entender: yo entiendo (e→ie)"
    },
    {
        type: 'input',
        question: "Введите окончание глагола 'dormir' для 'él' (o→ue): d___",
        answer: "duerme",
        hint: "Dormir: él duerme (o→ue)"
    },
    {
        type: 'input',
        question: "Введите возвратную форму 'levantarse' для 'yo': me _______",
        answer: "levanto",
        hint: "Levantarse: yo me levanto"
    },
    {
        type: 'input',
        question: "Введите форму глагола 'conocer' для 'tú': _______",
        answer: "conoces",
        hint: "Conocer: tú conoces (c→zc в yo form: conozco)"
    },
    {
        type: 'input',
        question: "Введите форму глагола 'salir' для 'nosotros': _______",
        answer: "salimos",
        hint: "Salir: nosotros salimos"
    }
];

// Глобальные переменные состояния теста
let currentStep = 1;
let studentName = "";
let currentQuestionIndex = 0;
let userAnswers = new Array(testQuestions.length).fill(null);
let startTime, endTime;
let timerInterval;
let testResults = []; // Для хранения результатов

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
    testResults = [];
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
        inputElement.placeholder = 'Введите ответ...';
        
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
    
    // Рассчитываем и сохраняем результаты
    calculateResults();
    saveTestResult();
    
    goToStep(3);
}

// Расчет результатов
function calculateResults() {
    testResults = [];
    
    testQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        let isCorrect = false;
        let correctAnswer = '';
        
        if (question.type === 'choice') {
            isCorrect = userAnswer === question.correct;
            correctAnswer = question.options[question.correct];
        } else if (question.type === 'input') {
            const normalizedUserAnswer = userAnswer ? userAnswer.toLowerCase().trim() : '';
            const normalizedCorrectAnswer = question.answer.toLowerCase().trim();
            isCorrect = normalizedUserAnswer === normalizedCorrectAnswer;
            correctAnswer = question.answer;
        }
        
        testResults.push({
            question: question.question,
            userAnswer: userAnswer !== null ? 
                (question.type === 'choice' ? question.options[userAnswer] : userAnswer) : 
                'Нет ответа',
            correctAnswer: correctAnswer,
            isCorrect: isCorrect
        });
    });
}

// Функция сохранения результата теста
function saveTestResult() {
    const correctCount = testResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / testQuestions.length) * 100);
    
    // Создаем объект результата
    const testResult = {
        id: Date.now() + Math.random(),
        studentName: studentName || 'Анонимный студент',
        testName: 'Глаголы: Presente',
        score: correctCount,  // ВАЖНО: число!
        totalQuestions: testQuestions.length,
        timeSpent: window.testTimeSpent || '0:00',
        date: new Date().toISOString(),
        percentage: percentage
    };
    
    console.log('Сохранение результата Presente:', testResult);
    
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

// Функция обновления локальной статистики
function updateLocalStats() {
    let totalTests = localStorage.getItem('totalTestsCompleted') || 0;
    totalTests = parseInt(totalTests) + 1;
    localStorage.setItem('totalTestsCompleted', totalTests);
    
    if (studentName) {
        let students = JSON.parse(localStorage.getItem('testStudents') || '[]');
        if (!students.includes(studentName)) {
            students.push(studentName);
            localStorage.setItem('testStudents', JSON.stringify(students));
        }
    }
}

// Показать результаты
function showResults() {
    const correctCount = testResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / testQuestions.length) * 100);
    
    // Обновление интерфейса результатов
    document.getElementById('studentGreeting').textContent = 
        `${studentName || 'Студент'}, вот твой результат!`;
    
    document.getElementById('scoreValue').textContent = correctCount;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = testQuestions.length - correctCount;
    document.getElementById('timeSpent').textContent = window.testTimeSpent || '0:00';
    
    document.getElementById('scorePercent').textContent = `${percentage}%`;
    
    // Анимация круга прогресса
    const circle = document.querySelector('.progress-ring-fill');
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = circumference;
    
    setTimeout(() => {
        circle.style.transition = 'stroke-dashoffset 1.5s ease';
        circle.style.strokeDashoffset = offset;
    }, 300);
    
    // Мотивационное сообщение
    const resultMessage = document.getElementById('resultMessage');
    if (percentage >= 90) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-trophy"></i> ¡Excelente! Превосходно! (${correctCount}/20)</h3>
            <p>Ты отлично знаешь глаголы Presente! ¡Felicidades!</p>
        `;
        resultMessage.style.borderLeftColor = '#27ae60';
    } else if (percentage >= 75) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-star"></i> ¡Muy bien! Очень хорошо! (${correctCount}/20)</h3>
            <p>Отличный результат! Ты хорошо справился с тестом.</p>
        `;
        resultMessage.style.borderLeftColor = '#f1bf00';
    } else if (percentage >= 50) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> ¡Bien! Хорошо! (${correctCount}/20)</h3>
            <p>Неплохо, но есть над чем поработать. Повтори материал!</p>
        `;
        resultMessage.style.borderLeftColor = '#3498db';
    } else {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-book"></i> ¡A practicar! Нужно повторить (${correctCount}/20)</h3>
            <p>Результат показывает, что тема требует повторения. Изучи материал и попробуй снова!</p>
        `;
        resultMessage.style.borderLeftColor = '#e74c3c';
    }
    
    // Детализация ответов
    const answersDetails = document.getElementById('answersDetails');
    answersDetails.innerHTML = '';
    
    testResults.forEach((detail, index) => {
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