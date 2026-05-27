// Chart instances
let priorityChart, subjectChart, completionChart, timelineChart;

// Initialize Charts
function initializeCharts() {
    initPriorityChart();
    initSubjectChart();
    initCompletionChart();
    initTimelineChart();
}

// Initialize Priority Chart
function initPriorityChart() {
    const ctx = document.getElementById('priorityChart');
    if (!ctx) return;

    if (priorityChart) priorityChart.destroy();

    priorityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 },
                        padding: 15,
                        color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1f2937'
                    }
                }
            }
        }
    });
}

// Initialize Subject Chart
function initSubjectChart() {
    const ctx = document.getElementById('subjectChart');
    if (!ctx) return;

    if (subjectChart) subjectChart.destroy();

    subjectChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'Tasks',
                data: [],
                backgroundColor: '#8b5cf6',
                borderColor: '#6d28d9',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#a1a5b4' : '#6b7280'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f0f0f0'
                    }
                },
                x: {
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#a1a5b4' : '#6b7280'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Initialize Completion Chart
function initCompletionChart() {
    const ctx = document.getElementById('completionChart');
    if (!ctx) return;

    if (completionChart) completionChart.destroy();

    completionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Completion Rate (%)',
                data: [],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#a1a5b4' : '#6b7280'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f0f0f0'
                    }
                },
                x: {
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#a1a5b4' : '#6b7280'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Initialize Timeline Chart
function initTimelineChart() {
    const ctx = document.getElementById('timelineChart');
    if (!ctx) return;

    if (timelineChart) timelineChart.destroy();

    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Tasks Created',
                data: [],
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ec4899',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1f2937'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#a1a5b4' : '#6b7280'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#1e293b' : '#f0f0f0'
                    }
                },
                x: {
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#a1a5b4' : '#6b7280'
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Update Charts Data
function updateChartsData(priorityData, subjectData) {
    // Priority Chart
    if (priorityChart) {
        const priorityCounts = { 'High': 0, 'Medium': 0, 'Low': 0 };
        priorityData.forEach(item => {
            if (item._id) priorityCounts[item._id] = item.count;
        });
        priorityChart.data.datasets[0].data = [priorityCounts['High'], priorityCounts['Medium'], priorityCounts['Low']];
        priorityChart.update();
    }

    // Subject Chart
    if (subjectChart) {
        const subjects = [];
        const counts = [];
        subjectData.forEach(item => {
            if (item._id) {
                subjects.push(item._id);
                counts.push(item.count);
            }
        });
        subjectChart.data.labels = subjects;
        subjectChart.data.datasets[0].data = counts;
        subjectChart.update();
    }
}
