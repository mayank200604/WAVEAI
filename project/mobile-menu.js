// Mobile Menu Utility for Wave AI
// Adds hamburger menu to all pages

class MobileMenuManager {
    constructor() {
        this.init();
    }

    init() {
        this.addMobileMenuButton();
        this.addMobileMenuStyles();
    }

    addMobileMenuButton() {
        // Check if mobile menu button already exists
        if (document.getElementById('mobile-menu-toggle')) {
            return;
        }

        // Create mobile menu button
        const mobileButton = document.createElement('button');
        mobileButton.id = 'mobile-menu-toggle';
        mobileButton.className = 'mobile-menu-toggle';
        mobileButton.style.display = 'none';
        mobileButton.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
        `;

        // Insert at the beginning of body
        document.body.insertBefore(mobileButton, document.body.firstChild);

        // Update main content padding for mobile
        this.updateMainContentPadding();
    }

    addMobileMenuStyles() {
        // Check if styles already exist
        if (document.getElementById('mobile-menu-styles')) {
            return;
        }

        const styles = document.createElement('style');
        styles.id = 'mobile-menu-styles';
        styles.textContent = `
            /* Mobile Menu Toggle */
            .mobile-menu-toggle {
                position: fixed;
                top: 1rem;
                left: 1rem;
                z-index: 1001;
                background: #009DFF;
                border: none;
                border-radius: 8px;
                padding: 0.75rem;
                cursor: pointer;
                color: white;
                box-shadow: 0 4px 12px rgba(0, 157, 255, 0.3);
                transition: all 0.3s ease;
            }

            .mobile-menu-toggle:hover {
                background: #0891b2;
                transform: scale(1.05);
                box-shadow: 0 6px 20px rgba(0, 157, 255, 0.4);
            }

            .mobile-menu-toggle svg {
                width: 20px;
                height: 20px;
            }

            @media (max-width: 768px) {
                .mobile-menu-toggle {
                    display: block !important;
                }

                .main-content {
                    padding-top: 80px !important;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    updateMainContentPadding() {
        // Add mobile padding to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            // Add mobile-responsive class
            mainContent.classList.add('mobile-responsive-content');
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileMenuManager();
});

// Export for manual initialization
window.MobileMenuManager = MobileMenuManager;
