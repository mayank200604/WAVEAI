class SidebarManager {
    constructor() {
        this.isExpanded = false;
        this.isMobile = window.innerWidth <= 768;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.handleResize();
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
        const overlay = document.getElementById('sidebar-overlay');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggle());
        }

        if (mobileToggleBtn) {
            mobileToggleBtn.addEventListener('click', () => this.toggle());
        }

        if (overlay) {
            overlay.addEventListener('click', () => this.close());
        }

        const profileIndicator = document.querySelector('.profile-indicator');
        if (profileIndicator) {
            profileIndicator.addEventListener('click', () => {
                if (this.isMobile) {
                    this.close();
                }
            });
        }

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMobile && this.isExpanded) {
                this.close();
            }
        });
    }

    toggle() {
        this.isExpanded = !this.isExpanded;
        this.updateSidebar();
    }

    close() {
        if (this.isMobile) {
            this.isExpanded = false;
            this.updateSidebar();
        }
    }

    updateSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const mainContent = document.querySelector('.main-content');

        if (!sidebar) return;

        if (this.isMobile) {
            // Mobile behavior
            if (this.isExpanded) {
                sidebar.classList.add('mobile-open');
                overlay?.classList.add('active');
            } else {
                sidebar.classList.remove('mobile-open');
                overlay?.classList.remove('active');
            }
        } else {
            // Desktop behavior
            if (this.isExpanded) {
                sidebar.classList.add('expanded');
                if (mainContent) {
                    mainContent.style.marginLeft = '220px';
                }
            } else {
                sidebar.classList.remove('expanded');
                if (mainContent) {
                    mainContent.style.marginLeft = '60px';
                }
            }
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            // Reset sidebar state when switching between mobile/desktop
            const sidebar = document.getElementById('sidebar');
            const overlay = document.getElementById('sidebar-overlay');
            const mainContent = document.querySelector('.main-content');

            if (sidebar) {
                sidebar.classList.remove('mobile-open', 'expanded');
            }
            if (overlay) {
                overlay.classList.remove('active');
            }
            if (mainContent) {
                mainContent.style.marginLeft = this.isMobile ? '0' : '60px';
            }
            
            this.isExpanded = false;
        }
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SidebarManager();
});

// Export for use in other scripts
window.SidebarManager = SidebarManager;