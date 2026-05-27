// ============================================================
//  DASHBOARD JS - Full Self-Contained Implementation
//  Works with or without backend (uses localStorage fallback)
// ============================================================

const API_BASE = 'http://localhost:5000/api';

// ----- State -----
let allTasks = [];
let filteredTasks = [];
let currentFilter = 'all';
let priorityFilter = '';
let subjectFilter = '';
let searchQuery = '';
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();
let priorityChartInst, subjectChartInst, completionChartInst, timelineChartInst, statusChartInst, priorityAnalyticsChartInst;

// ============================================================
//  INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadTasks();
    initCalendar();

    // Close modals on overlay click
    document.getElementById('addTaskModal').addEventListener('click', function (e) {
        if (e.target === this) closeAddTaskModal();
    });
    document.getElementById('editTaskModal').addEventListener('click', function (e) {
        if (e.target === this) closeEditTaskModal();
    });

    // Set default date on Add Task form
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(23, 59);
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('taskDueDate').value = localISO;
});

// ============================================================
//  AUTH
// ============================================================
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!token && !user) {
        // For demo mode, create a guest user
        localStorage.setItem('user', JSON.stringify({ name: 'Student', email: 'student@example.com', _id: 'local' }));
        localStorage.setItem('authToken', 'local-mode');
    }
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    if (u && u.name) {
        document.getElementById('userName').textContent = u.name;
        document.getElementById('userInitials').textContent = u.name.charAt(0).toUpperCase();
        const settingsName = document.getElementById('settingsName');
        const settingsEmail = document.getElementById('settingsEmail');
        if (settingsName) settingsName.value = u.name;
        if (settingsEmail) settingsEmail.value = u.email || '';
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ============================================================
//  NAVIGATION
// ============================================================
function showSection(section, btn) {
    // Hide all sections
    ['dashboard', 'tasks', 'calendar', 'analytics', 'pomodoro', 'settings'].forEach(s => {
        const el = document.getElementById(s + 'Section');
        if (el) el.classList.remove('active');
    });
    // Remove active from all nav btns
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    // Show target section
    const target = document.getElementById(section + 'Section');
    if (target) target.classList.add('active');
    if (btn) btn.classList.add('active');

    // Page title
    const titles = { dashboard: 'Dashboard', tasks: 'My Tasks', calendar: 'Calendar', analytics: 'Analytics', pomodoro: 'Pomodoro Timer', settings: 'Settings' };
    document.getElementById('pageTitle').textContent = titles[section] || section;

    // Section-specific init
    if (section === 'analytics') initAnalyticsCharts();
    if (section === 'calendar') renderCalendar();
    if (section === 'tasks') renderAllTasksKanban();
    if (section === 'dashboard') renderDashboard();
}

// ============================================================
//  LOAD TASKS (API + localStorage fallback)
// ============================================================
async function loadTasks() {
    const token = localStorage.getItem('authToken');
    if (!token || token === 'local-mode') {
        allTasks = getLocalTasks();
        renderDashboard();
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/tasks`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        allTasks = data.tasks || data || [];
        saveLocalTasks(allTasks);
        renderDashboard();
    } catch (e) {
        allTasks = getLocalTasks();
        renderDashboard();
    }
}

function getLocalTasks() {
    try {
        return JSON.parse(localStorage.getItem('tasks') || '[]');
    } catch { return []; }
}

function saveLocalTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ============================================================
//  ADD TASK MODAL
// ============================================================
function openAddTaskModal() {
    document.getElementById('addTaskModal').classList.add('open');
    document.getElementById('taskTitle').focus();
}

function closeAddTaskModal() {
    document.getElementById('addTaskModal').classList.remove('open');
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'Medium';
    document.getElementById('taskSubject').value = 'Other';
    // Reset due date
    const now = new Date();
    now.setDate(now.getDate() + 1);
    now.setHours(23, 59);
    const localISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('taskDueDate').value = localISO;
}

async function submitAddTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const subject = document.getElementById('taskSubject').value;

    if (!title || !dueDate) {
        showToast('Please fill in required fields.', 'error');
        return;
    }

    const submitBtn = document.getElementById('addTaskSubmitBtn');
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    let newTask = {
        _id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title, description,
        dueDate: new Date(dueDate).toISOString(),
        priority, subject,
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    const token = localStorage.getItem('authToken');
    if (token && token !== 'local-mode') {
        try {
            const res = await fetch(`${API_BASE}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ title, description, dueDate, priority, subject })
            });
            if (res.ok) {
                const saved = await res.json();
                if (saved.task) {
                    newTask = { ...newTask, ...saved.task };
                } else {
                    newTask._id = saved._id || newTask._id;
                }
            }
        } catch (err) { /* fallback to local */ }
    }

    allTasks.unshift(newTask);
    saveLocalTasks(allTasks);

    closeAddTaskModal();
    submitBtn.textContent = 'Create Task';
    submitBtn.disabled = false;

    renderDashboard();
    renderAllTasksKanban();
    renderCalendar();
    updateAnalytics();

    showToast('✅ Task created successfully!', 'success');
}

