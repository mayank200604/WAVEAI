// Wave AI - First-Time User Tutorial
class WaveTutorial {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                target: '#chat-input',
                title: '🌊 Welcome to Wave AI!',
                content: 'Hi! I\'m your AI assistant. Type your business idea here and I\'ll help you validate it and build a website!',
                position: 'top',
                pointer: true
            },
            {
                target: '.mode-toggle',
                title: '🔄 Choose Your Mode',
                content: 'I have two modes: <strong>Casual Chat</strong> for quick questions, and <strong>Idea Analysis</strong> for deep business validation.',
                position: 'bottom',
                pointer: true
            },
            {
                target: '[href="/sitebuild"]',
                title: '🏗️ Build Your Website',
                content: 'Once your idea is validated, click here to configure and generate your website with AI!',
                position: 'right',
                pointer: true
            },
            {
                target: '.support-bot-trigger',
                title: '💬 Need Help?',
                content: 'I\'m always here in the bottom-right corner if you have questions. Just click me anytime!',
                position: 'left',
                pointer: true
            },
            {
                target: '#chat-input',
                title: '🚀 Ready to Start!',
                content: 'That\'s it! Now type your business idea and let\'s build something amazing together! 🌊',
                position: 'top',
                pointer: true
            }
        ];
        
        this.overlay = null;
        this.tooltip = null;
    }

    hasSeenTutorial() {
        return localStorage.getItem('wave_tutorial_completed') === 'true';
    }

    markTutorialComplete() {
        localStorage.setItem('wave_tutorial_completed', 'true');
    }

    start() {
        console.log('🌊 Wave Tutorial: Checking if tutorial should start...');
        if (this.hasSeenTutorial()) {
            console.log('✅ Tutorial already completed');
            return;
        }
        console.log('🚀 Starting Wave Tutorial...');
        try {
            this.createOverlay();
            this.showStep(0);
            console.log('✨ Tutorial overlay created and first step shown');
        } catch (error) {
            console.error('❌ Error starting tutorial:', error);
        }
    }

    createOverlay() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'wave-tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
            backdrop-filter: blur(2px);
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(this.overlay);
        
        // Fade in
        setTimeout(() => {
            this.overlay.style.opacity = '1';
        }, 10);

        // Create tooltip container
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'wave-tutorial-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border: 2px solid #009DFF;
            border-radius: 16px;
            padding: 24px;
            max-width: 380px;
            z-index: 9999;
            box-shadow: 0 20px 60px rgba(0, 157, 255, 0.4), 0 0 0 1px rgba(0, 157, 255, 0.1);
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        `;
        document.body.appendChild(this.tooltip);

        // Create pointer arrow
        this.pointer = document.createElement('div');
        this.pointer.className = 'wave-tutorial-pointer';
        this.pointer.style.cssText = `
            position: fixed;
            width: 0;
            height: 0;
            border-style: solid;
            z-index: 9999;
            opacity: 0;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(this.pointer);
    }

    showStep(stepIndex) {
        console.log(`📍 Showing tutorial step ${stepIndex + 1}/${this.steps.length}`);
        if (stepIndex >= this.steps.length) {
            this.complete();
            return;
        }

        this.currentStep = stepIndex;
        const step = this.steps[stepIndex];
        const target = document.querySelector(step.target);
        
        if (!target) {
            console.warn(`⚠️ Tutorial target not found: ${step.target}, skipping to next step`);
            // Try next step after a delay
            setTimeout(() => this.showStep(stepIndex + 1), 500);
            return;
        }

        let targetElement = null;
        if (step.target !== '.chat-container' || stepIndex === 0 || stepIndex === this.steps.length - 1) {
            targetElement = document.querySelector(step.target);
        }

        // Update tooltip content
        this.tooltip.innerHTML = `
            <div style="color: white; font-family: 'Inter', sans-serif;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #009DFF; font-family: 'Orbitron', monospace;">
                        ${step.title}
                    </h3>
                    <button onclick="waveTutorial.skip()" style="background: none; border: none; color: #888; cursor: pointer; font-size: 24px; padding: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;">
                        ×
                    </button>
                </div>
                <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #e0e0e0;">
                    ${step.content}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; gap: 8px;">
                        ${this.steps.map((_, i) => `
                            <div style="width: ${i === stepIndex ? '24px' : '8px'}; height: 8px; background: ${i === stepIndex ? '#009DFF' : '#444'}; border-radius: 4px; transition: all 0.3s;"></div>
                        `).join('')}
                    </div>
                    <div style="display: flex; gap: 12px;">
                        ${stepIndex > 0 ? `
                            <button onclick="waveTutorial.prev()" style="background: #2a2a2a; border: 1px solid #444; color: white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: 'Inter', sans-serif;">
                                Previous
                            </button>
                        ` : ''}
                        <button onclick="waveTutorial.next()" style="background: linear-gradient(135deg, #009DFF 0%, #0891b2 100%); border: none; color: white; padding: 10px 24px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0, 157, 255, 0.3); font-family: 'Inter', sans-serif;">
                            ${stepIndex === this.steps.length - 1 ? 'Get Started!' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Position tooltip
        this.positionTooltip(targetElement, step.position);

        // Highlight target element
        if (targetElement) {
            this.highlightElement(targetElement);
        }

        // Animate tooltip in
        setTimeout(() => {
            this.tooltip.style.opacity = '1';
            this.tooltip.style.transform = 'scale(1)';
        }, 10);
    }

    positionTooltip(targetElement, position) {
        // Hide pointer initially
        this.pointer.style.opacity = '0';

        if (!targetElement) {
            // Center on screen
            this.tooltip.style.top = '50%';
            this.tooltip.style.left = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%) scale(1)';
            return;
        }

        const rect = targetElement.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();
        const arrowSize = 12;

        switch (position) {
            case 'top':
                this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
                this.tooltip.style.top = `${rect.top - tooltipRect.height - 20}px`;
                this.tooltip.style.transform = 'translateX(-50%) scale(1)';
                
                // Position arrow pointing down to element
                this.pointer.style.left = `${rect.left + rect.width / 2}px`;
                this.pointer.style.top = `${rect.top - 10}px`;
                this.pointer.style.transform = 'translateX(-50%)';
                this.pointer.style.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`;
                this.pointer.style.borderColor = `#009DFF transparent transparent transparent`;
                break;
                
            case 'bottom':
                this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
                this.tooltip.style.top = `${rect.bottom + 20}px`;
                this.tooltip.style.transform = 'translateX(-50%) scale(1)';
                
                // Position arrow pointing up to element
                this.pointer.style.left = `${rect.left + rect.width / 2}px`;
                this.pointer.style.top = `${rect.bottom + 10}px`;
                this.pointer.style.transform = 'translateX(-50%)';
                this.pointer.style.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`;
                this.pointer.style.borderColor = `transparent transparent #009DFF transparent`;
                break;
                
            case 'left':
                this.tooltip.style.left = `${rect.left - tooltipRect.width - 20}px`;
                this.tooltip.style.top = `${rect.top + rect.height / 2}px`;
                this.tooltip.style.transform = 'translateY(-50%) scale(1)';
                
                // Position arrow pointing right to element
                this.pointer.style.left = `${rect.left - 10}px`;
                this.pointer.style.top = `${rect.top + rect.height / 2}px`;
                this.pointer.style.transform = 'translateY(-50%)';
                this.pointer.style.borderWidth = `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`;
                this.pointer.style.borderColor = `transparent transparent transparent #009DFF`;
                break;
                
            case 'right':
                this.tooltip.style.left = `${rect.right + 20}px`;
                this.tooltip.style.top = `${rect.top + rect.height / 2}px`;
                this.tooltip.style.transform = 'translateY(-50%) scale(1)';
                
                // Position arrow pointing left to element
                this.pointer.style.left = `${rect.right + 10}px`;
                this.pointer.style.top = `${rect.top + rect.height / 2}px`;
                this.pointer.style.transform = 'translateY(-50%)';
                this.pointer.style.borderWidth = `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`;
                this.pointer.style.borderColor = `transparent #009DFF transparent transparent`;
                break;
        }

        // Show pointer with delay
        setTimeout(() => {
            this.pointer.style.opacity = '1';
        }, 200);
    }

    highlightElement(element) {
        // Remove previous highlights
        document.querySelectorAll('.wave-tutorial-highlight').forEach(el => {
            el.classList.remove('wave-tutorial-highlight');
        });

        // Add highlight
        element.classList.add('wave-tutorial-highlight');
        element.style.position = 'relative';
        element.style.zIndex = '9999';
        element.style.boxShadow = '0 0 0 4px rgba(0, 157, 255, 0.5), 0 0 30px rgba(0, 157, 255, 0.3)';
        element.style.borderRadius = '12px';
        element.style.transition = 'all 0.3s ease';
    }

    next() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.showStep(this.currentStep + 1);
        }, 200);
    }

    prev() {
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.showStep(this.currentStep - 1);
        }, 200);
    }

    skip() {
        this.complete();
    }

    complete() {
        // Remove highlights
        document.querySelectorAll('.wave-tutorial-highlight').forEach(el => {
            el.classList.remove('wave-tutorial-highlight');
            el.style.boxShadow = '';
            el.style.zIndex = '';
        });

        // Fade out
        if (this.overlay) {
            this.overlay.style.opacity = '0';
        }
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
            this.tooltip.style.transform = 'scale(0.9)';
        }
        if (this.pointer) {
            this.pointer.style.opacity = '0';
        }

        // Remove elements
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.remove();
            }
            if (this.tooltip) {
                this.tooltip.remove();
            }
            if (this.pointer) {
                this.pointer.remove();
            }
        }, 300);

        // Mark as completed
        this.markTutorialComplete();
    }

    reset() {
        localStorage.removeItem('wave_tutorial_completed');
    }
}

// Global instance
const waveTutorial = new WaveTutorial();

// Auto-start on page load (after a short delay)
if (typeof window !== 'undefined') {
    window.waveTutorial = waveTutorial;
    
    // Start tutorial after page is fully loaded
    window.addEventListener('load', () => {
        setTimeout(() => {
            waveTutorial.start();
        }, 1000);
    });
}

// Add hover effects to buttons
document.addEventListener('mouseover', (e) => {
    if (e.target.matches('.wave-tutorial-tooltip button')) {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 16px rgba(0, 157, 255, 0.4)';
    }
});

document.addEventListener('mouseout', (e) => {
    if (e.target.matches('.wave-tutorial-tooltip button')) {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = e.target.style.background.includes('gradient') ? '0 4px 12px rgba(0, 157, 255, 0.3)' : 'none';
    }
});
