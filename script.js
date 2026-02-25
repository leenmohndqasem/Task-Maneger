let tasks = [];
let currentFilter = 'all';

const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const sortByDateBtn = document.getElementById('sortByDateBtn');

//  Storage
function saveToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadFromStorage() {
    const data = localStorage.getItem('tasks');
    tasks = data ? JSON.parse(data) : [];
}

//  Fetch from API 
async function fetchInitialTasks() {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=5');

        if (response.status === 200) {
            const data = await response.json();

            const apiTasks = data.map(item => ({
                text: item.title,
                dueDate: new Date().toISOString().split('T')[0],
                completed: item.completed
            }));

            tasks = apiTasks;
            saveToStorage();
            renderTasks();
        }
    } catch (error) {
        console.error("Error fetching tasks:", error);
    }
}

// Render 
function renderTasks() {
    taskList.innerHTML = '';

    const filteredTasks = tasks.filter(t => {
        if (currentFilter === 'completed') return t.completed;
        if (currentFilter === 'active') return !t.completed;
        return true;
    });

    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        if (task.completed) li.classList.add('completed');

        li.innerHTML = `
            <div class="task-info">
                <span class="task-text">${task.text}</span>
                <small>${task.dueDate}</small>
            </div>
            <div class="task-actions">
                <button onclick="toggleComplete(${index})">
                    ${task.completed ? 'Undo' : 'Done'}
                </button>
                <button onclick="deleteTask(${index})" style="background:#1e1b2e">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });
}

//Add Task 
addTaskBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    const date = dateInput.value;

    if (!text || !date) return;

    tasks.push({
        text: text,
        dueDate: date,
        completed: false
    });

    saveToStorage();
    renderTasks();

    taskInput.value = '';
    dateInput.value = '';
});

// Delete 
window.deleteTask = (index) => {
    tasks.splice(index, 1);
    saveToStorage();
    renderTasks();
};

//Toggle Complete 
window.toggleComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    saveToStorage();
    renderTasks();
};

//  Sort 
sortByDateBtn.addEventListener('click', () => {
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    saveToStorage();
    renderTasks();
});

//  Filter 
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        currentFilter = e.target.getAttribute('data-filter');
        renderTasks();
    });
});

//  On Load 
window.onload = () => {
    loadFromStorage();

    if (tasks.length === 0) {
        fetchInitialTasks();
    } else {
        renderTasks();
    }
};