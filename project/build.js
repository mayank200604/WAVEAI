class BuildPage {
    constructor() {
        this.selectedIdea = '';
        this.projectStats = null;
        this.isGeneratingStats = false;
        // API Keys should be loaded from environment variables
        this.GEMINI_API_KEY = ''; // Set from environment variable
        this.PERPLEXITY_API_KEY = ''; // Set from environment variable
        this.init();
    }

    init() {
        this.loadSelectedIdea();
        this.setupEventListeners();
        this.generateProjectStatistics();
        this.setupCodeGeneration();
    }

    loadSelectedIdea() {
        // Load mutated idea from localStorage
        const mutatedIdea = localStorage.getItem('mutatedIdea');
        const ideaCard = document.getElementById('selected-idea-card');
        const ideaText = document.getElementById('selected-idea-text');
        
        if (mutatedIdea && ideaCard && ideaText) {
            this.selectedIdea = mutatedIdea;
            ideaText.textContent = mutatedIdea;
            ideaCard.style.display = 'block';
        } else {
            // Fallback to regular idea text
            const ideaText = localStorage.getItem('ideaText');
            if (ideaText && ideaCard && ideaText) {
                this.selectedIdea = ideaText;
                ideaText.textContent = ideaText;
                ideaCard.style.display = 'block';
            }
        }
    }

    async generateProjectStatistics() {
        if (!this.selectedIdea) {
            console.error('No idea selected for statistics generation');
            return;
        }

        this.isGeneratingStats = true;
        this.showStatsLoading();

        try {
            // Generate comprehensive project statistics
            const [marketStats, technicalStats, financialStats] = await Promise.all([
                this.generateMarketStatistics(),
                this.generateTechnicalStatistics(),
                this.generateFinancialStatistics()
            ]);

            this.projectStats = {
                market: marketStats,
                technical: technicalStats,
                financial: financialStats,
                timestamp: new Date().toISOString()
            };

            this.updateStatisticsUI();
            
        } catch (error) {
            console.error('Failed to generate statistics:', error);
            this.showStatsError();
        } finally {
            this.isGeneratingStats = false;
        }
    }

    async generateMarketStatistics() {
        const prompt = `Analyze the market potential for this business idea and provide detailed statistics in JSON format:

Idea: "${this.selectedIdea}"

Provide market analysis in this exact JSON structure:
{
    "marketSize": {
        "totalAddressableMarket": "TAM in USD",
        "serviceableAddressableMarket": "SAM in USD", 
        "serviceableObtainableMarket": "SOM in USD",
        "growthRate": "annual growth percentage"
    },
    "targetAudience": {
        "primarySegment": "description",
        "secondarySegment": "description",
        "demographics": {
            "ageRange": "age range",
            "incomeLevel": "income level",
            "geographicFocus": "geographic area"
        }
    },
    "competition": {
        "directCompetitors": ["competitor1", "competitor2"],
        "indirectCompetitors": ["competitor1", "competitor2"],
        "marketShare": "estimated market share percentage",
        "competitiveAdvantage": "unique selling proposition"
    },
    "marketTrends": {
        "currentTrends": ["trend1", "trend2", "trend3"],
        "futureOpportunities": ["opportunity1", "opportunity2"],
        "threats": ["threat1", "threat2"]
    }
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
            throw new Error(`Market analysis failed: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Could not parse market analysis response');
    }

    async generateTechnicalStatistics() {
        const prompt = `Analyze the technical requirements and development statistics for this business idea:

Idea: "${this.selectedIdea}"

Provide technical analysis in this exact JSON structure:
{
    "developmentTimeline": {
        "minimumViableProduct": "time in months",
        "fullDevelopment": "time in months",
        "phases": [
            {"phase": "Phase 1", "duration": "X months", "description": "description"},
            {"phase": "Phase 2", "duration": "X months", "description": "description"}
        ]
    },
    "technologyStack": {
        "frontend": ["technology1", "technology2"],
        "backend": ["technology1", "technology2"],
        "database": ["database1"],
        "infrastructure": ["service1", "service2"]
    },
    "resourceRequirements": {
        "teamSize": "number of people",
        "roles": ["role1", "role2", "role3"],
        "skillLevel": "junior/mid/senior",
        "estimatedHours": "total development hours"
    },
    "technicalRisks": {
        "highRisk": ["risk1", "risk2"],
        "mediumRisk": ["risk1", "risk2"],
        "mitigationStrategies": ["strategy1", "strategy2"]
    }
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
            throw new Error(`Technical analysis failed: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Could not parse technical analysis response');
    }

    async generateFinancialStatistics() {
        const prompt = `Analyze the financial projections and business model for this business idea:

Idea: "${this.selectedIdea}"

Provide financial analysis in this exact JSON structure:
{
    "revenueModel": {
        "primaryRevenue": "revenue stream description",
        "secondaryRevenue": "additional revenue streams",
        "pricingStrategy": "pricing approach"
    },
    "costStructure": {
        "developmentCosts": "estimated development cost",
        "operationalCosts": "monthly operational cost",
        "marketingCosts": "marketing budget",
        "infrastructureCosts": "hosting/cloud costs"
    },
    "financialProjections": {
        "year1": {
            "revenue": "projected revenue",
            "expenses": "projected expenses",
            "profit": "projected profit"
        },
        "year2": {
            "revenue": "projected revenue", 
            "expenses": "projected expenses",
            "profit": "projected profit"
        },
        "year3": {
            "revenue": "projected revenue",
            "expenses": "projected expenses", 
            "profit": "projected profit"
        }
    },
    "fundingRequirements": {
        "initialInvestment": "required initial funding",
        "breakEvenPoint": "months to break even",
        "fundingSources": ["source1", "source2"]
    }
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
            throw new Error(`Financial analysis failed: ${response.status}`);
        }

        const data = await response.json();
        const analysisText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('Could not parse financial analysis response');
    }

    showStatsLoading() {
        // Update loading indicators
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const value = card.querySelector('.stat-value');
            if (value) {
                value.textContent = 'Loading...';
                value.style.color = '#f59e0b';
            }
        });
    }

    updateStatisticsUI() {
        if (!this.projectStats) return;

        // Update market statistics
        this.updateMarketStats();
        
        // Update technical statistics  
        this.updateTechnicalStats();
        
        // Update financial statistics
        this.updateFinancialStats();
    }

    updateMarketStats() {
        const marketStats = this.projectStats.market;
        if (!marketStats) return;

        // Update market size
        const marketSizeElement = document.querySelector('[data-stat="market-size"]');
        if (marketSizeElement && marketStats.marketSize) {
            marketSizeElement.textContent = marketStats.marketSize.totalAddressableMarket || 'N/A';
        }

        // Update growth rate
        const growthRateElement = document.querySelector('[data-stat="growth-rate"]');
        if (growthRateElement && marketStats.marketSize) {
            growthRateElement.textContent = marketStats.marketSize.growthRate || 'N/A';
        }

        // Update competition
        const competitionElement = document.querySelector('[data-stat="competition"]');
        if (competitionElement && marketStats.competition) {
            competitionElement.textContent = marketStats.competition.marketShare || 'N/A';
        }
    }

    updateTechnicalStats() {
        const technicalStats = this.projectStats.technical;
        if (!technicalStats) return;

        // Update development timeline
        const timelineElement = document.querySelector('[data-stat="timeline"]');
        if (timelineElement && technicalStats.developmentTimeline) {
            timelineElement.textContent = technicalStats.developmentTimeline.minimumViableProduct || 'N/A';
        }

        // Update team size
        const teamSizeElement = document.querySelector('[data-stat="team-size"]');
        if (teamSizeElement && technicalStats.resourceRequirements) {
            teamSizeElement.textContent = technicalStats.resourceRequirements.teamSize || 'N/A';
        }

        // Update estimated hours
        const hoursElement = document.querySelector('[data-stat="hours"]');
        if (hoursElement && technicalStats.resourceRequirements) {
            hoursElement.textContent = technicalStats.resourceRequirements.estimatedHours || 'N/A';
        }
    }

    updateFinancialStats() {
        const financialStats = this.projectStats.financial;
        if (!financialStats) return;

        // Update initial investment
        const investmentElement = document.querySelector('[data-stat="investment"]');
        if (investmentElement && financialStats.fundingRequirements) {
            investmentElement.textContent = financialStats.fundingRequirements.initialInvestment || 'N/A';
        }

        // Update break-even point
        const breakEvenElement = document.querySelector('[data-stat="break-even"]');
        if (breakEvenElement && financialStats.fundingRequirements) {
            breakEvenElement.textContent = financialStats.fundingRequirements.breakEvenPoint || 'N/A';
        }

        // Update year 1 revenue
        const revenueElement = document.querySelector('[data-stat="revenue"]');
        if (revenueElement && financialStats.financialProjections) {
            revenueElement.textContent = financialStats.financialProjections.year1?.revenue || 'N/A';
        }
    }

    showStatsError() {
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            const value = card.querySelector('.stat-value');
            if (value) {
                value.textContent = 'Error';
                value.style.color = '#ef4444';
            }
        });
    }

    setupEventListeners() {

    // Update development timeline
    const timelineElement = document.querySelector('[data-stat="timeline"]');
    if (timelineElement && technicalStats.developmentTimeline) {
        timelineElement.textContent = technicalStats.developmentTimeline.minimumViableProduct || 'N/A';
        }

        // Build Site button
        const buildSiteBtn = document.getElementById('build-site-btn');
        if (buildSiteBtn) {
            buildSiteBtn.addEventListener('click', () => {
                window.location.href = 'sitebuild.html';
            });
        }
    }

    async exportToPDF() {
        const exportBtn = document.getElementById('export-pdf-btn');
        if (!exportBtn) return;

        const originalText = exportBtn.innerHTML;
        exportBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
            </svg>
            Generating Document...
        `;
        exportBtn.disabled = true;

        try {
            // Step 1: Generate comprehensive project documentation using DeepSeek API
            const documentationContent = await this.generateProjectDocumentation();
            
            // Step 2: Create Word document using docx library
            await this.createAndDownloadWordDoc(documentationContent);
            
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            this.showSuccessMessage('Project documentation exported successfully!');
            
        } catch (error) {
            console.error('Document export error:', error);
            exportBtn.innerHTML = originalText;
            exportBtn.disabled = false;
            alert('Failed to export document. Please try again.');
        }
    }

    async generateBusinessPlanWithDeepSeek() {
        const DEEPSEEK_API_KEY = ''; // Set from environment variable
        
        const prompt = `Create a comprehensive, professional business plan for the following idea:

"${this.selectedIdea || 'A revolutionary business concept'}"

Generate a complete business plan document with the following sections:

1. EXECUTIVE SUMMARY
   - Brief overview of the business concept
   - Mission and vision statements
   - Key success factors
   - Financial highlights

2. BUSINESS DESCRIPTION
   - Detailed description of the business
   - Products/services offered
   - Unique value proposition
   - Business model

3. MARKET ANALYSIS
   - Target market identification
   - Market size and growth potential
   - Customer demographics and psychographics
   - Market trends and opportunities
   - Competitive landscape

4. MARKETING & SALES STRATEGY
   - Marketing channels and tactics
   - Customer acquisition strategy
   - Pricing strategy
   - Sales process and funnel
   - Brand positioning

5. OPERATIONS PLAN
   - Day-to-day operations
   - Technology and infrastructure
   - Supply chain management
   - Quality control measures
   - Key partnerships

6. MANAGEMENT & ORGANIZATION
   - Organizational structure
   - Key team members and roles
   - Advisory board
   - Hiring plan

7. FINANCIAL PROJECTIONS
   - Revenue projections (3 years)
   - Cost structure and expenses
   - Profit and loss forecast
   - Cash flow projections
   - Break-even analysis
   - Funding requirements

8. RISK ANALYSIS
   - Potential risks and challenges
   - Mitigation strategies
   - Contingency plans

9. IMPLEMENTATION TIMELINE
   - Month-by-month action plan
   - Key milestones
   - Success metrics and KPIs

10. CONCLUSION
    - Summary of opportunity
    - Call to action
    - Next steps

Make the plan detailed, actionable, and professional. Use specific numbers, percentages, and data where appropriate. Format it clearly with headings and bullet points.`;

        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [{
                        role: 'user',
                        content: prompt
                    }],
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('DeepSeek API error:', error);
            // Fallback content if API fails
            return this.generateFallbackBusinessPlan();
        }
    }

    generateFallbackBusinessPlan() {
        return `COMPREHENSIVE BUSINESS PLAN

EXECUTIVE SUMMARY
${this.selectedIdea || 'Business Concept'}

This business plan outlines a strategic approach to launching and scaling an innovative business concept. The plan addresses market opportunities, competitive advantages, and a clear path to profitability.

BUSINESS DESCRIPTION
Our business focuses on delivering exceptional value through innovative solutions that address specific market needs. We combine cutting-edge technology with customer-centric design to create products and services that stand out in the marketplace.

MARKET ANALYSIS
The target market shows strong growth potential with increasing demand for innovative solutions. Our research indicates significant opportunities in underserved segments with high willingness to pay for quality offerings.

MARKETING & SALES STRATEGY
We will employ a multi-channel marketing approach including digital marketing, content marketing, strategic partnerships, and direct sales. Our customer acquisition strategy focuses on building brand awareness and demonstrating clear value propositions.

OPERATIONS PLAN
Operations will be streamlined for efficiency and scalability. We will leverage modern technology platforms, establish strong supplier relationships, and implement quality control measures to ensure consistent delivery of excellence.

FINANCIAL PROJECTIONS
Year 1: Revenue target of $500,000 with 30% gross margin
Year 2: Revenue target of $1,200,000 with 35% gross margin
Year 3: Revenue target of $2,500,000 with 40% gross margin

RISK ANALYSIS
Key risks include market competition, technology changes, and regulatory factors. We have developed comprehensive mitigation strategies including diversification, continuous innovation, and compliance monitoring.

IMPLEMENTATION TIMELINE
Months 1-3: Product development and market validation
Months 4-6: Launch and initial customer acquisition
Months 7-12: Scale operations and expand market reach

CONCLUSION
This business represents a significant opportunity with strong market potential and clear competitive advantages. With proper execution and adequate resources, we project strong growth and profitability within the first 24 months.`;
    }

    async createAndDownloadPDF(content) {
        // Use jsPDF library to create PDF
        // First, check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            // Load jsPDF dynamically
            await this.loadJsPDF();
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set up document properties
        doc.setProperties({
            title: 'Business Plan',
            subject: 'Comprehensive Business Plan',
            author: 'Wave AI',
            keywords: 'business, plan, strategy',
            creator: 'Wave AI Platform'
        });

        // Add content to PDF
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - (margin * 2);
        
        // Title
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('BUSINESS PLAN', margin, margin);
        
        // Add date
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, margin + 10);
        
        // Add content
        doc.setFontSize(11);
        const lines = doc.splitTextToSize(content, maxLineWidth);
        let yPosition = margin + 25;
        
        lines.forEach((line) => {
            if (yPosition > pageHeight - margin) {
                doc.addPage();
                yPosition = margin;
            }
            
            // Check if line is a heading (all caps or starts with number)
            if (line.match(/^[A-Z\s]+$/) || line.match(/^\d+\./)) {
                doc.setFont(undefined, 'bold');
                doc.setFontSize(12);
            } else {
                doc.setFont(undefined, 'normal');
                doc.setFontSize(11);
            }
            
            doc.text(line, margin, yPosition);
            yPosition += 7;
        });
        
        // Save the PDF
        const fileName = `Business_Plan_${new Date().getTime()}.pdf`;
        doc.save(fileName);
    }

    async loadJsPDF() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    saveProject() {
        const saveBtn = document.getElementById('save-project-btn');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="m9 12 2 2 4-4"></path>
                </svg>
                Saving...
            `;
            saveBtn.disabled = true;

            // Mock API call to Denodo backend
            const projectData = {
                title: 'AI-Enhanced Business Plan',
                description: this.selectedIdea || 'Generated business plan from Build Dashboard',
                type: 'Business Plan',
                sections: {
                    essentials: 'Business essentials completed',
                    market: 'Market analysis completed',
                    resources: 'Resource requirements defined',
                    costs: 'Cost estimates calculated',
                    roadmap: 'Deployment roadmap created'
                }
            };

            this.mockApiCall('/api/projects', 'POST', projectData)
                .then(() => {
                    // Reset button
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    
                    this.showSuccessMessage('Project saved successfully!');
                    
                    // Redirect to projects page after short delay
                    setTimeout(() => {
                        window.location.href = 'projects.html';
                    }, 1500);
                })
                .catch(error => {
                    console.error('Failed to save project:', error);
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                    alert('Failed to save project. Please try again.');
                });
        }
    }

    async generateProjectDocumentation() {
        const DEEPSEEK_API_KEY = ''; // Set from environment variable
        
        const prompt = `Create a COMPLETE project development documentation for implementing this business idea:

"${this.selectedIdea || 'A revolutionary business concept'}"

Generate comprehensive documentation with ALL the following sections:

1. PROJECT OVERVIEW
   - Executive summary
   - Project objectives and goals
   - Success criteria
   - Project scope and deliverables

2. TECHNICAL REQUIREMENTS
   - Technology stack recommendations
   - System architecture design
   - Database schema design
   - API specifications
   - Security requirements
   - Scalability considerations

3. DEVELOPMENT PHASES
   - Phase 1: Planning & Design (detailed tasks)
   - Phase 2: Core Development (detailed tasks)
   - Phase 3: Testing & QA (detailed tasks)
   - Phase 4: Deployment (detailed tasks)
   - Phase 5: Maintenance & Support (detailed tasks)

4. FEATURE SPECIFICATIONS
   - Core features list with detailed descriptions
   - User stories and use cases
   - UI/UX requirements
   - Integration requirements

5. TECHNICAL DOCUMENTATION
   - Setup and installation guide
   - Configuration instructions
   - Deployment procedures
   - Environment setup (dev, staging, production)
   - CI/CD pipeline setup

6. API DOCUMENTATION
   - Endpoint specifications
   - Request/response formats
   - Authentication methods
   - Error handling

7. DATABASE DESIGN
   - Entity relationship diagrams
   - Table structures
   - Data models
   - Migration strategies

8. TESTING STRATEGY
   - Unit testing approach
   - Integration testing plan
   - User acceptance testing
   - Performance testing
   - Security testing

9. DEPLOYMENT GUIDE
   - Server requirements
   - Deployment checklist
   - Rollback procedures
   - Monitoring setup
   - Backup strategies

10. MAINTENANCE & SUPPORT
    - Bug tracking process
    - Feature request handling
    - Update procedures
    - Documentation maintenance
    - Support escalation

11. TEAM REQUIREMENTS
    - Required roles and skills
    - Team structure
    - Collaboration tools
    - Communication protocols

12. TIMELINE & MILESTONES
    - Detailed project timeline
    - Key milestones
    - Dependencies
    - Critical path analysis

13. BUDGET & RESOURCES
    - Development costs
    - Infrastructure costs
    - Third-party services
    - Tool and software licenses
    - Contingency budget

14. RISK MANAGEMENT
    - Technical risks
    - Business risks
    - Mitigation strategies
    - Contingency plans

15. APPENDICES
    - Glossary of terms
    - References and resources
    - Code examples
    - Configuration templates

Make this a COMPLETE, production-ready documentation that a development team can use to build the entire project from scratch. Include specific technical details, code snippets where relevant, and actionable steps.`;

        try {
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert technical writer and software architect. Create comprehensive, detailed project documentation that development teams can use to build complete software projects.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 8000
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('DeepSeek API error:', error);
            return this.generateFallbackDocumentation();
        }
    }

    generateFallbackDocumentation() {
        return `# PROJECT DOCUMENTATION

## Project Overview
${this.selectedIdea || 'Business Concept'}

## Technical Requirements
- Modern web technologies
- Cloud-based infrastructure
- Scalable architecture
- Security best practices

## Development Phases
1. Planning & Design
2. Core Development
3. Testing & QA
4. Deployment
5. Maintenance

## Feature Specifications
- Core functionality implementation
- User interface development
- API integration
- Database design

## Deployment Guide
- Server setup
- Configuration
- Monitoring
- Backup procedures

For complete documentation, please ensure API connectivity.`;
    }

    async createAndDownloadWordDoc(content) {
        // Load docx library from CDN
        if (!window.docx) {
            await this.loadDocxLibrary();
        }

        const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = window.docx;

        // Parse content and create document sections
        const sections = this.parseContentToSections(content);
        
        // Create document
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // Title
                    new Paragraph({
                        text: "PROJECT DEVELOPMENT DOCUMENTATION",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 }
                    }),
                    new Paragraph({
                        text: `Generated: ${new Date().toLocaleDateString()}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 }
                    }),
                    ...sections
                ]
            }]
        });

        // Generate and download
        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Project_Documentation_${Date.now()}.docx`;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    async loadDocxLibrary() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    parseContentToSections(content) {
        const { Paragraph, TextRun, HeadingLevel } = window.docx;
        const paragraphs = [];
        
        // Split content by lines
        const lines = content.split('\n');
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            
            // Check if it's a heading
            if (trimmed.startsWith('# ')) {
                paragraphs.push(new Paragraph({
                    text: trimmed.substring(2),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 }
                }));
            } else if (trimmed.startsWith('## ')) {
                paragraphs.push(new Paragraph({
                    text: trimmed.substring(3),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 300, after: 150 }
                }));
            } else if (trimmed.startsWith('### ')) {
                paragraphs.push(new Paragraph({
                    text: trimmed.substring(4),
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                }));
            } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                paragraphs.push(new Paragraph({
                    text: '• ' + trimmed.substring(2),
                    spacing: { before: 100, after: 100 },
                    indent: { left: 720 }
                }));
            } else if (trimmed.match(/^\d+\./)) {
                paragraphs.push(new Paragraph({
                    text: trimmed,
                    spacing: { before: 100, after: 100 },
                    indent: { left: 720 }
                }));
            } else {
                paragraphs.push(new Paragraph({
                    text: trimmed,
                    spacing: { before: 100, after: 100 }
                }));
            }
        }
        
        return paragraphs;
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
            }, 1000 + Math.random() * 1000);
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

    setupCodeGeneration() {
        const generateBtn = document.getElementById('generate-code-btn');
        const downloadBtn = document.getElementById('download-code-btn');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateWebsiteCode());
        }
        
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadWebsiteCode());
        }
    }

    async generateWebsiteCode() {
        if (!this.selectedIdea) {
            alert('Please select an idea first');
            return;
        }

        const generateBtn = document.getElementById('generate-code-btn');
        const downloadBtn = document.getElementById('download-code-btn');
        const codePreview = document.getElementById('code-preview');

        // Show loading state
        generateBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m9 12 2 2 4-4"></path>
            </svg>
            Generating...
        `;
        generateBtn.disabled = true;

        try {
            // Generate website code using AI
            const websiteCode = await this.generateWebsiteWithAI(this.selectedIdea);
            
            // Display the generated code
            codePreview.innerHTML = `
                <div class="code-tabs">
                    <button class="code-tab active" onclick="switchCodeTab('html')">HTML</button>
                    <button class="code-tab" onclick="switchCodeTab('css')">CSS</button>
                    <button class="code-tab" onclick="switchCodeTab('js')">JavaScript</button>
                </div>
                <div class="generated-code" id="html-code">${this.escapeHtml(websiteCode.html)}</div>
                <div class="generated-code" id="css-code" style="display: none;">${this.escapeHtml(websiteCode.css)}</div>
                <div class="generated-code" id="js-code" style="display: none;">${this.escapeHtml(websiteCode.js)}</div>
            `;

            // Show download button
            downloadBtn.style.display = 'inline-flex';
            
            // Store generated code for download
            this.generatedWebsiteCode = websiteCode;

            this.showSuccessMessage('Website code generated successfully!');
            
        } catch (error) {
            console.error('Failed to generate website code:', error);
            alert('Failed to generate website code. Please try again.');
        } finally {
            // Reset button
            generateBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                Generate Code
            `;
            generateBtn.disabled = false;
        }
    }

    async generateWebsiteWithAI(idea) {
        const prompt = `Generate a complete, modern, responsive website for this business idea. Create HTML, CSS, and JavaScript code that includes:

Idea: "${idea}"

Requirements:
1. Modern, professional design with responsive layout
2. Dynamic interface with interactive elements
3. SEO optimized with proper meta tags
4. Mobile-first approach
5. Smooth animations and transitions
6. Contact form functionality
7. Analytics ready
8. Clean, semantic HTML structure
9. Modern CSS with Grid/Flexbox
10. Interactive JavaScript features

Please provide the code in this exact JSON format:
{
    "html": "complete HTML code here",
    "css": "complete CSS code here", 
    "js": "complete JavaScript code here"
}

Make sure the website is production-ready and includes all basic features of a modern business website.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.GEMINI_API_KEY}`, {
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
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;
            
            // Extract JSON from the response
            const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No valid JSON found in response');
            }

            const websiteCode = JSON.parse(jsonMatch[0]);
            
            // Validate that all required parts are present
            if (!websiteCode.html || !websiteCode.css || !websiteCode.js) {
                throw new Error('Incomplete website code generated');
            }

            return websiteCode;
            
        } catch (error) {
            console.error('AI generation failed:', error);
            // Fallback to template-based generation
            return this.generateFallbackWebsite(idea);
        }
    }

    generateFallbackWebsite(idea) {
        // Extract key information from the idea
        const ideaWords = idea.toLowerCase().split(' ');
        const businessType = this.determineBusinessType(ideaWords);
        const businessName = this.generateBusinessName(idea);
        
        return {
            html: this.generateHTML(businessName, idea, businessType),
            css: this.generateCSS(businessType),
            js: this.generateJS()
        };
    }

    determineBusinessType(words) {
        if (words.some(w => ['app', 'mobile', 'software', 'tech', 'digital'].includes(w))) {
            return 'tech';
        } else if (words.some(w => ['food', 'restaurant', 'cafe', 'cooking'].includes(w))) {
            return 'food';
        } else if (words.some(w => ['fashion', 'clothing', 'style', 'wear'].includes(w))) {
            return 'fashion';
        } else if (words.some(w => ['health', 'fitness', 'wellness', 'medical'].includes(w))) {
            return 'health';
        } else if (words.some(w => ['education', 'learning', 'course', 'training'].includes(w))) {
            return 'education';
        } else {
            return 'general';
        }
    }

    generateBusinessName(idea) {
        const words = idea.split(' ').slice(0, 3);
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    generateHTML(businessName, idea, businessType) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${idea}">
    <meta name="keywords" content="${businessName.toLowerCase()}, business, innovation">
    <title>${businessName} - Innovative Business Solution</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav class="nav">
            <div class="nav-container">
                <div class="logo">
                    <h1>${businessName}</h1>
                </div>
                <ul class="nav-menu">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
                <div class="hamburger">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    </header>

    <main>
        <section id="home" class="hero">
            <div class="hero-content">
                <h1 class="hero-title">Welcome to ${businessName}</h1>
                <p class="hero-subtitle">${idea}</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary">Get Started</button>
                    <button class="btn btn-secondary">Learn More</button>
                </div>
            </div>
            <div class="hero-image">
                <div class="hero-placeholder"></div>
            </div>
        </section>

        <section id="about" class="about">
            <div class="container">
                <h2>About ${businessName}</h2>
                <p>We are dedicated to bringing your vision to life through innovative solutions and cutting-edge technology.</p>
                <div class="features">
                    <div class="feature">
                        <div class="feature-icon">🚀</div>
                        <h3>Innovation</h3>
                        <p>Cutting-edge solutions for modern challenges</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">💡</div>
                        <h3>Creativity</h3>
                        <p>Unique approaches to complex problems</p>
                    </div>
                    <div class="feature">
                        <div class="feature-icon">⚡</div>
                        <h3>Efficiency</h3>
                        <p>Streamlined processes for maximum impact</p>
                    </div>
                </div>
            </div>
        </section>

        <section id="services" class="services">
            <div class="container">
                <h2>Our Services</h2>
                <div class="services-grid">
                    <div class="service-card">
                        <h3>Consultation</h3>
                        <p>Expert advice tailored to your needs</p>
                        <button class="btn btn-outline">Learn More</button>
                    </div>
                    <div class="service-card">
                        <h3>Implementation</h3>
                        <p>Full-service project execution</p>
                        <button class="btn btn-outline">Learn More</button>
                    </div>
                    <div class="service-card">
                        <h3>Support</h3>
                        <p>Ongoing assistance and maintenance</p>
                        <button class="btn btn-outline">Learn More</button>
                    </div>
                </div>
            </div>
        </section>

        <section id="contact" class="contact">
            <div class="container">
                <h2>Get In Touch</h2>
                <div class="contact-content">
                    <div class="contact-info">
                        <h3>Let's work together</h3>
                        <p>Ready to bring your idea to life? Contact us today!</p>
                        <div class="contact-details">
                            <div class="contact-item">
                                <span class="contact-label">Email:</span>
                                <span>info@${businessName.toLowerCase().replace(/\s+/g, '')}.com</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-label">Phone:</span>
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                    <form class="contact-form">
                        <div class="form-group">
                            <input type="text" placeholder="Your Name" required>
                        </div>
                        <div class="form-group">
                            <input type="email" placeholder="Your Email" required>
                        </div>
                        <div class="form-group">
                            <textarea placeholder="Your Message" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Send Message</button>
                    </form>
                </div>
            </div>
        </section>
    </main>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>${businessName}</h3>
                    <p>Bringing innovation to life</p>
                </div>
                <div class="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#services">Services</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Follow Us</h4>
                    <div class="social-links">
                        <a href="#">Facebook</a>
                        <a href="#">Twitter</a>
                        <a href="#">LinkedIn</a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 ${businessName}. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>`;
    }

    generateCSS(businessType) {
        const colorSchemes = {
            tech: { primary: '#3b82f6', secondary: '#1e40af' },
            food: { primary: '#f59e0b', secondary: '#d97706' },
            fashion: { primary: '#ec4899', secondary: '#be185d' },
            health: { primary: '#10b981', secondary: '#059669' },
            education: { primary: '#8b5cf6', secondary: '#7c3aed' },
            general: { primary: '#6366f1', secondary: '#4f46e5' }
        };

        const colors = colorSchemes[businessType] || colorSchemes.general;

        return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', sans-serif;
    line-height: 1.6;
    color: #333;
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
}

