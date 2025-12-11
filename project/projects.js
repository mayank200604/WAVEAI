class ProjectsPage {
    constructor() {
        this.projects = [];
        this.init();
    }

    init() {
        this.loadProjects();
        this.setupEventListeners();
        this.renderProjects();
    }

    loadProjects() {
        // Load projects from localStorage (mock Denodo backend)
        const storedProjects = localStorage.getItem('projects');
        if (storedProjects) {
            this.projects = JSON.parse(storedProjects);
        } else {
            // Initialize with sample projects
            this.projects = [
                {
                    id: 1,
                    title: "AI-Powered Task Manager",
                    description: "Intelligent task management system with predictive scheduling and automated workflow optimization for modern teams.",
                    date: "2025-01-15",
                    status: "Active"
                },
                {
                    id: 2,
                    title: "Smart Learning Platform",
                    description: "Adaptive learning environment that personalizes content delivery based on individual learning patterns and preferences.",
                    date: "2025-01-14",
                    status: "Active"
                }
            ];
            this.saveProjects();
        }
    }

    saveProjects() {
        localStorage.setItem('projects', JSON.stringify(this.projects));
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        const emptyState = document.getElementById('empty-state');

        if (!projectsGrid || !emptyState) return;

        if (this.projects.length === 0) {
            projectsGrid.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            projectsGrid.style.display = 'grid';
            emptyState.style.display = 'none';
            
            projectsGrid.innerHTML = this.projects.map(project => `
                <div class="project-card" data-id="${project.id}">
                    <div class="project-meta">
                        <span class="project-date">${this.formatDate(project.date)}</span>
                        <span class="project-status">${project.status}</span>
                    </div>
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-actions">
                        <button class="store-btn" onclick="projectsPage.storeToGraveyard(${project.id})">
                            Store
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

    setupEventListeners() {
        // Add Project Button
        const addProjectBtn = document.getElementById('add-project-btn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => this.openAddModal());
        }

        // Modal Close
        const modalClose = document.getElementById('modal-close');
        const modal = document.getElementById('add-project-modal');
        const cancelBtn = document.getElementById('cancel-btn');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeAddModal());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.closeAddModal());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAddModal();
                }
            });
        }

        // Form Submit
        const projectForm = document.getElementById('project-form');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddModal();
            }
        });
    }

    openAddModal() {
        const modal = document.getElementById('add-project-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus on title input
            setTimeout(() => {
                const titleInput = document.getElementById('project-title');
                if (titleInput) {
                    titleInput.focus();
                }
            }, 300);
        }
    }

    closeAddModal() {
        const modal = document.getElementById('add-project-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Reset form
            const form = document.getElementById('project-form');
            if (form) {
                form.reset();
            }
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('project-title');
        const descriptionInput = document.getElementById('project-description');
        
        if (!titleInput || !descriptionInput) return;

        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();

        if (!title || !description) {
            alert('Please fill in all fields');
            return;
        }

        // Create new project
        const newProject = {
            id: Date.now(),
            title: title,
            description: description,
            date: new Date().toISOString().split('T')[0],
            status: 'Active'
        };

        // Mock API call to Denodo backend
        this.mockApiCall('/api/projects', 'POST', newProject)
            .then(() => {
                this.projects.push(newProject);
                this.saveProjects();
                this.renderProjects();
                this.closeAddModal();
                
                // Show success feedback
                this.showSuccessMessage('Project added successfully!');
            })
            .catch(error => {
                console.error('Failed to save project:', error);
                alert('Failed to save project. Please try again.');
            });
    }

    storeToGraveyard(projectId) {
        const project = this.projects.find(p => p.id === projectId);
        if (!project) return;

        // Mock API call to store in graveyard
        this.mockApiCall('/api/graveyard', 'POST', project)
            .then(() => {
                // Remove from projects
                this.projects = this.projects.filter(p => p.id !== projectId);
                this.saveProjects();
                this.renderProjects();
                
                // Show success feedback
                this.showSuccessMessage('Project stored in graveyard!');
            })
            .catch(error => {
                console.error('Failed to store project:', error);
                alert('Failed to store project. Please try again.');
            });
    }

    mockApiCall(endpoint, method, data) {
        // Simulate API call with delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                console.log(`Mock API call: ${method} ${endpoint}`, data);
                
                // Simulate success (95% of the time)
                if (Math.random() > 0.05) {
                    resolve({ success: true, data });
                } else {
                    reject(new Error('Network error'));
                }
            }, 500 + Math.random() * 1000);
        });
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

    // Method to be called when user saves from Build page
    addProjectFromBuild(projectData) {
        const newProject = {
            id: Date.now(),
            title: projectData.title || 'Generated Project',
            description: projectData.description || 'AI-generated project from Build Dashboard',
            date: new Date().toISOString().split('T')[0],
            status: 'Active'
        };

        this.projects.push(newProject);
        this.saveProjects();
        this.renderProjects();
    }
}

// Global instance for external access
let projectsPage;

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    projectsPage = new ProjectsPage();
});

// Global function for external access
window.addProjectFromBuild = (projectData) => {
    if (projectsPage) {
        projectsPage.addProjectFromBuild(projectData);
    }
};