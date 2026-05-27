// ============================================================
//  POMODORO TIMER - Full Feature Implementation
//  Dynamic time, short/long breaks, session history, reset
// ============================================================

(function () {
    'use strict';

    // --- State ---
    let pomodoroInterval = null;
    let pomodoroRunning = false;
    let pomodoroSecondsLeft = 25 * 60;
    let pomodoroTotalSeconds = 25 * 60;
    let pomodoroPhase = 'focus'; // 'focus' | 'short-break' | 'long-break'
    let pomodoroSessionStartTime = null;

    const CIRCUMFERENCE = 2 * Math.PI * 100; // 628.318

    // --- localStorage keys ---
    const STORAGE_KEY = 'pomodoroSessions';

    // --- Helpers ---
    function getEl(id) { return document.getElementById(id); }

    function formatTime(totalSec) {
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function todayKey() {
        return new Date().toISOString().split('T')[0];
    }

    // --- Session Persistence ---
    function loadSessions() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
        catch { return []; }
    }

    function saveSessions(sessions) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }

    function addSession(type, durationMin) {
        const sessions = loadSessions();
        sessions.unshift({
            id: Date.now(),
            type,
            duration: durationMin,
            date: todayKey(),
            completedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        });
        saveSessions(sessions);
    }

    // --- UI Updates ---
    function updateDisplay() {
        const timeEl = getEl('pomodoroTimeDisplay');
        const ringEl = getEl('pomodoroRingProgress');
        const phaseEl = getEl('pomodoroPhaseLabel');
        const statusEl = getEl('pomodoroStatus');

        if (timeEl) timeEl.textContent = formatTime(pomodoroSecondsLeft);

        // Ring progress
        if (ringEl) {
            const fraction = pomodoroTotalSeconds > 0
                ? (pomodoroTotalSeconds - pomodoroSecondsLeft) / pomodoroTotalSeconds
                : 0;
            ringEl.setAttribute('stroke-dashoffset', CIRCUMFERENCE * (1 - fraction));

            // Color coding per phase
            const colors = { 'focus': 'var(--primary)', 'short-break': 'var(--success)', 'long-break': '#6366f1' };
            ringEl.setAttribute('stroke', colors[pomodoroPhase] || 'var(--primary)');
        }

        // Phase label
        const labels = { 'focus': 'Focus', 'short-break': 'Short Break', 'long-break': 'Long Break' };
        if (phaseEl) {
            phaseEl.textContent = labels[pomodoroPhase] || 'Focus';
            const labelColors = { 'focus': 'var(--primary)', 'short-break': 'var(--success)', 'long-break': '#6366f1' };
            phaseEl.style.color = labelColors[pomodoroPhase] || 'var(--primary)';
        }

        // Status text
        if (statusEl) {
            if (pomodoroRunning) {
                statusEl.textContent = pomodoroPhase === 'focus' ? '🎯 Stay focused!' : '☕ Take a break...';
            } else if (pomodoroSecondsLeft === 0) {
                statusEl.textContent = '✅ Session complete!';
            } else {
                statusEl.textContent = 'Ready to focus';
            }
        }

        // Start button text
        const btn = getEl('pomodoroStartBtn');
        if (btn) {
            btn.textContent = pomodoroRunning ? '⏸ Pause' : (pomodoroSecondsLeft < pomodoroTotalSeconds && pomodoroSecondsLeft > 0 ? '▶ Resume' : '▶ Start');
        }
    }

    function updateStats() {
        const sessions = loadSessions();
        const today = todayKey();
        const todaySessions = sessions.filter(s => s.date === today && s.type === 'focus');
        const allFocusSessions = sessions.filter(s => s.type === 'focus');
        const totalMinutes = allFocusSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

        const todayEl = getEl('pomodoroTodaySessions');
        const totalEl = getEl('pomodoroTotalTime');
        const allEl = getEl('pomodoroAllSessions');

        if (todayEl) todayEl.textContent = todaySessions.length;
        if (totalEl) {
            if (totalMinutes >= 60) {
                const hrs = Math.floor(totalMinutes / 60);
                const mins = totalMinutes % 60;
                totalEl.textContent = `${hrs}h ${mins}m`;
            } else {
                totalEl.textContent = `${totalMinutes} min`;
            }
        }
        if (allEl) allEl.textContent = allFocusSessions.length;
    }

    function renderHistory() {
        const container = getEl('pomodoroHistoryList');
        if (!container) return;

        const sessions = loadSessions();

        if (sessions.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:32px;color:var(--text-light);">
                    <div style="font-size:40px;margin-bottom:8px;">🍅</div>
                    <p>No sessions yet. Start your first Pomodoro!</p>
                </div>`;
            return;
        }

        // Group by date
        const grouped = {};
        sessions.forEach(s => {
            if (!grouped[s.date]) grouped[s.date] = [];
            grouped[s.date].push(s);
        });

        let html = '';
        Object.keys(grouped).forEach(date => {
            const d = new Date(date + 'T00:00:00');
            const label = date === todayKey() ? 'Today' :
                (date === (() => { const y = new Date(); y.setDate(y.getDate() - 1); return y.toISOString().split('T')[0]; })() ? 'Yesterday' :
                    d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));

            html += `<div style="font-size:12px;font-weight:700;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;padding:10px 0 6px;border-bottom:1px solid var(--border);margin-bottom:6px;">${label}</div>`;

            grouped[date].forEach(s => {
                const icons = { 'focus': '🍅', 'short-break': '☕', 'long-break': '🌴' };
                const typeLabels = { 'focus': 'Focus', 'short-break': 'Short Break', 'long-break': 'Long Break' };
                const bgColors = { 'focus': 'var(--primary-light)', 'short-break': '#ecfdf5', 'long-break': '#eef2ff' };
                const textColors = { 'focus': 'var(--primary)', 'short-break': 'var(--success)', 'long-break': '#6366f1' };

                html += `
                <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;margin-bottom:4px;background:${bgColors[s.type] || 'var(--primary-light)'};">
                    <span style="font-size:22px;">${icons[s.type] || '🍅'}</span>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:13px;color:var(--text-dark);">${typeLabels[s.type] || s.type}</div>
                        <div style="font-size:11px;color:var(--text-light);">${s.duration} min • ${s.completedAt}</div>
                    </div>
                    <span style="font-size:11px;font-weight:600;color:${textColors[s.type] || 'var(--primary)'};background:white;padding:3px 10px;border-radius:20px;">${s.duration}m</span>
                </div>`;
            });
        });

        container.innerHTML = html;
    }

    // --- Audio notification ---
    function playAlertSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.15);
                osc.stop(ctx.currentTime + i * 0.15 + 0.4);
            });
        } catch (e) { /* silent fallback */ }
    }

    // --- Timer Core ---
    function tick() {
        if (pomodoroSecondsLeft <= 0) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            pomodoroRunning = false;

            // Calculate actual duration
            const durationMin = Math.round(pomodoroTotalSeconds / 60);
            addSession(pomodoroPhase, durationMin);

            playAlertSound();
            updateDisplay();
            updateStats();
            renderHistory();

            // Show toast if available
            if (typeof showToast === 'function') {
                const msg = pomodoroPhase === 'focus'
                    ? '🍅 Focus session complete! Great work!'
                    : '☕ Break is over. Ready for another round?';
                showToast(msg, 'success');
            }
            return;
        }
        pomodoroSecondsLeft--;
        updateDisplay();
    }

    // --- Public API (attached to window) ---
    window.pomodoroToggle = function () {
        if (pomodoroRunning) {
            // Pause
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            pomodoroRunning = false;
        } else {
            // Start / Resume
            if (pomodoroSecondsLeft <= 0) {
                // If timer already ended, reset to current focus time
                pomodoroSetCustomTime();
            }
            pomodoroRunning = true;
            pomodoroSessionStartTime = Date.now();
            pomodoroInterval = setInterval(tick, 1000);
        }
        updateDisplay();
    };

    window.pomodoroSetCustomTime = function () {
        if (pomodoroRunning) return; // don't change while running
        const input = getEl('pomodoroFocusInput');
        const mins = input ? parseInt(input.value, 10) : 25;
        if (isNaN(mins) || mins < 1) return;
        pomodoroPhase = 'focus';
        pomodoroTotalSeconds = mins * 60;
        pomodoroSecondsLeft = pomodoroTotalSeconds;
        updateDisplay();
    };

    window.pomodoroShortBreak = function () {
        if (pomodoroRunning) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            pomodoroRunning = false;
        }
        const input = getEl('pomodoroShortBreakInput');
        const mins = input ? parseInt(input.value, 10) : 5;
        pomodoroPhase = 'short-break';
        pomodoroTotalSeconds = (isNaN(mins) || mins < 1 ? 5 : mins) * 60;
        pomodoroSecondsLeft = pomodoroTotalSeconds;
        updateDisplay();
        // Auto-start
        pomodoroRunning = true;
        pomodoroSessionStartTime = Date.now();
        pomodoroInterval = setInterval(tick, 1000);
        updateDisplay();
    };

    window.pomodoroLongBreak = function () {
        if (pomodoroRunning) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            pomodoroRunning = false;
        }
        const input = getEl('pomodoroLongBreakInput');
        const mins = input ? parseInt(input.value, 10) : 10;
        pomodoroPhase = 'long-break';
        pomodoroTotalSeconds = (isNaN(mins) || mins < 1 ? 10 : mins) * 60;
        pomodoroSecondsLeft = pomodoroTotalSeconds;
        updateDisplay();
        // Auto-start
        pomodoroRunning = true;
        pomodoroSessionStartTime = Date.now();
        pomodoroInterval = setInterval(tick, 1000);
        updateDisplay();
    };

    window.pomodoroReset = function () {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        pomodoroRunning = false;
        pomodoroPhase = 'focus';
        const input = getEl('pomodoroFocusInput');
        const mins = input ? parseInt(input.value, 10) : 25;
        pomodoroTotalSeconds = (isNaN(mins) || mins < 1 ? 25 : mins) * 60;
        pomodoroSecondsLeft = pomodoroTotalSeconds;
        updateDisplay();
    };

    window.pomodoroClearHistory = function () {
        if (!confirm('Clear all Pomodoro session history?')) return;
        saveSessions([]);
        updateStats();
        renderHistory();
        if (typeof showToast === 'function') showToast('🗑️ History cleared.', 'success');
    };

    // --- Init on page load ---
    document.addEventListener('DOMContentLoaded', () => {
        updateDisplay();
        updateStats();
        renderHistory();
    });

})();
