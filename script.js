// script.js (no changes from last version)
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filter = 'all';

// DOM elements
const taskInput = document.getElementById('taskInput');
const today = new Date().toISOString().split("T")[0];
document.getElementById("dueDateInput").setAttribute("min", today);
const dueDateInput = document.getElementById('dueDateInput');
const priorityInput = document.getElementById('priorityInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

function saveAndRender() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  renderTasks();
  updateProgress();
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach((task, index) => {
    if (filter === 'completed' && task.completed !== true) return;
    if (filter === 'pending' && task.completed === true) return;

    const taskDiv = document.createElement('div');
    taskDiv.className = 'task';
    if (task.completed) taskDiv.classList.add('completed');

    taskDiv.innerHTML = `
      <span>
        ${task.text}
        ${task.dueDate ? `<small> (Due: ${task.dueDate})</small>` : ""}
        <span class="priority-${task.priority}">[${task.priority}]</span>
      </span>
      <div class="task-actions">
        <button class="alarm-btn ${task.alarmSet ? 'alarm-on' : ''}" onclick="toggleAlarm(${index})">
          <i class="fa-solid fa-bell"></i>
        </button>
        <button class="complete-btn" onclick="toggleComplete(${index})">${task.completed ? 'Undo' : 'Complete'}</button>
        <button class="edit-btn" onclick="editTask(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteTask(${index})">Delete</button>
      </div>
    `;
    taskList.appendChild(taskDiv);
  });
}

addTaskBtn.addEventListener('click', () => {
  const taskText = taskInput.value.trim();
  const dueDate = dueDateInput.value;
  const priority = priorityInput.value;
  if (!taskText || !dueDate) {
    alert("⚠️ Please enter a task and select a due date!");
    return;
  }
  tasks.push({
    text: taskText,
    completed: false,
    dueDate: dueDate,
    priority: priority,
    alarmSet: false
  });
  taskInput.value = '';
  dueDateInput.value = '';
  saveAndRender();
});

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveAndRender();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveAndRender();
}

function editTask(index) {
  const task = tasks[index];
  const newText = prompt("✏️ Edit your task:", task.text);
  if (newText) {
    task.text = newText.trim();
    saveAndRender();
  }
}

function setFilter(value) {
  filter = value;
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.completed);
  saveAndRender();
}

function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBar.value = percent;
  progressText.innerText = `${percent}% Complete`;
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function toggleAlarm(index) {
  tasks[index].alarmSet = !tasks[index].alarmSet;
  saveAndRender();
}

function checkAlarms() {
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  tasks.forEach((task, index) => {
    if (!task.completed && task.alarmSet && task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const timeDifference = dueDate - now;
      if (timeDifference > 0 && timeDifference < oneDay) {
        const taskDivs = document.querySelectorAll('#taskList .task');
        const taskDiv = taskDivs[index];
        if (taskDiv && !taskDiv.classList.contains('ringing')) {
          alert(`Reminder: Task "${task.text}" is due soon!`);
          taskDiv.classList.add('ringing');
          setTimeout(() => {
            taskDiv.classList.remove('ringing');
          }, 5000);
        }
      }
    }
  });
}

window.addEventListener('storage', () => {
  tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  saveAndRender();
});

saveAndRender();
setInterval(checkAlarms, 60000);