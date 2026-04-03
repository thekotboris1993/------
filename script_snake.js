const boardSize = 10;
const gameBoard = document.getElementById('game-board');
const cells = [];

let snake = [{ x: 0, y: 0 }];
let food = { x: 5, y: 5 };
let direction = 'right';
let speed = 800;
let gameInterval = null;
let currentScore = 0;
let isGameActive = true;

// Настройки цвета змейки
let snakeColor = '#4caf50';
let useGradient = true;

// Таблица лидеров
let leaderboard = [];

// Новые переменные для дополнительных функций
let isPaused = false;
let highScore = 0;
let eatCount = 0;

// Функция для расчета очков на основе скорости
function calculatePoints() {
  const basePoints = 10;
  const maxSpeed = 100;
  const minSpeed = 2000;
  
  let multiplier;
  if (speed <= maxSpeed) {
    multiplier = 5.0;
  } else if (speed >= minSpeed) {
    multiplier = 1.0;
  } else {
    multiplier = 1 + (4 * (minSpeed - speed) / (minSpeed - maxSpeed));
  }
  
  multiplier = Math.round(multiplier * 10) / 10;
  const points = Math.floor(basePoints * multiplier);
  return { points, multiplier };
}

// Показ уведомления
function showNotification(message, color = '#4caf50') {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20%';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.background = color;
  notification.style.color = 'white';
  notification.style.padding = '12px 24px';
  notification.style.borderRadius = '30px';
  notification.style.fontSize = '18px';
  notification.style.fontWeight = 'bold';
  notification.style.zIndex = '1001';
  notification.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
  notification.style.animation = 'slideDown 0.5s ease-out forwards';
  notification.style.whiteSpace = 'nowrap';
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      0% {
        opacity: 0;
        transform: translateX(-50%) translateY(-50px);
      }
      100% {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 2000);
}

// Функция для показа уведомления о начисленных очках
function showPointsNotification(points, multiplier) {
  const notification = document.createElement('div');
  notification.textContent = `+${points} (x${multiplier})`;
  notification.style.position = 'fixed';
  notification.style.left = '50%';
  notification.style.top = '50%';
  notification.style.transform = 'translate(-50%, -50%)';
  notification.style.background = `linear-gradient(135deg, ${snakeColor}, ${adjustColor(snakeColor, -30)})`;
  notification.style.color = 'white';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '30px';
  notification.style.fontSize = '24px';
  notification.style.fontWeight = 'bold';
  notification.style.zIndex = '1000';
  notification.style.boxShadow = '0 5px 20px rgba(0,0,0,0.3)';
  notification.style.animation = 'floatUp 1s ease-out forwards';
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatUp {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -150%) scale(1.5);
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 1000);
}

// Загрузка рекорда из localStorage
function loadHighScore() {
  const saved = localStorage.getItem('snakeHighScore');
  if (saved) {
    highScore = parseInt(saved);
  }
  updateHighScoreDisplay();
}

// Сохранение рекорда
function saveHighScore() {
  if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem('snakeHighScore', highScore);
    updateHighScoreDisplay();
    showNotification('🎉 НОВЫЙ РЕКОРД! 🎉', '#ffd700');
  }
}

// Обновление отображения рекорда
function updateHighScoreDisplay() {
  let highScoreElement = document.getElementById('high-score-value');
  if (!highScoreElement) {
    const scoreContainer = document.querySelector('.score-container');
    if (scoreContainer) {
      const highScoreDiv = document.createElement('div');
      highScoreDiv.className = 'high-score';
      highScoreDiv.innerHTML = `🏆 Рекорд: <span id="high-score-value">${highScore}</span>`;
      scoreContainer.appendChild(highScoreDiv);
    }
  } else {
    highScoreElement.textContent = highScore;
  }
}

// Анимация появления еды
function animateFoodAppearance() {
  const foodIndex = food.x + food.y * boardSize;
  if (cells[foodIndex]) {
    cells[foodIndex].style.animation = 'foodPop 0.3s ease-out';
    setTimeout(() => {
      if (cells[foodIndex]) {
        cells[foodIndex].style.animation = '';
      }
    }, 300);
  }
}

