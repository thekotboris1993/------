// ===== БЛОК 1: Предметы, места, еда (35 слов) =====
const blockWords = [
    // Предметы (15)
    { ko: "사전", es: "diccionario" },
    { ko: "휴지", es: "papel higiénico" },
    { ko: "커튼", es: "cortina" },
    { ko: "전등", es: "lámpara" },
    { ko: "옷장", es: "armario" },
    { ko: "종이", es: "papel" },
    { ko: "열쇠", es: "llave" },
    { ko: "가격", es: "precio" },
    { ko: "칫솔", es: "cepillo de dientes" },
    { ko: "치약", es: "pasta de dientes" },
    { ko: "비누", es: "jabón" },
    { ko: "수건", es: "toalla" },
    { ko: "샴푸", es: "champú" },
    { ko: "설문지", es: "cuestionario" },
    { ko: "귤", es: "mandarina" },
    
    // Места (12)
    { ko: "극장", es: "teatro" },
    { ko: "박물관", es: "museo" },
    { ko: "휴게실", es: "sala de descanso" },
    { ko: "탑", es: "torre" },
    { ko: "헬스장", es: "gimnasio" },
    { ko: "어학당", es: "escuela de idiomas" },
    { ko: "여행사", es: "agencia de viajes" },
    { ko: "온실", es: "invernadero" },
    { ko: "교실", es: "aula" },
    { ko: "부엌", es: "cocina" },
    { ko: "욕실", es: "baño" },
    { ko: "벽", es: "pared" },
    
    // Еда (8)
    { ko: "수박", es: "sandía" },
    { ko: "소금", es: "sal" },
    { ko: "간장", es: "salsa de soja" },
    { ko: "식초", es: "vinagre" },
    { ko: "고추", es: "pimiento picante" },
    { ko: "설탕", es: "azúcar" },
    { ko: "닭고기", es: "pollo" },
    { ko: "소고기", es: "carne de res" }
];

const LEVEL_CONFIG = {
    timeLimit: 15 * 60,
    reverseChance: 0.5,
    optionsCount: 3,
    testName: 'Корейская лексика: Блок 1 (Предметы, места, еда)'
};

// ===== ДАЛЬШЕ ИДЁТ СТАНДАРТНЫЙ КОД (без изменений) =====
let currentStep = 1;
let studentName = "";
let currentQuestionIndex = 0;
let testQuestions = [];
let userAnswers = [];
let startTime, endTime;
let timerInterval;
let testResults = [];

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

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function pickRandom(array, count) {
    return shuffleArray(array).slice(0, count);
}

function generateQuestion(word, allWords) {
    const isReverse = Math.random() < LEVEL_CONFIG.reverseChance;
    const correctAnswer = isReverse ? word.ko : word.es;
    const questionText = isReverse 
        ? `¿Cómo se traduce al coreano: "${word.es}"?`
        : `Как переводится на испанский: "${word.ko}"?`;
    
    const otherWords = allWords.filter(w => w.ko !== word.ko && w.es !== word.es);
    const wrongAnswers = pickRandom(otherWords, LEVEL_CONFIG.optionsCount - 1)
        .map(w => isReverse ? w.ko : w.es);
    
    const options = shuffleArray([correctAnswer, ...wrongAnswers]);
    const correctIndex = options.indexOf(correctAnswer);
    
    return {
        question: questionText,
        options: options,
        correct: correctIndex,
        hint: isReverse ? 'Перевод на корейский' : 'Перевод на испанский',
        word: word
    };
}

function generateTest() {
    // ВСЕ СЛОВА БЛОКА, НО ПЕРЕМЕШАННЫЕ
    const shuffledWords = shuffleArray(blockWords);
    return shuffledWords.map(word => generateQuestion(word, blockWords));
}

function goToStep(stepNumber) {
    stepElements.forEach(step => step.classList.remove('active-step'));
    document.getElementById(`step${stepNumber}`).classList.add('active-step');
    currentStep = stepNumber;
    if (stepNumber === 2) initTest();
    else if (stepNumber === 3) showResults();
}

function initTest() {
    testQuestions = generateTest();
    userAnswers = new Array(testQuestions.length).fill(null);
    currentQuestionIndex = 0;
    testResults = [];
    startTime = new Date();
    startTimer(LEVEL_CONFIG.timeLimit);
    displayQuestion(currentQuestionIndex);
}

function displayQuestion(index) {
    const question = testQuestions[index];
    currentQuestionElement.textContent = `Вопрос ${index + 1} из ${testQuestions.length}`;
    questionTextElement.textContent = question.question;
    hintTextElement.textContent = question.hint;
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, optionIndex) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        if (userAnswers[index] === optionIndex) optionElement.classList.add('selected');
        optionElement.textContent = option;
        optionElement.dataset.index = optionIndex;
        optionElement.addEventListener('click', () => {
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            optionElement.classList.add('selected');
            userAnswers[index] = optionIndex;
            if (index < testQuestions.length - 1) nextBtn.disabled = false;
            updateFinishButton();
        });
        optionsContainer.appendChild(optionElement);
    });
    
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === testQuestions.length - 1;
    updateProgressBar();
    updateFinishButton();
}

