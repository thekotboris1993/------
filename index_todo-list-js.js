// Массив задач: каждый объект содержит text и completed
let tasks = [];

// Получаем DOM-элементы
const todoList = document.getElementById('todo-list');
const newTaskInput = document.getElementById('new-task');
const addButton = document.getElementById('add-button');

// Функция для рендеринга всего списка
function renderTasks() {
  todoList.innerHTML = ''; // Очищаем список

  tasks.forEach((task, index) => {
    // Создаем элементы
    const listItem = document.createElement('li');
    listItem.className = 'todo-item';
    if (task.completed) listItem.classList.add('completed');

    const taskTextSpan = document.createElement('span');
    taskTextSpan.className = 'task-text';
    taskTextSpan.textContent = task.text;

    // Контейнер для кнопок
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editButton = document.createElement('button');
    editButton.className = 'edit-btn';
    editButton.innerHTML = '✏️';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = '❌';

    actionsDiv.appendChild(editButton);
    actionsDiv.appendChild(deleteButton);
    listItem.appendChild(taskTextSpan);
    listItem.appendChild(actionsDiv);
    todoList.appendChild(listItem);

    // --- Обработчик клика по тексту задачи (toggle complete) ---
    taskTextSpan.addEventListener('click', (event) => {
      event.stopPropagation(); // Останавливаем всплытие
      tasks[index].completed = !tasks[index].completed;
      listItem.classList.toggle('completed');
    });

    // --- Обработчик для кнопки удаления ---
    deleteButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Останавливаем всплытие
      tasks.splice(index, 1);   // Удаляем задачу из массива
      renderTasks();            // Перерисовываем список
    });

    // --- Обработчик для кнопки редактирования ---
    editButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Останавливаем всплытие
      const newTaskText = prompt('Редактировать задачу:', task.text);
      if (newTaskText !== null && newTaskText.trim() !== '') {
        tasks[index].text = newTaskText.trim();
        renderTasks(); // Перерисовываем список
      } else if (newTaskText !== null && newTaskText.trim() === '') {
        alert('Название задачи не может быть пустым!');
      }
    });
  });
}

// Функция добавления новой задачи
function addTask() {
  const newTaskText = newTaskInput.value.trim();
  if (newTaskText !== '') {
    tasks.push({ text: newTaskText, completed: false });
    renderTasks();        // Перерисовываем список
    newTaskInput.value = ''; // Очищаем поле ввода
  } else {
    alert('Пожалуйста, введите текст задачи.');
  }
}

// Навешиваем обработчик на кнопку добавления
addButton.addEventListener('click', addTask);

// Добавляем возможность добавления задачи по нажатию Enter
newTaskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTask();
  }
});