// Обновляем отображение информации о скорости и множителе
function updateSpeedInfo() {
  const { points, multiplier } = calculatePoints();
  const speedValue = document.getElementById('speed-value');
  const multiplierSpan = document.getElementById('multiplier-value');
  const pointsSpan = document.getElementById('points-per-food');
  const speedInfo = document.getElementById('speed-info');
  
  if (speedValue) speedValue.textContent = speed;
  if (multiplierSpan) multiplierSpan.textContent = `x${multiplier}`;
  if (pointsSpan) pointsSpan.textContent = points;
  if (speedInfo) {
    speedInfo.innerHTML = `Множитель: <span id="multiplier-value">x${multiplier}</span> | +<span id="points-per-food">${points}</span>`;
  }
}

// Загрузка настроек цвета из localStorage
function loadColorSettings() {
  const savedColor = localStorage.getItem('snakeColor');
  const savedGradient = localStorage.getItem('snakeGradient');
  
  if (savedColor) {
    snakeColor = savedColor;
    const colorPicker = document.getElementById('snake-color-picker');
    if (colorPicker) colorPicker.value = snakeColor;
  }
  
  if (savedGradient !== null) {
    useGradient = savedGradient === 'true';
    const gradientToggle = document.getElementById('gradient-toggle');
    if (gradientToggle) gradientToggle.checked = useGradient;
  }
  
  updateActiveColorButton();
}

