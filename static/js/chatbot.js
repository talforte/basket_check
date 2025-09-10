/**
 * Chatbot functionality for Basket Check
 */

class ChatBot {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.chatForm = document.getElementById('chat-form');
        this.sendBtn = document.getElementById('send-btn');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.statusIndicator = document.getElementById('status-indicator');
        this.clearChatBtn = document.getElementById('clear-chat');
        this.quickQuestions = document.querySelectorAll('.quick-q');
        
        this.isTyping = false;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeChat();
        this.setupKeyboardShortcuts();
        this.checkServerConnection();
    }
    
    setupEventListeners() {
        // Form submission
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const question = this.chatInput.value.trim();
            if (question) {
                this.sendMessage(question);
            }
        });
        
        // Quick questions
        this.quickQuestions.forEach(btn => {
            btn.addEventListener('click', () => {
                const question = btn.dataset.q;
                this.chatInput.value = question;
                this.sendMessage(question);
            });
        });
        
        // Clear chat
        this.clearChatBtn.addEventListener('click', () => {
            this.clearChat();
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Enter to send (only if input is focused)
            if (e.key === 'Enter' && document.activeElement === this.chatInput) {
                e.preventDefault();
                this.chatForm.dispatchEvent(new Event('submit'));
            }
            
            // Escape to clear input
            if (e.key === 'Escape') {
                this.chatInput.value = '';
                this.chatInput.focus();
            }
        });
    }
    
    initializeChat() {
        this.scrollToBottom();
        this.chatInput.focus();
    }
    
    async checkServerConnection() {
        setTimeout(async () => {
            try {
                await fetch('/api/chatbot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: 'test' })
                });
            } catch (error) {
                this.updateStatus('warning', 'בדיקת חיבור...');
            }
        }, 1000);
    }
    
    addMessage(content, isUser = false, sources = null, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const time = new Date().toLocaleTimeString('he-IL', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        let sourcesHtml = '';
        if (sources && sources.length > 0) {
            sourcesHtml = `
                <div class="sources">
                    <small>מקורות:</small><br>
                    ${sources.map(s => `<span class="source-item">${s.source} עמ' ${s.page}</span>`).join('')}
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${isUser ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble ${isError ? 'error-message' : ''}">
                    ${content}
                    ${sourcesHtml}
                </div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    showTyping() {
        if (!this.isTyping) {
            this.typingIndicator.style.display = 'flex';
            this.isTyping = true;
            this.scrollToBottom();
        }
    }
    
    hideTyping() {
        this.typingIndicator.style.display = 'none';
        this.isTyping = false;
    }
    
    updateStatus(status, text) {
        this.statusIndicator.className = `badge bg-${status}`;
        this.statusIndicator.textContent = text;
    }
    
    async sendMessage(question) {
        if (!question.trim()) return;
        
        // Add user message
        this.addMessage(question, true);
        this.chatInput.value = '';
        
        // Show typing indicator
        this.showTyping();
        this.updateStatus('warning', 'עונה...');
        
        // Disable input while processing
        this.chatInput.disabled = true;
        this.sendBtn.disabled = true;
        
        try {
            const response = await fetch('/api/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: question })
            });
            
            const data = await response.json();
            
            this.hideTyping();
            
            if (response.ok) {
                this.addMessage(data.answer, false, data.sources);
                this.updateStatus('success', 'מחובר');
            } else {
                this.addMessage(data.error || 'שגיאה לא ידועה', false, null, true);
                this.updateStatus('danger', 'שגיאה');
            }
            
        } catch (error) {
            this.hideTyping();
            this.addMessage('שגיאה בתקשורת עם השרת', false, null, true);
            this.updateStatus('danger', 'לא מחובר');
            console.error('Chatbot Error:', error);
        } finally {
            // Re-enable input
            this.chatInput.disabled = false;
            this.sendBtn.disabled = false;
            this.chatInput.focus();
        }
    }
    
    clearChat() {
        if (confirm('האם אתה בטוח שברצונך לנקות את השיחה?')) {
            // Keep the first bot message
            const firstMessage = this.chatMessages.querySelector('.message');
            this.chatMessages.innerHTML = '';
            if (firstMessage) {
                this.chatMessages.appendChild(firstMessage);
            }
            
            // Show success toast
            if (window.BasketCheckApp) {
                BasketCheckApp.showToast('השיחה נוקתה בהצלחה', 'success');
            }
        }
    }
    
    // Utility methods
    formatMessage(text) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
        
        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    addSystemMessage(content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message system-message text-center';
        messageDiv.innerHTML = `
            <div class="w-100">
                <small class="text-muted">${content}</small>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    // Export chat history
    exportChat() {
        const messages = Array.from(this.chatMessages.querySelectorAll('.message:not(.system-message)'));
        const chatHistory = messages.map(msg => {
            const isUser = msg.classList.contains('user-message');
            const content = msg.querySelector('.message-bubble').textContent.trim();
            const time = msg.querySelector('.message-time').textContent;
            
            return {
                type: isUser ? 'user' : 'bot',
                content: content,
                time: time
            };
        });
        
        const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.chatBot = new ChatBot();
});

// Add some CSS for system messages
const systemMessageStyles = `
    .system-message {
        margin: 10px 0 !important;
        opacity: 0.7;
    }
    
    .message-bubble a {
        color: inherit;
        text-decoration: underline;
    }
    
    .user-message .message-bubble a {
        color: rgba(255, 255, 255, 0.9);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = systemMessageStyles;
document.head.appendChild(styleSheet);