// ============================================================
//  EDIT TASK MODAL
// ============================================================
function openEditTaskModal(taskId) {
    const task = allTasks.find(t => t._id === taskId);
    if (!task) return;
    document.getElementById('editTaskId').value = taskId;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskSubject').value = task.subject;
    document.getElementById('editTaskStatus').value = task.status;
    // Set due date
    const dd = new Date(task.dueDate);
    const localISO = new Date(dd.getTime() - dd.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('editTaskDueDate').value = localISO;
    document.getElementById('editTaskModal').classList.add('open');
}

function closeEditTaskModal() {
    document.getElementById('editTaskModal').classList.remove('open');
}

async function submitEditTask(e) {
    e.preventDefault();
    const taskId = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value.trim();
    const description = document.getElementById('editTaskDescription').value.trim();
    const dueDate = document.getElementById('editTaskDueDate').value;
    const priority = document.getElementById('editTaskPriority').value;
    const subject = document.getElementById('editTaskSubject').value;
    const status = document.getElementById('editTaskStatus').value;

    const idx = allTasks.findIndex(t => t._id === taskId);
    if (idx === -1) return;

    const updatedTaskPayload = { title, description, dueDate: new Date(dueDate).toISOString(), priority, subject, status };
    allTasks[idx] = { ...allTasks[idx], ...updatedTaskPayload };
    saveLocalTasks(allTasks);

    const token = localStorage.getItem('authToken');
    if (token && token !== 'local-mode' && !taskId.startsWith('local_')) {
        try {
            const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(updatedTaskPayload)
            });
            if (res.ok) {
                const saved = await res.json();
                if (saved.task) {
                    allTasks[idx] = { ...allTasks[idx], ...saved.task };
                    saveLocalTasks(allTasks);
                }
            }
        } catch { }
    }

    closeEditTaskModal();
    renderDashboard();
    renderAllTasksKanban();
    renderCalendar();
    updateAnalytics();
    showToast('✅ Task updated!', 'success');
}

// ============================================================
//  DELETE TASK
// ============================================================
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    allTasks = allTasks.filter(t => t._id !== taskId);
    saveLocalTasks(allTasks);

    const token = localStorage.getItem('authToken');
    if (token && token !== 'local-mode' && !taskId.startsWith('local_')) {
        try {
            await fetch(`${API_BASE}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch { }
    }

    renderDashboard();
    renderAllTasksKanban();
    renderCalendar();
    updateAnalytics();
    showToast('🗑️ Task deleted.', 'success');
}

// ============================================================
//  UPDATE TASK STATUS
// ============================================================
async function updateTaskStatus(taskId, newStatus) {
    const idx = allTasks.findIndex(t => t._id === taskId);
    if (idx === -1) return;
    allTasks[idx].status = newStatus;
    saveLocalTasks(allTasks);

    const token = localStorage.getItem('authToken');
    if (token && token !== 'local-mode' && !taskId.startsWith('local_')) {
        try {
            await fetch(`${API_BASE}/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: newStatus })
            });
        } catch { }
    }

    renderDashboard();
    renderAllTasksKanban();
    renderCalendar();
    updateAnalytics();
    showToast(`Task marked as ${newStatus}!`, 'success');
}