function updateActiveColorButton() {
  const colorButtons = document.querySelectorAll('.color-btn');
  colorButtons.forEach(btn => {
    if (btn.dataset.color === snakeColor) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function saveColorSettings() {
  localStorage.setItem('snakeColor', snakeColor);
  localStorage.setItem('snakeGradient', useGradient);
}

function getSnakeStyle() {
  if (useGradient) {
    const darkerColor = adjustColor(snakeColor, -30);
    return {
      background: `linear-gradient(135deg, ${snakeColor}, ${darkerColor})`,
      boxShadow: `0 0 8px ${snakeColor}`
    };
  } else {
    return {
      background: snakeColor,
      boxShadow: `0 0 5px ${snakeColor}`
    };
  }
}

function adjustColor(color, percent) {
  const num = parseInt(color.slice(1), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + percent));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

function applySnakeColor() {
  const style = getSnakeStyle();
  const snakeCells = document.querySelectorAll('.snake');
  snakeCells.forEach(cell => {
    cell.style.background = style.background;
    cell.style.boxShadow = style.boxShadow;
  });
}

function initializeGameBoard() {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cells.push(cell);
      gameBoard.appendChild(cell);
    }
  }
}

function render() {
  cells.forEach((cell) => {
    cell.classList.remove('snake', 'food');
    cell.style.background = '';
    cell.style.boxShadow = '';
  });

  snake.forEach((segment) => {
    const index = segment.x + segment.y * boardSize;
    if (cells[index]) {
      cells[index].classList.add('snake');
    }
  });

  const foodIndex = food.x + food.y * boardSize;
  if (cells[foodIndex]) {
    cells[foodIndex].classList.add('food');
  }
  
  applySnakeColor();
}

function update() {
  if (!isGameActive || isPaused) return;
  
  const head = { ...snake[0] };

  switch (direction) {
    case 'up': head.y -= 1; break;
    case 'down': head.y += 1; break;
    case 'left': head.x -= 1; break;
    case 'right': head.x += 1; break;
  }

  if (head.x < 0 || head.x >= boardSize || head.y < 0 || head.y >= boardSize) {
    gameOver();
    return;
  }

  if (snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
    gameOver();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    snake.unshift(head);
    const { points, multiplier } = calculatePoints();
    currentScore += points;
    eatCount++;
    updateScore(currentScore);
    saveHighScore();
    showPointsNotification(points, multiplier);
    generateFood();
  } else {
    snake.pop();
    snake.unshift(head);
  }
}

function gameOver() {
  if (!isGameActive) return;
  
  isGameActive = false;
  isPaused = false;
  
  if (gameInterval) {
    clearTimeout(gameInterval);
    gameInterval = null;
  }
  
  hidePauseOverlay();
  showNotification(`💀 ИГРА ОКОНЧЕНА! Счет: ${currentScore} 💀`, '#ff4757');
  showNameModal(currentScore);
}

function generateFood() {
  let newFood;
  let isValid = false;
  
  if (snake.length === boardSize * boardSize) {
    gameOver();
    return;
  }
  
  while (!isValid) {
    newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
    isValid = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  }
  
  food = newFood;
  animateFoodAppearance();
}

function resetGame() {
  if (gameInterval) {
    clearTimeout(gameInterval);
  }
  
  snake = [{ x: 0, y: 0 }];
  direction = 'right';
  currentScore = 0;
  eatCount = 0;
  isGameActive = true;
  isPaused = false;
  
  let isValid = false;
  while (!isValid) {
    food = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
    isValid = !snake.some(segment => segment.x === food.x && segment.y === food.y);
  }
  
  updateScore(currentScore);
  render();
  startGameLoop();
  animateFoodAppearance();
  hidePauseOverlay();
}

function startGameLoop() {
  if (gameInterval) {
    clearTimeout(gameInterval);
  }
  gameLoop();
}

function gameLoop() {
  if (!isGameActive) return;
  
  update();
  render();
  gameInterval = setTimeout(gameLoop, speed);
}

function updateScore(score) {
  const scoreElement = document.querySelector('#score-value');
  if (scoreElement) {
    scoreElement.textContent = score;
  }
}

// Функции паузы
function togglePause() {
  if (!isGameActive) return;
  
  isPaused = !isPaused;
  
  if (isPaused) {
    showNotification('⏸️ ПАУЗА', '#667eea');
    showPauseOverlay();
  } else {
    hidePauseOverlay();
    showNotification('▶️ ИГРА ПРОДОЛЖАЕТСЯ', '#4caf50');
  }
}

function showPauseOverlay() {
  let overlay = document.getElementById('pause-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pause-overlay';
    overlay.innerHTML = `
      <div class="pause-content">
        <div class="pause-icon">⏸️</div>
        <div class="pause-text">ПАУЗА</div>
        <div class="pause-hint">Нажмите ПРОБЕЛ для продолжения</div>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(5px);
    `;
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hidePauseOverlay() {
  const overlay = document.getElementById('pause-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// ============= Загрузка и сохранение таблицы лидеров =============
function loadLeaderboard() {
  const saved = localStorage.getItem('snakeLeaderboard');
  if (saved) {
    leaderboard = JSON.parse(saved);
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
  }
  renderLeaderboard();
}

function saveLeaderboard() {
  localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
}

function addToLeaderboard(name, score) {
  leaderboard.push({ name: name.substring(0, 20), score: score, date: new Date().toLocaleDateString() });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 10);
  saveLeaderboard();
  renderLeaderboard();
}

function renderLeaderboard() {
  const leaderboardList = document.getElementById('leaderboard-list');
  if (!leaderboardList) return;
  
  if (leaderboard.length === 0) {
    leaderboardList.innerHTML = '<div class="leaderboard-empty">🏆 Пока нет рекордов 🏆</div>';
    return;
  }
  
  leaderboardList.innerHTML = leaderboard.map((entry, index) => `
    <div class="leaderboard-item">
      <div class="leaderboard-rank">${index + 1}</div>
      <div class="leaderboard-name">${escapeHtml(entry.name)}</div>
      <div class="leaderboard-score">${entry.score}</div>
    </div>
  `).join('');
}

function clearLeaderboard() {
  if (confirm('Вы уверены, что хотите очистить таблицу лидеров?')) {
    leaderboard = [];
    saveLeaderboard();
    renderLeaderboard();
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showNameModal(score) {
  const modal = document.getElementById('name-modal');
  const finalScoreSpan = document.getElementById('final-score');
  const nameInput = document.getElementById('player-name');
  
  finalScoreSpan.textContent = score;
  nameInput.value = '';
  modal.style.display = 'flex';
  
  setTimeout(() => nameInput.focus(), 100);
  
  const saveBtn = document.getElementById('save-score-btn');
  const skipBtn = document.getElementById('skip-save-btn');
  
  const saveHandler = () => {
    let name = nameInput.value.trim();
    if (name === '') {
      name = 'Аноним';
    }
    addToLeaderboard(name, score);
    modal.style.display = 'none';
    removeListeners();
  };
  
  const skipHandler = () => {
    modal.style.display = 'none';
    removeListeners();
  };
  
  const removeListeners = () => {
    saveBtn.removeEventListener('click', saveHandler);
    skipBtn.removeEventListener('click', skipHandler);
  };
  
  saveBtn.addEventListener('click', saveHandler);
  skipBtn.addEventListener('click', skipHandler);
  
  const enterHandler = (e) => {
    if (e.key === 'Enter') {
      saveHandler();
      document.removeEventListener('keydown', enterHandler);
    }
  };
  document.addEventListener('keydown', enterHandler);
}

// ============= Управление с клавиатуры =============
document.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || 
      event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
  }

  // Пауза по пробелу
  if (event.key === ' ' || event.key === 'Space') {
    event.preventDefault();
    togglePause();
    return;
  }

  if (isPaused) return;

  switch (event.key) {
    case 'ArrowLeft':
      if (direction !== 'right') direction = 'left';
      break;
    case 'ArrowRight':
      if (direction !== 'left') direction = 'right';
      break;
    case 'ArrowUp':
      if (direction !== 'down') direction = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') direction = 'down';
      break;
    case 'r':
    case 'R':
      resetGame();
      break;
  }
});

// ============= Управление с кнопок =============
const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');
const resetBtn = document.getElementById('reset-game-btn');
const clearLeaderboardBtn = document.getElementById('clear-leaderboard');

if (btnUp) btnUp.addEventListener('click', () => { if (direction !== 'down') direction = 'up'; });
if (btnDown) btnDown.addEventListener('click', () => { if (direction !== 'up') direction = 'down'; });
if (btnLeft) btnLeft.addEventListener('click', () => { if (direction !== 'right') direction = 'left'; });
if (btnRight) btnRight.addEventListener('click', () => { if (direction !== 'left') direction = 'right'; });
if (resetBtn) resetBtn.addEventListener('click', () => resetGame());
if (clearLeaderboardBtn) clearLeaderboardBtn.addEventListener('click', () => clearLeaderboard());

// ============= Настройка скорости =============
const speedSlider = document.getElementById('speed-slider');
const speedInput = document.getElementById('speed-input');

function updateSpeed(newSpeed) {
  speed = newSpeed;
  if (speedSlider) speedSlider.value = newSpeed;
  if (speedInput) speedInput.value = newSpeed;
  
  updateSpeedInfo();
  
  if (isGameActive && gameInterval) {
    clearTimeout(gameInterval);
    gameLoop();
  }
}

if (speedSlider) {
  speedSlider.addEventListener('input', (event) => {
    updateSpeed(parseInt(event.target.value, 10));
  });
}

if (speedInput) {
  speedInput.addEventListener('change', (event) => {
    let newSpeed = parseInt(event.target.value, 10);
    if (!isNaN(newSpeed) && newSpeed >= 100 && newSpeed <= 2000) {
      updateSpeed(newSpeed);
    } else {
      event.target.value = speed;
    }
  });
}

// ============= Управление цветом змейки =============
const colorButtons = document.querySelectorAll('.color-btn');
const colorPicker = document.getElementById('snake-color-picker');
const gradientToggle = document.getElementById('gradient-toggle');

function changeSnakeColor(color) {
  snakeColor = color;
  saveColorSettings();
  updateActiveColorButton();
  applySnakeColor();
}

colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const color = btn.dataset.color;
    changeSnakeColor(color);
    if (colorPicker) colorPicker.value = color;
  });
});

