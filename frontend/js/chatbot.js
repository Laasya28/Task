// ============================================================
//  AI CHATBOT ASSISTANT - Premium Interactive JS
// ============================================================

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const fab = document.getElementById('chatbotFab');
        const win = document.getElementById('chatbotWindow');
        const closeBtn = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const msgContainer = document.getElementById('chatbotMessages');

        if (!fab || !win || !closeBtn || !sendBtn || !input || !msgContainer) return;

        // Toggle chatbot window
        fab.addEventListener('click', () => {
            const isHidden = win.classList.contains('hidden');
            if (isHidden) {
                win.classList.remove('hidden');
                // Focus input
                setTimeout(() => input.focus(), 100);
                // Render initial message if empty
                if (msgContainer.children.length === 0) {
                    addBotMessage("👋 Hello! I'm your **TaskMaster AI**. I can help you analyze your study tasks, prioritize deadlines, or suggest what to work on next. Ask me anything like *'What should I do first?'* or *'Show my overdue tasks'!");
                }
            } else {
                win.classList.add('hidden');
            }
        });

        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            win.classList.add('hidden');
        });

        // Close on escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !win.classList.contains('hidden')) {
                win.classList.add('hidden');
            }
        });

        // Send message handlers
        sendBtn.addEventListener('click', handleSend);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });

        function handleSend() {
            const text = input.value.trim();
            if (!text) return;

            addUserMessage(text);
            input.value = '';

            // Show typing indicator
            const typingId = showTypingIndicator();

            setTimeout(() => {
                removeTypingIndicator(typingId);
                const reply = generateBotReply(text);
                addBotMessage(reply);
            }, 800 + Math.random() * 600); // realistic delay
        }

        // --- UI Message Adders ---
        function addUserMessage(text) {
            const div = document.createElement('div');
            div.className = 'chat-message user';
            div.textContent = text;
            msgContainer.appendChild(div);
            scrollToBottom();
        }

        function addBotMessage(markdownText) {
            const div = document.createElement('div');
            div.className = 'chat-message bot';
            div.innerHTML = parseMiniMarkdown(markdownText);
            msgContainer.appendChild(div);
            scrollToBottom();
        }

        function showTypingIndicator() {
            const div = document.createElement('div');
            const id = 'typing_' + Date.now();
            div.id = id;
            div.className = 'chat-message bot';
            div.style.fontStyle = 'italic';
            div.style.color = 'var(--text-light)';
            div.textContent = 'AI is thinking...';
            msgContainer.appendChild(div);
            scrollToBottom();
            return id;
        }

        function removeTypingIndicator(id) {
            const el = document.getElementById(id);
            if (el) el.remove();
        }

        function scrollToBottom() {
            msgContainer.scrollTop = msgContainer.scrollHeight;
        }

        // --- Mini Markdown Parser ---
        function parseMiniMarkdown(text) {
            if (!text) return '';
            // Escape HTML first to prevent XSS
            let html = text
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            // Bold **bold text**
            html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Italic *italic text*
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            // Linebreaks
            html = html.replace(/\n/g, '<br>');
            
            return html;
        }

        // --- Smart Reply Generator ---
        function generateBotReply(query) {
            const q = query.toLowerCase();
            const tasks = window.allTasks || [];

            // 1. Overdue tasks
            if (q.includes('overdue') || q.includes('late') || q.includes('missed')) {
                const overdue = tasks.filter(t => t.status !== 'completed' && new Date(t.dueDate) < new Date());
                if (overdue.length === 0) {
                    return "🎉 Outstanding! You have **0 overdue tasks**. Keep up the amazing momentum!";
                }
                let list = overdue.map(t => `• **${t.title}** (Due: ${new Date(t.dueDate).toLocaleDateString()})`).join('\n');
                return `⚠️ You have **${overdue.length} overdue task(s)** that need immediate attention:\n\n${list}\n\nWould you like me to suggest which one to tackle first?`;
            }

            // 2. Suggestions / What to do first
            if (q.includes('suggest') || q.includes('what should i do') || q.includes('priority') || q.includes('todo first')) {
                const pending = tasks.filter(t => t.status !== 'completed');
                if (pending.length === 0) {
                    return "🧘 All caught up! You have **no pending tasks**. This is a great time to start a **Pomodoro session** to review previous lessons or relax!";
                }

                // Sort by: Overdue first, then High priority, then soonest due date
                const sorted = [...pending].sort((a, b) => {
                    const aOverdue = new Date(a.dueDate) < new Date();
                    const bOverdue = new Date(b.dueDate) < new Date();
                    if (aOverdue && !bOverdue) return -1;
                    if (!aOverdue && bOverdue) return 1;

                    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    const diff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
                    if (diff !== 0) return diff;

                    return new Date(a.dueDate) - new Date(b.dueDate);
                });

                const top = sorted[0];
                const overdueStr = new Date(top.dueDate) < new Date() ? "⚠️ **OVERDUE**" : "";
                return `💡 Based on deadlines and priorities, here is my **Smart Suggestion**:\n\n🥇 **Focus on**: **${top.title}**\n• Priority: **${top.priority}**\n• Category: *${top.subject}*\n• Deadline: ${new Date(top.dueDate).toLocaleString()} ${overdueStr}\n\nFocusing on one high-impact task is the key to deep learning. Want to set a **Pomodoro timer** for 25 minutes and get started?`;
            }

            // 3. List all pending / status overview
            if (q.includes('list') || q.includes('show tasks') || q.includes('pending') || q.includes('my tasks')) {
                const pending = tasks.filter(t => t.status !== 'completed');
                if (pending.length === 0) {
                    return "✨ Your study list is **completely clean**! Enjoy your free time or add a new task using the button above.";
                }
                const high = pending.filter(t => t.priority === 'High').length;
                let list = pending.slice(0, 5).map(t => `• [${t.priority}] **${t.title}** (${t.subject})`).join('\n');
                if (pending.length > 5) {
                    list += `\n*...and ${pending.length - 5} more pending task(s).*`;
                }
                return `📋 You have **${pending.length} pending task(s)** in your list (${high} high priority):\n\n${list}\n\nType *'suggest'* if you'd like me to pick the best starting point for you!`;
            }

            // 4. Greetings
            if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('greetings')) {
                return "👋 Hello there! Ready to crush your study goals today? Tell me what you're working on, or ask me for a **smart task suggestion**!";
            }

            // 5. Help / Capabilities
            if (q.includes('help') || q.includes('what can you do') || q.includes('features')) {
                return "🤖 Here is what I can help you with:\n\n1️⃣ **Smart Suggestions**: Type *'suggest'* to get the highest-priority starting task.\n2️⃣ **Task Auditing**: Type *'overdue'* or *'list'* to see what is outstanding.\n3️⃣ **Deadlines**: Ask me about upcoming due dates.\n4️⃣ **Motivation**: Ask for a quick boost or study advice!";
            }

            // 6. Clear chat
            if (q.includes('clear') || q.includes('reset chat')) {
                msgContainer.innerHTML = '';
                return "🧹 Chat history cleared. Ready for a new discussion!";
            }

            // 7. Motivational boost
            if (q.includes('motivate') || q.includes('tired') || q.includes('hard') || q.includes('stuck') || q.includes('quote')) {
                const motivations = [
                    "🚀 *'The secret of getting ahead is getting started.'* Take it one small step at a time!",
                    "🔥 You've got this! Don't look at the whole mountain; just focus on the next step. Let's start with a single task!",
                    "💡 Remind yourself why you started. Every task completed brings you closer to your academic dreams!",
                    "☕ It is totally okay to take breaks! Remember that a 25-minute focused study block followed by a 5-minute Pomodoro break works wonders."
                ];
                return motivations[Math.floor(Math.random() * motivations.length)];
            }

            // 8. General fallback responses
            const fallbackOptions = [
                "I can analyze your deadlines for you! Type **'overdue'** to check for missed targets, or **'suggest'** to see what task you should start right now.",
                "Let's stay productive! 🎯 You can ask me to **'list tasks'** to get a summary of what's currently pending in your Kanban board.",
                "Interesting question! As your study buddy, I recommend organizing your list. Type **'suggest'** to let me help you pick the best starting point!"
            ];
            return fallbackOptions[Math.floor(Math.random() * fallbackOptions.length)];
        }
    });
})();