// ============================================================
//  RENDER DASHBOARD
// ============================================================
function renderDashboard() {
    const total = allTasks.length;
    const completed = allTasks.filter(t => t.status === 'completed').length;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('completedTasks').textContent = completed;
    document.getElementById('pendingTasks').textContent = pending;
    document.getElementById('progressPercentage').textContent = rate + '%';

    // Recent tasks list
    const container = document.getElementById('recentTasksList');
    const recent = [...allTasks].slice(0, 5);
    if (recent.length === 0) {
        container.innerHTML = `<div class="empty-state"><div class="icon">📭</div><p>No tasks yet. Click <strong>Add Task</strong> to get started!</p></div>`;
    } else {
        container.innerHTML = recent.map(task => buildTaskCard(task, false)).join('');
    }

    // Dashboard charts
    renderPriorityChart();
    renderSubjectChart();
}

// ============================================================
//  BUILD TASK CARD HTML
// ============================================================
function buildTaskCard(task, showActions = true) {
    const overdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
    const pClass = (task.priority || '').toLowerCase() + '-priority';
    const bClass = 'badge-' + (task.priority || 'medium').toLowerCase();
    const dueTxt = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

    let actionsHTML = '';
    if (showActions) {
        if (task.status !== 'completed') {
            actionsHTML += `<button class="btn-sm btn-done" onclick="updateTaskStatus('${task._id}', 'completed')">✓ Done</button>`;
        }
        if (task.status === 'pending') {
            actionsHTML += `<button class="btn-sm btn-progress" onclick="updateTaskStatus('${task._id}', 'in-progress')">▶ Start</button>`;
        }
        actionsHTML += `<button class="btn-sm" onclick="openEditTaskModal('${task._id}')">✎ Edit</button>`;
        actionsHTML += `<button class="btn-sm btn-delete" onclick="deleteTask('${task._id}')">✕</button>`;
    }

    return `
    <div class="task-card ${pClass}">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
            <span class="badge ${bClass}">${task.priority}</span>
            <span class="badge badge-subject">${task.subject}</span>
            <span class="task-due ${overdue ? 'overdue' : ''}">📅 ${dueTxt}${overdue ? ' ⚠️ Overdue' : ''}</span>
        </div>
        ${actionsHTML ? `<div class="task-actions">${actionsHTML}</div>` : ''}
    </div>`;
}

// ============================================================
//  RENDER TASKS (KANBAN)
// ============================================================
function getFilteredTasks() {
    let tasks = [...allTasks];
    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        tasks = tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
    }
    if (currentFilter !== 'all') tasks = tasks.filter(t => t.status === currentFilter);
    if (priorityFilter) tasks = tasks.filter(t => t.priority === priorityFilter);
    if (subjectFilter) tasks = tasks.filter(t => t.subject === subjectFilter);
    return tasks;
}

function renderAllTasksKanban() {
    const tasks = getFilteredTasks();
    const pending = tasks.filter(t => t.status === 'pending');
    const inProgress = tasks.filter(t => t.status === 'in-progress');
    const completed = tasks.filter(t => t.status === 'completed');

    const renderCol = (items) => items.length === 0
        ? `<div class="empty-state"><div class="icon">📭</div><p>No tasks here</p></div>`
        : items.map(t => buildTaskCard(t)).join('');

    document.getElementById('pendingTasksContainer').innerHTML = renderCol(pending);
    document.getElementById('inProgressTasksContainer').innerHTML = renderCol(inProgress);
    document.getElementById('completedTasksContainer').innerHTML = renderCol(completed);
    document.getElementById('pendingCount').textContent = pending.length;
    document.getElementById('inProgressCount').textContent = inProgress.length;
    document.getElementById('completedCount').textContent = completed.length;
}

// ============================================================
//  FILTERS
// ============================================================
function filterTasks(status, btn) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderAllTasksKanban();
}

function filterByPriority(val) {
    priorityFilter = val;
    renderAllTasksKanban();
}

function filterBySubject(val) {
    subjectFilter = val;
    renderAllTasksKanban();
}

function searchTasks(query) {
    searchQuery = query;
    renderAllTasksKanban();
    if (document.getElementById('dashboardSection').classList.contains('active')) {
        renderDashboard();
    }
}

