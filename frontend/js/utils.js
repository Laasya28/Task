// Utility functions for the application

// Format Date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format Time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get Priority Color
function getPriorityColor(priority) {
    const colors = {
        'High': '#ef4444',
        'Medium': '#f59e0b',
        'Low': '#10b981'
    };
    return colors[priority] || '#8b5cf6';
}

// Get Priority Badge Class
function getPriorityBadgeClass(priority) {
    const classes = {
        'High': 'badge-high',
        'Medium': 'badge-medium',
        'Low': 'badge-low'
    };
    return classes[priority] || 'badge-medium';
}

// Get Status Icon
function getStatusIcon(status) {
    const icons = {
        'pending': '○',
        'in-progress': '⏳',
        'completed': '✓'
    };
    return icons[status] || '○';
}

// Get Status Color
function getStatusColor(status) {
    const colors = {
        'pending': '#3b82f6',
        'in-progress': '#f59e0b',
        'completed': '#10b981'
    };
    return colors[status] || '#3b82f6';
}

// Debounce Function
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Show Toast Notification
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white font-semibold alert alert-${type} fade-in z-50`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, duration);
}

// Validate Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate Password
function validatePassword(password) {
    return password.length >= 6;
}

// Truncate Text
function truncateText(text, length = 50) {
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Get Days Until Due Date
function getDaysUntilDue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Get Priority Level Number
function getPriorityLevel(priority) {
    const levels = {
        'High': 3,
        'Medium': 2,
        'Low': 1
    };
    return levels[priority] || 0;
}

// Sort Tasks
function sortTasks(tasks, sortBy) {
    const sorted = [...tasks];
    
    switch(sortBy) {
        case 'dueDate':
            sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
        case 'priority':
            sorted.sort((a, b) => getPriorityLevel(b.priority) - getPriorityLevel(a.priority));
            break;
        case 'created':
            sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        default:
            break;
    }
    
    return sorted;
}

// Get Statistics
function getTaskStatistics(tasks) {
    return {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        pending: tasks.filter(t => t.status === 'pending').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0
    };
}

// Export as CSV
function exportTasksAsCSV(tasks) {
    let csv = 'Title,Description,Priority,Subject,Status,Due Date,Created At\n';
    
    tasks.forEach(task => {
        const row = [
            `"${task.title.replace(/"/g, '""')}"`,
            `"${task.description.replace(/"/g, '""')}"`,
            task.priority,
            task.subject,
            task.status,
            formatDate(task.dueDate),
            formatDate(task.createdAt)
        ];
        csv += row.join(',') + '\n';
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
    element.style.display = 'none';

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Calculate Productivity Score
function calculateProductivityScore(stats) {
    let score = 0;
    
    // Completion rate (40%)
    score += stats.completionRate * 0.4;
    
    // Task consistency (30%)
    // More tasks = higher score, capped at 100
    const taskConsistency = Math.min((stats.total / 20) * 100, 100);
    score += taskConsistency * 0.3;
    
    // On-time completion (30%)
    // This would need to be calculated based on actual due dates
    score += 30; // Default 30
    
    return Math.round(score);
}

// Get Task Category Color
function getCategoryColor(subject) {
    const colors = {
        'Mathematics': '#3b82f6',
        'Science': '#8b5cf6',
        'English': '#ec4899',
        'History': '#f59e0b',
        'Geography': '#10b981',
        'Computer Science': '#06b6d4',
        'Arts': '#f97316',
        'Physical Education': '#ef4444',
        'Other': '#6b7280'
    };
    return colors[subject] || '#6b7280';
}

// Animate Number
function animateNumber(element, start, end, duration = 1000) {
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    update();
}

// Get Welcome Message
function getWelcomeMessage(hour = new Date().getHours()) {
    if (hour < 12) return 'Good morning! 🌅';
    if (hour < 18) return 'Good afternoon! 🌤️';
    return 'Good evening! 🌙';
}

// Check if task is overdue
function isTaskOverdue(task) {
    if (task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today;
}

// Format task duration
function formatDuration(minutes) {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