.logo h1 {
    color: ${colors.primary};
    font-size: 1.5rem;
    font-weight: 700;
}

.nav-menu {
    display: flex;
    list-style: none;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s ease;
}

.nav-menu a:hover {
    color: ${colors.primary};
}

.hamburger {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.hamburger span {
    width: 25px;
    height: 3px;
    background: #333;
    margin: 3px 0;
    transition: 0.3s;
}

/* Hero Section */
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15);
    padding-top: 70px;
}

.hero-content {
    flex: 1;
    max-width: 600px;
    padding: 0 20px;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
}

.btn-primary {
    background: ${colors.primary};
    color: white;
}

.btn-primary:hover {
    background: ${colors.secondary};
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
    background: transparent;
    color: ${colors.primary};
    border: 2px solid ${colors.primary};
}

.btn-secondary:hover {
    background: ${colors.primary};
    color: white;
}

.btn-outline {
    background: transparent;
    color: ${colors.primary};
    border: 2px solid ${colors.primary};
    padding: 8px 16px;
    font-size: 0.9rem;
}

.btn-outline:hover {
    background: ${colors.primary};
    color: white;
}

.hero-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 20px;
}

.hero-placeholder {
    width: 400px;
    height: 300px;
    background: linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20);
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: ${colors.primary};
    border: 2px dashed ${colors.primary}40;
}