function updateFinishButton() {
    const answeredCount = userAnswers.filter(a => a !== null).length;
    const total = testQuestions.length;
    if (answeredCount === total) {
        finishBtn.style.display = 'block';
        finishBtn.innerHTML = '<i class="fas fa-flag-checkered"></i> Завершить тест (все ответы заполнены)';
    } else {
        finishBtn.style.display = 'block';
        finishBtn.innerHTML = `<i class="fas fa-flag-checkered"></i> Завершить досрочно (ответов: ${answeredCount}/${total})`;
    }
}

function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / testQuestions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;
}

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
        if (timeLeft < 60) timerElement.style.color = '#e74c3c';
    }, 1000);
}

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

function calculateResults() {
    testResults = [];
    testQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correct;
        testResults.push({
            question: question.question,
            userAnswer: userAnswer !== null ? question.options[userAnswer] : 'Нет ответа',
            correctAnswer: question.options[question.correct],
            isCorrect: isCorrect
        });
    });
}

async function saveTestResult() {
    const correctCount = testResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / testQuestions.length) * 100);
    const details = testResults.map((result, index) => ({
        questionNumber: index + 1,
        questionText: result.question,
        userAnswer: result.userAnswer,
        correctAnswer: result.correctAnswer,
        isCorrect: result.isCorrect
    }));
    const testResult = {
        studentName: studentName || 'Анонимный студент',
        testName: LEVEL_CONFIG.testName,
        score: correctCount,
        totalQuestions: testQuestions.length,
        timeSpent: window.testTimeSpent || '0:00',
        date: new Date().toISOString(),
        percentage: percentage,
        details: details
    };
    console.log('Отправка результата на сервер:', testResult);
    try {
        const response = await fetch('http://a1267472.xsph.ru/api/save_result.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testResult)
        });
        const data = await response.json();
        if (data.success) console.log('✅ Результат сохранен на сервере');
        else { console.error('Ошибка сервера:', data.error); saveToLocalStorage(testResult); }
    } catch (error) {
        console.error('Ошибка отправки на сервер:', error);
        saveToLocalStorage(testResult);
    }
    saveToLocalStorage(testResult);
}

function saveToLocalStorage(result) {
    let savedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    savedResults.push({...result, id: Date.now()});
    if (savedResults.length > 1000) savedResults = savedResults.slice(-1000);
    localStorage.setItem('testResults', JSON.stringify(savedResults));
}

function showResults() {
    const correctCount = testResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / testQuestions.length) * 100);
    document.getElementById('studentGreeting').textContent = `${studentName || 'Студент'}, вот твой результат!`;
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
        resultMessage.innerHTML = `<h3><i class="fas fa-trophy"></i> 훌륭해요! ¡Excelente! (${correctCount}/${testQuestions.length})</h3><p>Ты прекрасно знаешь этот блок слов!</p>`;
        resultMessage.style.borderLeftColor = '#27ae60';
    } else if (percentage >= 75) {
        resultMessage.innerHTML = `<h3><i class="fas fa-star"></i> 아주 잘했어요! ¡Muy bien! (${correctCount}/${testQuestions.length})</h3><p>Хороший результат! Ещё немного практики.</p>`;
        resultMessage.style.borderLeftColor = '#f1bf00';
    } else if (percentage >= 50) {
        resultMessage.innerHTML = `<h3><i class="fas fa-check-circle"></i> 잘했어요! ¡Bien! (${correctCount}/${testQuestions.length})</h3><p>Неплохо! Повтори этот блок слов.</p>`;
        resultMessage.style.borderLeftColor = '#3498db';
    } else {
        resultMessage.innerHTML = `<h3><i class="fas fa-book"></i> 연습이 필요해요! Нужно повторить (${correctCount}/${testQuestions.length})</h3><p>Повтори этот блок слов и попробуй снова.</p>`;
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
            <p class="result-status"><i class="fas fa-${detail.isCorrect ? 'check' : 'times'}"></i> ${detail.isCorrect ? 'Правильно' : 'Неправильно'}</p>
        `;
        answersDetails.appendChild(detailElement);
    });
}

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
    prevBtn.addEventListener('click', () => { if (currentQuestionIndex > 0) { currentQuestionIndex--; displayQuestion(currentQuestionIndex); } });
    nextBtn.addEventListener('click', () => { if (currentQuestionIndex < testQuestions.length - 1) { currentQuestionIndex++; displayQuestion(currentQuestionIndex); } });
    finishBtn.addEventListener('click', finishTest);
    document.getElementById('restartBtn').addEventListener('click', () => goToStep(1));
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
    studentNameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') startTestBtn.click(); });
});
