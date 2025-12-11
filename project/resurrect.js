document.addEventListener("DOMContentLoaded", () => {
  const questionsPanel = document.getElementById("questions-content");
  const answerPanel = document.getElementById("answer-content");
  const summaryBox = document.getElementById("qa-summary");
  const summaryContent = document.getElementById("summary-content");

  let qaPairs = [];
  let summaryPoints = [];
  let currentIdea = '';
  let isLoading = false;

  // API Keys
  const DEEPSEEK_API_KEY = 'sk-013c001791034dc09f16c477b56f3923';
  const GEMINI_API_KEY = 'AIzaSyCMCkY0yIMWutT2PpqQpBpiMZYwJha2bBg';
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  // Load idea from localStorage
  currentIdea = localStorage.getItem('ideaText') || 'No idea selected';

  // Enhanced starter questions
  const starterQuestions = [
    "What problem does this idea solve?",
    "Who will benefit most from it?",
    "How could it be implemented technically?",
    "What risks or challenges exist?",
    "What resources are required?",
    "What is the market opportunity?",
    "How does it compare to existing solutions?",
    "What is the revenue potential?",
    "What are the key success factors?",
    "How can it be scaled effectively?"
  ];

  // Load starter questions
  starterQuestions.forEach((q) => {
    const item = document.createElement("div");
    item.className = "question-item";
    item.innerHTML = `
      <div class="question-text">${q}</div>
      <div class="question-status">Click to analyze</div>
    `;
    item.addEventListener("click", () => handleQuestionClick(q, item));
    questionsPanel.appendChild(item);
  });

  async function handleQuestionClick(question, element) {
    if (isLoading) return;
    
    // Check if already answered
    if (element.classList.contains("answered")) return;

    isLoading = true;
    element.classList.add("loading");
    element.querySelector(".question-status").textContent = "Analyzing...";

    try {
      // Generate AI-powered answer
      const answer = await generateAIAnswer(question);
      
      qaPairs.push({ q: question, a: answer });
      summaryPoints.push(answer);

      // Mark as answered
      element.classList.remove("loading");
      element.classList.add("answered");
      element.querySelector(".question-status").textContent = "✓ Analyzed";

      // Show answer in right panel with animation
      const answerBlock = document.createElement("div");
      answerBlock.className = "answer-text";
      answerBlock.innerHTML = `
        <div class="answer-question">${question}</div>
        <div class="answer-content">${answer}</div>
        <div class="answer-timestamp">Generated ${new Date().toLocaleTimeString()}</div>
      `;
      
      // Add fade-in animation
      answerBlock.style.opacity = '0';
      answerPanel.appendChild(answerBlock);
      
      // Animate in
      setTimeout(() => {
        answerBlock.style.transition = 'opacity 0.5s ease';
        answerBlock.style.opacity = '1';
      }, 100);

      updateSummary();
      
    } catch (error) {
      console.error('Failed to generate answer:', error);
      
      // Show error state
      element.classList.remove("loading");
      element.classList.add("error");
      element.querySelector(".question-status").textContent = "Error - Click to retry";
      
      // Reset click handler for retry
      element.onclick = () => handleQuestionClick(question, element);
      
    } finally {
      isLoading = false;
    }
  }

  async function generateAIAnswer(question) {
    const prompt = `Analyze this business idea and answer the specific question with detailed, actionable insights:

Idea: "${currentIdea}"
Question: "${question}"

Please provide a comprehensive answer that includes:
1. Direct answer to the question
2. Key insights and analysis
3. Specific recommendations or next steps
4. Potential challenges or considerations
5. Relevant examples or comparisons

Format your response in clear, actionable sections with bullet points where appropriate.`;

    try {
      // Use DeepSeek API for comprehensive analysis
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
              content: 'You are an expert business analyst and consultant. Provide detailed, actionable insights for business ideas with specific recommendations and analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const answerText = data?.choices?.[0]?.message?.content || '';
      
      if (answerText.trim()) {
        return formatAnswer(answerText);
      }
      
      throw new Error('Empty response from DeepSeek');
      
    } catch (error) {
      console.error('DeepSeek API failed, trying Gemini:', error);
      
      // Fallback to Gemini API
      try {
        const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2000,
            }
          })
        });

        if (!geminiResponse.ok) {
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (geminiText && geminiText.trim()) {
          return formatAnswer(geminiText);
        }
        
        throw new Error('Empty response from Gemini');
        
      } catch (geminiError) {
        console.error('Both APIs failed:', geminiError);
        throw new Error('Unable to generate AI analysis. Please check your connection and try again.');
      }
    }
  }

  function formatAnswer(text) {
    // Clean up and format the answer text
    let formatted = text.trim();
    
    // Convert markdown-style formatting to HTML
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    if (!formatted.startsWith('<p>')) {
      formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
  }

  function updateSummary() {
    summaryBox.style.display = "block";
    summaryContent.innerHTML = `
      <ul>
        ${summaryPoints.map((p) => `<li>${p}</li>`).join("")}
      </ul>
    `;
    
    // Create comprehensive resurrection analysis text
    const resurrectionAnalysis = qaPairs.map(qa => 
      `**${qa.q}**\n${qa.a}`
    ).join('\n\n');
    
    // Save to localStorage
    localStorage.setItem("ideaSummary", summaryContent.innerHTML);
    localStorage.setItem("ideaQA", JSON.stringify(qaPairs));
    localStorage.setItem("resurrectionAnalysis", resurrectionAnalysis);
    
    console.log('✅ Resurrection analysis saved:', qaPairs.length, 'Q&A pairs');
  }
});
