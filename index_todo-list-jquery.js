// Массив задач: каждый объект содержит text и completed
let tasks = [];

// Функция для рендеринга всего списка на основе массива tasks
function renderTasks() {
  const $todoList = $('#todo-list');
  $todoList.empty(); // Очищаем текущий список

  tasks.forEach((task, index) => {
    // Создаем элементы
    const $listItem = $('<li>').addClass('todo-item');
    if (task.completed) $listItem.addClass('completed');

    const $taskText = $('<span>').addClass('task-text').text(task.text);
    
    // Контейнер для кнопок
    const $actions = $('<div>').addClass('task-actions');
    const $editBtn = $('<button>').addClass('edit-btn').html('✏️');
    const $deleteBtn = $('<button>').addClass('delete-btn').html('❌');
    $actions.append($editBtn, $deleteBtn);

    $listItem.append($taskText, $actions);
    $todoList.append($listItem);

    // --- Обработчик клика по тексту задачи (toggle complete) ---
    $taskText.on('click', function(event) {
      event.stopPropagation(); // Останавливаем всплытие, чтобы не задеть родительские элементы
      tasks[index].completed = !tasks[index].completed;
      $listItem.toggleClass('completed');
    });

    // --- Обработчик для кнопки удаления ---
    $deleteBtn.on('click', function(event) {
      event.stopPropagation(); // Останавливаем всплытие
      // Удаляем задачу из массива
      tasks.splice(index, 1);
      // Перерисовываем список
      renderTasks();
    });

    // --- Обработчик для кнопки редактирования ---
    $editBtn.on('click', function(event) {
      event.stopPropagation(); // Останавливаем всплытие
      const newTaskText = prompt('Редактировать задачу:', task.text);
      if (newTaskText !== null && newTaskText.trim() !== '') {
        // Обновляем текст в массиве
        tasks[index].text = newTaskText.trim();
        // Перерисовываем список
        renderTasks();
      } else if (newTaskText !== null && newTaskText.trim() === '') {
        alert('Название задачи не может быть пустым!');
      }
    });
  });
}

// Функция добавления новой задачи
function addTask() {
  const newTaskText = $('#new-task').val().trim();
  if (newTaskText !== '') {
    tasks.push({ text: newTaskText, completed: false });
    renderTasks(); // Перерисовываем весь список
    $('#new-task').val(''); // Очищаем поле ввода
  } else {
    alert('Пожалуйста, введите текст задачи.');
  }
}

// Обработка отправки формы
$('#task-form').on('submit', function(e) {
  e.preventDefault();
  addTask();
});