/* About Section */
.about {
    padding: 80px 0;
    background: white;
}

.about h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.about p {
    text-align: center;
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto 3rem;
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.feature {
    text-align: center;
    padding: 2rem;
    border-radius: 12px;
    background: #f8fafc;
    transition: transform 0.3s ease;
}

.feature:hover {
    transform: translateY(-5px);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.feature h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.feature p {
    color: #666;
    line-height: 1.6;
}

/* Services Section */
.services {
    padding: 80px 0;
    background: #f8fafc;
}

.services h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.service-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.service-card:hover {
    transform: translateY(-5px);
}

.service-card h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.service-card p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.6;
}

/* Contact Section */
.contact {
    padding: 80px 0;
    background: white;
}

.contact h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: #333;
}

.contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: start;
}

.contact-info h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #333;
}

.contact-info p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
}

.contact-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.contact-item {
    display: flex;
    gap: 1rem;
}

.contact-label {
    font-weight: 600;
    color: #333;
    min-width: 60px;
}

.contact-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: ${colors.primary};
}

/* Footer */
.footer {
    background: #1f2937;
    color: white;
    padding: 3rem 0 1rem;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
    margin-bottom: 1rem;
    color: white;
}

.footer-section p {
    color: #d1d5db;
    line-height: 1.6;
}