// ============================================================
//  CHARTS - Dashboard
// ============================================================
function renderPriorityChart() {
    const ctx = document.getElementById('priorityChart');
    if (!ctx) return;
    const high = allTasks.filter(t => t.priority === 'High').length;
    const med = allTasks.filter(t => t.priority === 'Medium').length;
    const low = allTasks.filter(t => t.priority === 'Low').length;

    if (priorityChartInst) priorityChartInst.destroy();
    priorityChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{ data: [high, med, low], backgroundColor: ['#d9534f', '#e8ac3a', '#4caf88'], borderColor: '#fff', borderWidth: 3 }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, color: '#6f4e37' } } }
        }
    });
}

function renderSubjectChart() {
    const ctx = document.getElementById('subjectChart');
    if (!ctx) return;
    const subjectCounts = {};
    allTasks.forEach(t => { subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1; });
    const labels = Object.keys(subjectCounts);
    const data = Object.values(subjectCounts);

    if (subjectChartInst) subjectChartInst.destroy();
    subjectChartInst = new Chart(ctx, {
        type: 'bar',
        data: {
            labels, datasets: [{ label: 'Tasks', data, backgroundColor: '#e07a5f', borderColor: '#8d5b4c', borderWidth: 1, borderRadius: 6 }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, ticks: { color: '#6f4e37' }, grid: { color: '#e8d8c8' } },
                x: { ticks: { color: '#6f4e37' }, grid: { display: false } }
            }
        }
    });
}

// ============================================================
//  ANALYTICS CHARTS
// ============================================================
function initAnalyticsCharts() {
    renderCompletionChart();
    renderTimelineChart();
    renderStatusChart();
    renderPriorityAnalyticsChart();
}

function updateAnalytics() {
    if (document.getElementById('analyticsSection').classList.contains('active')) {
        initAnalyticsCharts();
    }
}

function renderCompletionChart() {
    const ctx = document.getElementById('completionChart');
    if (!ctx) return;

    // Build weekly completion data (last 7 days)
    const days = [];
    const rates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push(dayLabel);
        const createdBefore = allTasks.filter(t => new Date(t.createdAt) <= d);
        const completedBefore = createdBefore.filter(t => t.status === 'completed');
        const rate = createdBefore.length > 0 ? Math.round((completedBefore.length / createdBefore.length) * 100) : 0;
        rates.push(rate);
    }

    if (completionChartInst) completionChartInst.destroy();
    completionChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{ label: 'Completion %', data: rates, borderColor: '#e07a5f', backgroundColor: 'rgba(224,122,95,0.1)', borderWidth: 3, fill: true, tension: 0.4, pointBackgroundColor: '#e07a5f', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5 }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, max: 100, ticks: { color: '#6f4e37' }, grid: { color: '#e8d8c8' } }, x: { ticks: { color: '#6f4e37' }, grid: { display: false } } },
            plugins: { legend: { labels: { color: '#6f4e37' } } }
        }
    });
}

function renderTimelineChart() {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    // Group tasks by creation date (last 7 days)
    const days = [];
    const counts = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        counts.push(allTasks.filter(t => t.createdAt && t.createdAt.split('T')[0] === dayStr).length);
    }

    if (timelineChartInst) timelineChartInst.destroy();
    timelineChartInst = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{ label: 'Tasks Created', data: counts, borderColor: '#f2b591', backgroundColor: 'rgba(242,181,145,0.12)', borderWidth: 3, fill: true, tension: 0.4, pointBackgroundColor: '#f2b591', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5 }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true, ticks: { color: '#6f4e37', stepSize: 1 }, grid: { color: '#e8d8c8' } }, x: { ticks: { color: '#6f4e37' }, grid: { display: false } } },
            plugins: { legend: { labels: { color: '#6f4e37' } } }
        }
    });
}

function renderStatusChart() {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    const pending = allTasks.filter(t => t.status === 'pending').length;
    const inProgress = allTasks.filter(t => t.status === 'in-progress').length;
    const completed = allTasks.filter(t => t.status === 'completed').length;

    if (statusChartInst) statusChartInst.destroy();
    statusChartInst = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pending', 'In Progress', 'Completed'],
            datasets: [{ data: [pending, inProgress, completed], backgroundColor: ['#3b82f6', '#e8ac3a', '#4caf88'], borderColor: '#fff', borderWidth: 3 }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom', labels: { padding: 16, color: '#6f4e37' } } }
        }
    });
}

