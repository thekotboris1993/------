// После функции showResults() добавьте:

function saveTestResult() {
    // Получаем данные из теста
    const testResult = {
        studentName: studentName,
        testName: 'Глаголы: Presente',
        score: correctCount,
        totalQuestions: testQuestions.length,
        timeSpent: window.testTimeSpent,
        date: new Date().toISOString(),
        percentage: Math.round((correctCount / testQuestions.length) * 100)
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
    // Обновляем локальную статистику на главной странице
    let totalTests = localStorage.getItem('totalTestsCompleted') || 0;
    totalTests = parseInt(totalTests) + 1;
    localStorage.setItem('totalTestsCompleted', totalTests);
    
    // Обновляем количество уникальных студентов
    let students = JSON.parse(localStorage.getItem('testStudents') || '[]');
    if (!students.includes(studentName)) {
        students.push(studentName);
        localStorage.setItem('testStudents', JSON.stringify(students));
    }
}

// В функции finishTest() перед goToStep(3) добавьте:
saveTestResult();