class HistoryPage {
    constructor() {
        this.historyItems = [];
        this.init();
    }

    init() {
        this.loadHistory();
        this.renderHistory();
    }

    loadHistory() {
        // Load chat history from localStorage (mock Denodo backend)
        const storedHistory = localStorage.getItem('chatHistory');
        if (storedHistory) {
            this.historyItems = JSON.parse(storedHistory);
        } else {
            // Initialize empty history
            this.historyItems = [];
            this.saveHistory();
        }
    }

    saveHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.historyItems));
    }

    renderHistory() {
        const historyGrid = document.getElementById('history-grid');
        const emptyState = document.getElementById('empty-state');

        if (!historyGrid || !emptyState) return;

        if (this.historyItems.length === 0) {
            historyGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            historyGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            
            // Render history items (placeholder for now)
            historyGrid.innerHTML = '<p style="color: #cccccc; text-align: center; grid-column: 1 / -1;">Chat history functionality coming soon...</p>';
        }
    }

    addHistoryItem(item) {
        const historyItem = {
            ...item,
            id: Date.now(),
            timestamp: new Date().toISOString()
        };

        this.historyItems.unshift(historyItem); // Add to beginning
        this.saveHistory();
        this.renderHistory();
    }
}

// Global instance for external access
let historyPage;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    historyPage = new HistoryPage();
});

// Global function for external access
window.addToHistory = (item) => {
    if (historyPage) {
        historyPage.addHistoryItem(item);
    }
};