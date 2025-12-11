class GraveyardPage {
    constructor() {
        this.graveyardItems = [];
        this.init();
    }

    init() {
        this.loadGraveyardItems();
        this.renderGraveyard();
    }

    loadGraveyardItems() {
        // Load graveyard items from localStorage (mock Denodo backend)
        const storedItems = localStorage.getItem('graveyard');
        if (storedItems) {
            this.graveyardItems = JSON.parse(storedItems);
        } else {
            // Initialize empty graveyard
            this.graveyardItems = [];
            this.saveGraveyardItems();
        }
    }

    saveGraveyardItems() {
        localStorage.setItem('graveyard', JSON.stringify(this.graveyardItems));
    }

    renderGraveyard() {
        const graveyardGrid = document.getElementById('graveyard-grid');
        const emptyState = document.getElementById('empty-state');

        if (!graveyardGrid || !emptyState) return;

        if (this.graveyardItems.length === 0) {
            graveyardGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            graveyardGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            
            graveyardGrid.innerHTML = this.graveyardItems.map(item => `
                <div class="graveyard-card" data-id="${item.id}">
                    <div class="graveyard-meta">
                        <span class="graveyard-date">${this.formatDate(item.date)}</span>
                        <span class="graveyard-type">${item.type || 'Project'}</span>
                    </div>
                    <h3 class="graveyard-title">${item.title}</h3>
                    <p class="graveyard-description">${item.description}</p>
                    <div class="graveyard-actions">
                        <button class="resurrect-btn" onclick="graveyardPage.resurrectItem(${item.id})">
                            Resurrect
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    addItem(item) {
        const graveyardItem = {
            ...item,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            type: item.type || 'Project'
        };

        this.graveyardItems.push(graveyardItem);
        this.saveGraveyardItems();
        this.renderGraveyard();
    }

    resurrectItem(itemId) {
        const item = this.graveyardItems.find(i => i.id === itemId);
        if (!item) return;

        // Store the resurrected idea in localStorage
        localStorage.setItem('ideaText', item.description);
        
        // Navigate to resurrect page
        window.location.href = 'resurrect.html';
    }

    showSuccessMessage(message) {
        // Create temporary success notification
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 1002;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Global instance for external access
let graveyardPage;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    graveyardPage = new GraveyardPage();
});

// Global function for external access
window.addToGraveyard = (item) => {
    if (graveyardPage) {
        graveyardPage.addItem(item);
    }
};