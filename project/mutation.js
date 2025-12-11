class MutationPage {
    constructor() {
        this.sidebarOpen = false;
        this.currentMutatedIdea = '';
        this.originalIdea = '';
        this.init();
    }

    init() {
        this.loadValidatedIdea();
        this.generateInitialMutation();
        this.setupEventListeners();
    }

    loadValidatedIdea() {
        const ideaText = localStorage.getItem('ideaText');
        const validatedIdeaContent = document.getElementById('validated-idea-content');
        
        if (ideaText && validatedIdeaContent) {
            this.originalIdea = ideaText;
            validatedIdeaContent.innerHTML = `<p class="placeholder-text">${ideaText}</p>`;
        }
    }

    async generateInitialMutation() {
        const mutatedTextElement = document.getElementById('mutated-text');
        const loadingShimmer = document.getElementById('loading-shimmer');
        if (mutatedTextElement && loadingShimmer) {
            loadingShimmer.style.display = 'block';
            mutatedTextElement.style.opacity = '0';
        }
        try {
            const response = await fetch('http://localhost:5000/api/ai-enhanced', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: this.originalIdea || 'default idea' })
            });
            if (response.ok) {
                const data = await response.json();
                this.currentMutatedIdea = data.enhanced_idea;
                this.updateMutatedContent(this.currentMutatedIdea);
            } else {
                throw new Error('API request failed');
            }
        } catch (error) {
            this.currentMutatedIdea = this.mutateIdea(this.originalIdea || 'default idea');
            this.updateMutatedContent(this.currentMutatedIdea);
        }
    }

    mutateIdea(originalIdea) {
        const mutations = [
            `Enhanced AI-powered version: ${originalIdea || 'A revolutionary platform'} with machine learning capabilities, real-time analytics, and predictive insights that adapt to user behavior and market trends. Features include automated workflow optimization, intelligent recommendations, and seamless integration with existing enterprise systems.`,
            
            `Market-optimized evolution: ${originalIdea || 'An innovative solution'} redesigned for the modern digital economy with subscription-based monetization, cloud-native architecture, and mobile-first approach. Incorporates social collaboration features, sustainability metrics, and compliance with emerging data privacy regulations.`,
            
            `Trend-aligned transformation: ${originalIdea || 'A cutting-edge concept'} enhanced with community-driven features, personalization algorithms, and cross-platform compatibility. Includes gamification elements, social sharing capabilities, and integration with popular productivity tools to maximize user engagement and retention.`,
            
            `Next-generation upgrade: ${originalIdea || 'A forward-thinking platform'} powered by advanced AI, featuring voice interfaces, augmented reality components, and blockchain-based security. Designed for remote-first teams with real-time collaboration, automated reporting, and intelligent resource allocation.`
        ];

        return mutations[Math.floor(Math.random() * mutations.length)];
    }

    updateMutatedContent(newText) {
        const mutatedTextElement = document.getElementById('mutated-text');
        const loadingShimmer = document.getElementById('loading-shimmer');
        
        if (mutatedTextElement && loadingShimmer) {
            // Show loading shimmer
            loadingShimmer.style.display = 'block';
            mutatedTextElement.style.opacity = '0';
            
            setTimeout(() => {
                // Hide shimmer and show new text
                loadingShimmer.style.display = 'none';
                mutatedTextElement.textContent = newText;
                mutatedTextElement.style.opacity = '1';
                mutatedTextElement.style.animation = 'fadeInUp 0.5s ease';
            }, 1500);
        }
    }

    setupEventListeners() {
        // Action buttons
        const buildBtn = document.getElementById('build-btn');
        const rethinkBtn = document.getElementById('rethink-btn');
        const explainBtn = document.getElementById('explain-btn');

        if (buildBtn) {
            buildBtn.addEventListener('click', () => this.handleBuild());
        }

        if (rethinkBtn) {
            rethinkBtn.addEventListener('click', () => this.handleRethink());
        }

        if (explainBtn) {
            explainBtn.addEventListener('click', () => this.showExplanation());
        }

        // Modal close
        const modalClose = document.getElementById('modal-close');
        const modal = document.getElementById('explanation-modal');

        if (modalClose) {
            modalClose.addEventListener('click', () => this.hideExplanation());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideExplanation();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideExplanation();
            }
        });
    }

    handleBuild() {
        // Save mutated idea to localStorage
        localStorage.setItem('mutatedIdea', this.currentMutatedIdea);
        localStorage.setItem('ideaText', this.originalIdea);
        
        // Add a subtle success animation
        const buildBtn = document.getElementById('build-btn');
        if (buildBtn) {
            buildBtn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                buildBtn.style.transform = 'scale(1)';
                window.location.href = 'build.html';
            }, 150);
        }
    }

    async handleRethink() {
        const rethinkBtn = document.getElementById('rethink-btn');
        if (rethinkBtn) {
            rethinkBtn.style.opacity = '0.6';
            rethinkBtn.style.pointerEvents = 'none';
            try {
                const response = await fetch('http://localhost:5000/api/rethink-idea', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idea: this.originalIdea, variation: Date.now(), count: 3 })
                });
                if (response.ok) {
                    const data = await response.json();
                    const list = data.rethought_ideas && Array.isArray(data.rethought_ideas) ? data.rethought_ideas : [data.rethought_idea].filter(Boolean);
                    // Pick the first one that is sufficiently different from the current text
                    let chosen = list.find(txt => typeof txt === 'string' && txt.trim() && (!this.currentMutatedIdea || txt.trim() !== this.currentMutatedIdea.trim()));
                    if (!chosen && list.length) {
                        chosen = list[0];
                    }
                    if (!chosen || (this.currentMutatedIdea && chosen.trim() === this.currentMutatedIdea.trim())) {
                        chosen = this.mutateIdea(this.originalIdea);
                    }
                    this.currentMutatedIdea = chosen;
                    this.updateMutatedContent(this.currentMutatedIdea);
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                this.currentMutatedIdea = this.mutateIdea(this.originalIdea);
                this.updateMutatedContent(this.currentMutatedIdea);
            }
            setTimeout(() => {
                rethinkBtn.style.opacity = '1';
                rethinkBtn.style.pointerEvents = 'auto';
            }, 1500);
        }
    }

    async showExplanation() {
        const modal = document.getElementById('explanation-modal');
        const explanationText = document.getElementById('explanation-text');
        
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Show loading state
            if (explanationText) {
                explanationText.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="spinner"></div><p>Generating explanation...</p></div>';
            }
            
            try {
                const response = await fetch('http://localhost:5000/api/explain-mutation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        original_idea: this.originalIdea,
                        mutated_idea: this.currentMutatedIdea
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (explanationText) {
                        explanationText.innerHTML = `<div style="white-space: pre-wrap;">${data.explanation}</div>`;
                    }
                } else {
                    throw new Error('API request failed');
                }
            } catch (error) {
                console.error('Explanation error:', error);
                if (explanationText) {
                    explanationText.innerHTML = `
                        <h3>Mutation Explanation</h3>
                        <p><strong>Original Idea:</strong> ${this.originalIdea}</p>
                        <p><strong>Mutated Version:</strong> ${this.currentMutatedIdea}</p>
                        <h4>Key Changes:</h4>
                        <ul>
                            <li>Enhanced with AI and machine learning capabilities</li>
                            <li>Added scalability and modern technology stack</li>
                            <li>Incorporated market trends and user needs</li>
                            <li>Improved business model and monetization strategy</li>
                        </ul>
                    `;
                }
            }
        }
    }

    hideExplanation() {
        const modal = document.getElementById('explanation-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }

}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MutationPage();
});