.footer-section ul {
    list-style: none;
}

.footer-section ul li {
    margin-bottom: 0.5rem;
}

.footer-section a {
    color: #d1d5db;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-section a:hover {
    color: ${colors.primary};
}

.social-links {
    display: flex;
    gap: 1rem;
}

.footer-bottom {
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid #374151;
    color: #9ca3af;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hamburger {
        display: flex;
    }
    
    .nav-menu {
        display: none;
    }
    
    .hero {
        flex-direction: column;
        text-align: center;
        padding: 2rem 0;
    }
    
    .hero-title {
        font-size: 2.5rem;
    }
    
    .hero-buttons {
        justify-content: center;
    }
    
    .contact-content {
        grid-template-columns: 1fr;
    }
    
    .features {
        grid-template-columns: 1fr;
    }
    
    .services-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .hero-title {
        font-size: 2rem;
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .btn {
        width: 100%;
        max-width: 200px;
    }
}`;
    }

    generateJS() {
        return `// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;
            
            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your message! We\\'ll get back to you soon.');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature, .service-card');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Header background on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });

    // Add loading animation
    window.addEventListener('load', function() {
        document.body.style.opacity = '1';
    });
});

// Initialize page
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';

// Add mobile menu styles dynamically
const style = document.createElement('style');
style.textContent = \`
    @media (max-width: 768px) {
        .nav-menu {
            position: fixed;
            top: 70px;
            left: -100%;
            width: 100%;
            height: calc(100vh - 70px);
            background: white;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            padding-top: 2rem;
            transition: left 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .nav-menu.active {
            left: 0;
        }
        
        .nav-menu li {
            margin: 1rem 0;
        }
        
        .nav-menu a {
            font-size: 1.2rem;
        }
        
        .hamburger.active span:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active span:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    }
\`;
document.head.appendChild(style);`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    downloadWebsiteCode() {
        if (!this.generatedWebsiteCode) {
            alert('No code generated yet. Please generate code first.');
            return;
        }

        // Create a zip-like structure with all files
        const files = {
            'index.html': this.generatedWebsiteCode.html,
            'styles.css': this.generatedWebsiteCode.css,
            'script.js': this.generatedWebsiteCode.js,
            'README.md': `# Generated Website

This website was generated by WAVE AI for your business idea.

## Files Included:
- index.html - Main HTML structure
- styles.css - CSS styling and responsive design
- script.js - JavaScript functionality and interactions

## Setup Instructions:
1. Save all files in the same directory
2. Open index.html in a web browser
3. Customize the content as needed

## Features:
- Responsive design
- Modern UI/UX
- Interactive elements
- SEO optimized
- Mobile-friendly

Generated by WAVE AI - The Idea Graveyard`
        };

        // Download each file
        Object.entries(files).forEach(([filename, content]) => {
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
            element.setAttribute('download', filename);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        });

        this.showSuccessMessage('Website files downloaded successfully!');
    }
}

// Global functions for onclick handlers
function exportToPDF() {
    if (window.buildPage) {
        window.buildPage.exportToPDF();
    }
}

function saveProject() {
    if (window.buildPage) {
        window.buildPage.saveProject();
    }
}

function switchCodeTab(tabName) {
    // Hide all code tabs
    const codeTabs = document.querySelectorAll('.generated-code');
    codeTabs.forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.code-tab');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-code');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Add active class to clicked button
    const clickedButton = document.querySelector(`[onclick="switchCodeTab('${tabName}')"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.buildPage = new BuildPage();
});