function renderPriorityAnalyticsChart() {
    const ctx = document.getElementById('priorityAnalyticsChart');
    if (!ctx) return;
    const subjects = [...new Set(allTasks.map(t => t.subject))];
    const highData = subjects.map(s => allTasks.filter(t => t.subject === s && t.priority === 'High').length);
    const medData = subjects.map(s => allTasks.filter(t => t.subject === s && t.priority === 'Medium').length);
    const lowData = subjects.map(s => allTasks.filter(t => t.subject === s && t.priority === 'Low').length);

    if (priorityAnalyticsChartInst) priorityAnalyticsChartInst.destroy();
    priorityAnalyticsChartInst = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects.length ? subjects : ['No Data'],
            datasets: [
                { label: 'High', data: highData.length ? highData : [0], backgroundColor: '#d9534f', borderRadius: 4 },
                { label: 'Medium', data: medData.length ? medData : [0], backgroundColor: '#e8ac3a', borderRadius: 4 },
                { label: 'Low', data: lowData.length ? lowData : [0], backgroundColor: '#4caf88', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, stacked: false, ticks: { color: '#6f4e37', stepSize: 1 }, grid: { color: '#e8d8c8' } },
                x: { ticks: { color: '#6f4e37' }, grid: { display: false } }
            },
            plugins: { legend: { labels: { color: '#6f4e37' } } }
        }
    });
}

// ============================================================
//  CALENDAR
// ============================================================
function initCalendar() {
    renderCalendar();
}

function changeCalendarMonth(direction) {
    calendarMonth += direction;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
}

function renderCalendar() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarTitle').textContent = `${monthNames[calendarMonth]} ${calendarYear}`;

    const grid = document.getElementById('calendarDays');
    // Keep headers
    const headers = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = headers.map(h => `<div class="cal-day-header">${h}</div>`).join('');

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const daysInPrev = new Date(calendarYear, calendarMonth, 0).getDate();
    const today = new Date();

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
        html += `<div class="cal-day other-month"><div class="cal-day-number">${daysInPrev - i}</div></div>`;
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isToday = today.getFullYear() === calendarYear && today.getMonth() === calendarMonth && today.getDate() === day;

        // Find tasks due on this day
        const dayTasks = allTasks.filter(t => {
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth && d.getDate() === day;
        });

        const taskDots = dayTasks.slice(0, 3).map(t =>
            `<div class="cal-task-dot ${(t.priority || '').toLowerCase()}">${escapeHtml(t.title)}</div>`
        ).join('');

        html += `
        <div class="cal-day ${isToday ? 'today' : ''}">
            <div class="cal-day-number">${day}</div>
            ${taskDots}
            ${dayTasks.length > 3 ? `<div style="font-size:10px;color:var(--text-light);">+${dayTasks.length - 3} more</div>` : ''}
        </div>`;
    }

    // Next month padding
    const totalCells = firstDay + daysInMonth;
    const remainder = totalCells % 7;
    if (remainder > 0) {
        for (let i = 1; i <= 7 - remainder; i++) {
            html += `<div class="cal-day other-month"><div class="cal-day-number">${i}</div></div>`;
        }
    }

    grid.innerHTML = html;
}

// ============================================================
//  SETTINGS
// ============================================================
function updateProfile(e) {
    e.preventDefault();
    const name = document.getElementById('settingsName').value.trim();
    if (!name) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.name = name;
    localStorage.setItem('user', JSON.stringify(user));
    document.getElementById('userName').textContent = name;
    document.getElementById('userInitials').textContent = name.charAt(0).toUpperCase();
    showToast('✅ Profile updated!', 'success');
}

function changePassword(e) {
    e.preventDefault();
    const np = document.getElementById('newPassword').value;
    const cp = document.getElementById('confirmPassword').value;
    if (np !== cp) { showToast('Passwords do not match!', 'error'); return; }
    if (np.length < 6) { showToast('Password must be at least 6 characters!', 'error'); return; }
    showToast('✅ Password updated!', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

// ============================================================
//  UTILITY
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
