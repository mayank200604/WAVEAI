class ValidationPage {
    constructor() {
        this.sidebarOpen = false;
        this.validationScore = 0;
        this.analysisData = null;
        this.isAnalyzing = false;
        // API Keys should be loaded from environment variables
        this.GEMINI_API_KEY = ''; // Set from environment variable
        this.PERPLEXITY_API_KEY = ''; // Set from environment variable
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadIdeaDescription();
        this.startRealValidation();
    }

    loadIdeaDescription() {
        const ideaText = localStorage.getItem('ideaText');
        const ideaDescription = document.querySelector('.idea-description');
        
        if (ideaText && ideaDescription) {
            ideaDescription.textContent = ideaText;
        }
    }

    async startRealValidation() {
        const ideaText = localStorage.getItem('ideaText');
        if (!ideaText) {
            console.error('No idea text found');
            return;
        }

        this.isAnalyzing = true;
        this.showAnalysisProgress();

        try {
            // Use the new validation API with comprehensive scoring
            const response = await fetch('http://localhost:5000/api/validate-idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idea: ideaText })
            });

            if (!response.ok) {
                throw new Error(`Backend API error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error || 'Validation failed');
            }

            // Process the new validation data
            this.analysisData = data.validation_result;
            this.validationScore = this.analysisData.validation_score || 0;
            
            // Debug: Log the validation data
            console.log('Validation API Response:', data);
            console.log('Validation Score:', this.validationScore);
            console.log('Market Score:', this.analysisData.market_score);
            console.log('Tech Score:', this.analysisData.tech_score);
            console.log('Competition Score:', this.analysisData.competition_score);
            
            // Set global validation score for animation
            window.validationScore = this.validationScore;
            
            // Update UI with real data
            this.updateUIWithAnalysis();
            this.startValidationAnimation();
            
        } catch (error) {
            console.error('Validation failed:', error);
            this.showErrorState();
        } finally {
            this.isAnalyzing = false;
        }
    }

    async analyzeWithGemini(ideaText) {
        const prompt = `Analyze this business idea and provide a comprehensive validation report in JSON format:

Idea: "${ideaText}"

Please provide analysis in this exact JSON structure:
{
    "marketPotential": {
        "score": 0-100,
        "analysis": "detailed analysis",
        "targetAudience": "description",
        "marketSize": "estimated size"
    },
    "technicalFeasibility": {
        "score": 0-100,
        "analysis": "technical assessment",
        "complexity": "low/medium/high",
        "requiredSkills": ["skill1", "skill2"]
    },
    "businessViability": {
        "score": 0-100,
        "analysis": "business model assessment",
        "revenuePotential": "estimated revenue",
        "costStructure": "cost analysis"
    },
    "competition": {
        "score": 0-100,
        "analysis": "competitive landscape",
        "competitors": ["competitor1", "competitor2"],
        "differentiation": "unique value proposition"
    },
    "risks": {
        "score": 0-100,
        "analysis": "risk assessment",
        "majorRisks": ["risk1", "risk2"],
        "mitigation": "risk mitigation strategies"
    },
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: [{ text: prompt }]
                    }]
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        // Extract JSON from response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Could not parse Gemini response');
    }

    async analyzeWithPerplexity(ideaText) {
        const prompt = `Provide a market research analysis for this business idea: "${ideaText}". 

Focus on:
1. Current market trends and opportunities
2. Existing competitors and their market share
3. Target customer demographics and behavior
4. Market size and growth potential
5. Industry challenges and barriers to entry

Provide specific data points, statistics, and recent market research findings.`;

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-sonar-small-128k-chat',
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`Perplexity API error: ${response.status}`);
        }

        const data = await response.json();
        return data?.choices?.[0]?.message?.content || '';
    }

    combineAnalysisResults(geminiData, perplexityData) {
        return {
            ...geminiData,
            marketResearch: perplexityData,
            timestamp: new Date().toISOString(),
            sources: ['Gemini AI', 'Perplexity AI']
        };
    }

    calculateValidationScore(analysisData) {
        const weights = {
            marketPotential: 0.25,
            technicalFeasibility: 0.20,
            businessViability: 0.25,
            competition: 0.15,
            risks: 0.15
        };

        let totalScore = 0;
        for (const [category, weight] of Object.entries(weights)) {
            if (analysisData[category] && analysisData[category].score) {
                totalScore += analysisData[category].score * weight;
            }
        }

        return Math.round(totalScore);
    }

    showAnalysisProgress() {
        const progressText = document.getElementById('progress-text') || document.querySelector('.score-label');
        if (progressText) {
            progressText.textContent = 'Analyzing with AI...';
        }

        // Show loading state
        const statusIndicator = document.querySelector('.status-indicator');
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            statusIndicator.style.backgroundColor = '#f59e0b';
        }
    }

    updateUIWithAnalysis() {
        if (!this.analysisData) return;

        // Update outcome description
        const outcomeDescription = document.querySelector('.outcome-description');
        if (outcomeDescription) {
            const overallAssessment = this.getOverallAssessment();
            outcomeDescription.textContent = overallAssessment;
        }

        // Update metrics
        this.updateMetrics();
        
        // Update status
        this.updateStatus();
    }

    getOverallAssessment() {
        const score = this.validationScore;
        const confidence = this.analysisData.confidence_level || 'Medium';
        const marketScore = this.analysisData.market_score || 0;
        const techScore = this.analysisData.tech_score || 0;
        const competitionScore = this.analysisData.competition_score || 0;

        if (score >= 80) {
            return `This idea shows exceptional potential with a validation score of ${score}% (${confidence} confidence). Market analysis shows ${marketScore}% potential, technical feasibility is ${techScore}%, and competition level is ${competitionScore}%. The comprehensive analysis using live datasets from Google Trends, Reddit, News API, and GitHub indicates high probability of success with proper execution.`;
        } else if (score >= 60) {
            return `This idea demonstrates good potential with a validation score of ${score}% (${confidence} confidence). Market potential: ${marketScore}%, Technical feasibility: ${techScore}%, Competition: ${competitionScore}%. With strategic improvements based on the live data analysis, this could become a successful venture.`;
        } else if (score >= 40) {
            return `This idea shows some potential but requires significant refinement. Validation score is ${score}% (${confidence} confidence). Market: ${marketScore}%, Tech: ${techScore}%, Competition: ${competitionScore}%. The analysis suggests areas for improvement before proceeding.`;
        } else {
            return `This idea faces significant challenges across multiple validation criteria. Validation score is ${score}% (${confidence} confidence). Market: ${marketScore}%, Tech: ${techScore}%, Competition: ${competitionScore}%. The analysis suggests the need for substantial rethinking or pivoting.`;
        }
    }

    updateMetrics() {
        const metrics = document.querySelectorAll('.metric');
        if (metrics.length >= 3 && this.analysisData) {
            // Market Potential
            const marketScore = this.analysisData.market_score || 0;
            metrics[0].querySelector('.metric-value').textContent = this.getScoreLabel(marketScore);
            metrics[0].querySelector('.metric-value').className = `metric-value ${this.getScoreClass(marketScore)}`;

            // Technical Feasibility
            const techScore = this.analysisData.tech_score || 0;
            metrics[1].querySelector('.metric-value').textContent = this.getScoreLabel(techScore);
            metrics[1].querySelector('.metric-value').className = `metric-value ${this.getScoreClass(techScore)}`;

            // Competition Level
            const competitionScore = this.analysisData.competition_score || 0;
            metrics[2].querySelector('.metric-value').textContent = this.getScoreLabel(competitionScore);
            metrics[2].querySelector('.metric-value').className = `metric-value ${this.getScoreClass(competitionScore)}`;
        }
    }

    getScoreLabel(score) {
        if (score >= 80) return 'High';
        if (score >= 60) return 'Medium';
        return 'Low';
    }

    getScoreClass(score) {
        if (score >= 80) return 'high';
        if (score >= 60) return 'medium';
        return 'low';
    }

    updateStatus() {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');
        
        if (statusText && statusIndicator) {
            if (this.validationScore >= 80) {
                statusText.textContent = 'Strong Validation';
                statusText.style.color = '#22c55e';
                statusIndicator.className = 'status-indicator success';
            } else if (this.validationScore >= 60) {
                statusText.textContent = 'Moderate Validation';
                statusText.style.color = '#f59e0b';
                statusIndicator.className = 'status-indicator';
                statusIndicator.style.backgroundColor = '#f59e0b';
            } else {
                statusText.textContent = 'Weak Validation';
                statusText.style.color = '#ef4444';
                statusIndicator.className = 'status-indicator';
                statusIndicator.style.backgroundColor = '#ef4444';
            }
        }
    }

    showErrorState() {
        const statusText = document.querySelector('.status-text');
        const statusIndicator = document.querySelector('.status-indicator');
        const outcomeDescription = document.querySelector('.outcome-description');
        
        if (statusText) statusText.textContent = 'Analysis Failed';
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator';
            statusIndicator.style.backgroundColor = '#ef4444';
        }
        if (outcomeDescription) {
            outcomeDescription.textContent = 'Unable to complete AI analysis. Please try again or proceed with manual validation.';
        }
    }

    setupEventListeners() {
        // Action button handlers
        const approveBtn = document.getElementById('approve-btn');
        const rejectBtn = document.getElementById('reject-btn');
        const mutateBtn = document.getElementById('mutate-btn');

        if (approveBtn) {
    approveBtn.addEventListener('click', () => {
        const ideaText = document.querySelector('.idea-description')?.textContent || '';
        localStorage.setItem('ideaText', ideaText);
        window.location.href = 'build.html';
    });
}

if (rejectBtn) {
    rejectBtn.addEventListener('click', () => {
        const ideaText = document.querySelector('.idea-description')?.textContent || '';
        localStorage.setItem('ideaText', ideaText);
        window.location.href = 'resurrect.html';
    });
}

if (mutateBtn) {
    mutateBtn.addEventListener('click', () => {
        const ideaText = document.querySelector('.idea-description')?.textContent || '';
        localStorage.setItem('ideaText', ideaText);
        window.location.href = 'mutation.html';
    });
}

        // Button hover effects
        const buttons = document.querySelectorAll('.action-btn');
        buttons.forEach(button => {
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'translateY(-2px) scale(1.02)';
            });

            button.addEventListener('mouseleave', () => {
                button.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    startValidationAnimation() {
        // Animate progress circle and score
        setTimeout(() => {
            this.animateProgressCircle();
            this.animateScoreCounter();
        }, 500);

        // Update progress text
        setTimeout(() => {
            const progressText = document.getElementById('progress-text') || document.querySelector('.score-label');
            if (progressText) {
                progressText.textContent = 'AI Validation Complete!';
                progressText.style.color = '#06b6d4';
            }
        }, 2000);
    }

    animateProgressCircle() {
        const circle = document.getElementById('progress-circle');
        if (!circle) return;

        const radius = 52;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (this.validationScore / 100) * circumference;

        circle.style.strokeDasharray = `${circumference} ${circumference}`;
        circle.style.strokeDashoffset = circumference;

        // Trigger animation
        setTimeout(() => {
            circle.style.strokeDashoffset = offset;
        }, 100);
    }

    animateScoreCounter() {
        const scoreNumber = document.getElementById('score-number');
        if (!scoreNumber) return;

        let currentScore = 0;
        const increment = this.validationScore / 60; // 60 frames for smooth animation
        
        const timer = setInterval(() => {
            currentScore += increment;
            if (currentScore >= this.validationScore) {
                currentScore = this.validationScore;
                clearInterval(timer);
            }
            scoreNumber.textContent = Math.round(currentScore);
        }, 33); // ~30fps
    }

    // Simulate validation process
    simulateValidation() {
        const steps = [
            'Analyzing market potential...',
            'Evaluating technical feasibility...',
            'Assessing business viability...',
            'Calculating risk factors...',
            'Generating final score...',
            'Validation complete!'
        ];

        let currentStep = 0;
        const progressText = document.getElementById('progress-text');
        const progressFill = document.getElementById('progress-fill');

        const stepInterval = setInterval(() => {
            if (currentStep < steps.length) {
                if (progressText) {
                    progressText.textContent = steps[currentStep];
                }
                if (progressFill) {
                    progressFill.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
                }
                currentStep++;
            } else {
                clearInterval(stepInterval);
                this.startValidationAnimation();
            }
        }, 800);
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ValidationPage();
});