if (colorPicker) {
  colorPicker.addEventListener('input', (event) => {
    changeSnakeColor(event.target.value);
  });
}

if (gradientToggle) {
  gradientToggle.addEventListener('change', (event) => {
    useGradient = event.target.checked;
    saveColorSettings();
    applySnakeColor();
  });
}

// Добавляем стили для анимации еды и паузы
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  @keyframes foodPop {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    80% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .pause-content {
    text-align: center;
    animation: fadeInScale 0.3s ease-out;
  }
  
  .pause-icon {
    font-size: 80px;
    margin-bottom: 20px;
  }
  
  .pause-text {
    font-size: 48px;
    font-weight: bold;
    color: white;
    text-shadow: 0 0 10px rgba(0,0,0,0.5);
    margin-bottom: 20px;
  }
  
  .pause-hint {
    font-size: 18px;
    color: rgba(255,255,255,0.8);
  }
  
  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.8);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .high-score {
    margin-top: 8px;
    font-size: 11px;
    opacity: 0.9;
    border-top: 1px solid rgba(255,255,255,0.3);
    padding-top: 8px;
  }
  
  .high-score span {
    font-size: 14px;
    font-weight: bold;
  }
`;
document.head.appendChild(extraStyles);

// Закрытие модального окна при клике вне его
document.addEventListener('click', (event) => {
  const modal = document.getElementById('name-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

// ============= ЗАПУСК ИГРЫ =============
initializeGameBoard();
loadLeaderboard();
loadColorSettings();
loadHighScore();
resetGame();
updateSpeedInfo();