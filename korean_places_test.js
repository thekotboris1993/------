// Данные теста: 16 вопросов по теме Корейские места (все с выбором ответа)
const testQuestions = [
    {
        type: 'choice',
        question: "Как сказать по-корейски: библиотека",
        options: ["도서관", "학교", "시장"],
        correct: 0,
        hint: "Место, где можно взять книги"
    },
    {
        type: 'choice',
        question: "Как сказать «рынок» по-корейски?",
        options: ["공원", "시장", "도서관"],
        correct: 1,
        hint: "Место, где продают продукты и товары"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: школа",
        options: ["학교", "회사", "도서관"],
        correct: 0,
        hint: "Учебное заведение для детей"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: парк",
        options: ["학교", "시장", "공원"],
        correct: 2,
        hint: "Место для отдыха на природе"
    },
    {
        type: 'choice',
        question: "Как сказать «компания» по-корейски?",
        options: ["회사", "공원", "시장"],
        correct: 0,
        hint: "Место работы в офисе"
    },
    {
        type: 'choice',
        question: "Как сказать «университет» по-корейски?",
        options: ["시장", "회사", "대학교"],
        correct: 2,
        hint: "Высшее учебное заведение"
    },
    {
        type: 'choice',
        question: "Как сказать «класс» по-корейски?",
        options: ["교실", "대사관", "회사"],
        correct: 0,
        hint: "Учебная комната в школе"
    },
    {
        type: 'choice',
        question: "Как сказать «посольство» по-корейски?",
        options: ["대사관", "대학교", "회사"],
        correct: 0,
        hint: "Дипломатическое представительство"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: салон красоты",
        options: ["약국", "병원", "미용실"],
        correct: 2,
        hint: "Место, где делают прически и уход"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: больница",
        options: ["교실", "병원", "약국"],
        correct: 1,
        hint: "Место, где лечат больных"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: аптека",
        options: ["시장", "병원", "약국"],
        correct: 2,
        hint: "Место, где продают лекарства"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: театр",
        options: ["약국", "극장", "미용실"],
        correct: 1,
        hint: "Место для просмотра спектаклей"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: почта",
        options: ["우체국", "약국", "극장"],
        correct: 0,
        hint: "Место для отправки писем и посылок"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: ресторан",
        options: ["극장", "교실", "식당"],
        correct: 2,
        hint: "Место, где готовят и подают еду"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: банк",
        options: ["병원", "은행", "약국"],
        correct: 1,
        hint: "Финансовое учреждение"
    },
    {
        type: 'choice',
        question: "Как сказать по-корейски: аэропорт",
        options: ["극장", "은행", "공항"],
        correct: 2,
        hint: "Место взлета и посадки самолетов"
    }
];

// Глобальные переменные состояния теста
let currentStep = 1;
let studentName = "";
let currentQuestionIndex = 0;
let userAnswers = new Array(testQuestions.length).fill(null);
let startTime, endTime;
let timerInterval;
let testResults = [];

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
    startTimer(15 * 60); // 15 минут для 16 вопросов
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
    
    const testResult = {
        id: Date.now() + Math.random(),
        studentName: studentName || 'Анонимный студент',
        testName: 'Корейские места',
        score: correctCount,
        totalQuestions: testQuestions.length,
        timeSpent: window.testTimeSpent || '0:00',
        date: new Date().toISOString(),
        percentage: percentage
    };
    
    console.log('Сохранение результата Korean Places:', testResult);
    
    let savedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    savedResults.push(testResult);
    
    if (savedResults.length > 1000) {
        savedResults = savedResults.slice(-1000);
    }
    
    localStorage.setItem('testResults', JSON.stringify(savedResults));
    
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
    
    document.getElementById('studentGreeting').textContent = 
        `${studentName || 'Студент'}, вот твой результат!`;
    
    document.getElementById('scoreValue').textContent = correctCount;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('wrongCount').textContent = testQuestions.length - correctCount;
    document.getElementById('timeSpent').textContent = window.testTimeSpent || '0:00';
    
    document.getElementById('scorePercent').textContent = `${percentage}%`;
    
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
    
    const resultMessage = document.getElementById('resultMessage');
    if (percentage >= 90) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-trophy"></i> 훌륭해요! (Хуллеунхеё!) Превосходно! (${correctCount}/16)</h3>
            <p>Ты прекрасно знаешь корейские названия мест! 정말 대단해요! (Чонмаль тэданеё!)</p>
        `;
        resultMessage.style.borderLeftColor = '#27ae60';
    } else if (percentage >= 75) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-star"></i> 아주 잘했어요! (Ачу чальхэссоё!) Очень хорошо! (${correctCount}/16)</h3>
            <p>Отличный результат! Ты хорошо ориентируешься в корейской лексике мест.</p>
        `;
        resultMessage.style.borderLeftColor = '#f1bf00';
    } else if (percentage >= 50) {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-check-circle"></i> 잘했어요! (Чальхэссоё!) Хорошо! (${correctCount}/16)</h3>
            <p>Неплохо! Для уверенного общения в Корее стоит повторить названия мест.</p>
        `;
        resultMessage.style.borderLeftColor = '#3498db';
    } else {
        resultMessage.innerHTML = `
            <h3><i class="fas fa-book"></i> 연습이 필요해요! (Ёнсыби пирыхэё!) Нужно повторить (${correctCount}/16)</h3>
            <p>Лексика требует повторения. Сосредоточься на корейских названиях мест!</p>
        `;
        resultMessage.style.borderLeftColor = '#e74c3c';
    }
    
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