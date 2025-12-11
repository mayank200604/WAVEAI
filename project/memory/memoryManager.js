// Memory Manager for Chat Storage
class MemoryManager {
  constructor() {
    this.memoryPath = './memory/';
    this.chatHistoryFile = 'chatHistory.json';
    this.ideaHistoryFile = 'ideaHistory.json';
  }

  // Save chat to memory folder
  async saveChatToMemory(chatData) {
    try {
      const timestamp = new Date().toISOString();
      const chatEntry = {
        id: Date.now().toString(),
        timestamp,
        mode: chatData.mode || 'chat',
        messages: chatData.messages || [],
        summary: chatData.summary || '',
        type: chatData.type || 'conversation'
      };

      // Determine which file to save to
      const fileName = chatData.mode === 'idea' ? this.ideaHistoryFile : this.chatHistoryFile;
      const filePath = this.memoryPath + fileName;

      // Read existing data
      let existingData = [];
      try {
        const response = await fetch(filePath);
        if (response.ok) {
          existingData = await response.json();
        }
      } catch (error) {
        console.log('Creating new memory file:', fileName);
      }

      // Add new entry to beginning
      existingData.unshift(chatEntry);

      // Keep only last 100 entries to prevent file from getting too large
      if (existingData.length > 100) {
        existingData = existingData.slice(0, 100);
      }

      // Save to localStorage as backup
      localStorage.setItem('chatHistory', JSON.stringify(existingData));

      // Also save to memory folder (simulated with localStorage for now)
      localStorage.setItem(`memory_${fileName}`, JSON.stringify(existingData));

      return chatEntry;
    } catch (error) {
      console.error('Error saving chat to memory:', error);
      throw error;
    }
  }

  // Load chat history from memory
  async loadChatHistory(mode = 'chat') {
    try {
      const fileName = mode === 'idea' ? this.ideaHistoryFile : this.chatHistoryFile;
      const memoryKey = `memory_${fileName}`;
      
      // Try to load from memory folder first
      let data = localStorage.getItem(memoryKey);
      
      if (!data) {
        // Fallback to regular localStorage
        data = localStorage.getItem('chatHistory');
      }

      if (data) {
        return JSON.parse(data);
      }

      return [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }

  // Get specific chat by ID
  async getChatById(chatId, mode = 'chat') {
    try {
      const history = await this.loadChatHistory(mode);
      return history.find(chat => chat.id === chatId);
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      return null;
    }
  }

  // Update chat in memory
  async updateChatInMemory(chatId, updates, mode = 'chat') {
    try {
      const history = await this.loadChatHistory(mode);
      const chatIndex = history.findIndex(chat => chat.id === chatId);
      
      if (chatIndex !== -1) {
        history[chatIndex] = { ...history[chatIndex], ...updates };
        
        const fileName = mode === 'idea' ? this.ideaHistoryFile : this.chatHistoryFile;
        const memoryKey = `memory_${fileName}`;
        
        localStorage.setItem(memoryKey, JSON.stringify(history));
        localStorage.setItem('chatHistory', JSON.stringify(history));
        
        return history[chatIndex];
      }
      
      return null;
    } catch (error) {
      console.error('Error updating chat in memory:', error);
      return null;
    }
  }

  // Delete chat from memory
  async deleteChatFromMemory(chatId, mode = 'chat') {
    try {
      const history = await this.loadChatHistory(mode);
      const filteredHistory = history.filter(chat => chat.id !== chatId);
      
      const fileName = mode === 'idea' ? this.ideaHistoryFile : this.chatHistoryFile;
      const memoryKey = `memory_${fileName}`;
      
      localStorage.setItem(memoryKey, JSON.stringify(filteredHistory));
      localStorage.setItem('chatHistory', JSON.stringify(filteredHistory));
      
      return true;
    } catch (error) {
      console.error('Error deleting chat from memory:', error);
      return false;
    }
  }

  // Get chat statistics
  async getChatStats() {
    try {
      const chatHistory = await this.loadChatHistory('chat');
      const ideaHistory = await this.loadChatHistory('idea');
      
      return {
        totalChats: chatHistory.length,
        totalIdeas: ideaHistory.length,
        totalConversations: chatHistory.length + ideaHistory.length,
        lastChat: chatHistory[0]?.timestamp || null,
        lastIdea: ideaHistory[0]?.timestamp || null
      };
    } catch (error) {
      console.error('Error getting chat stats:', error);
      return {
        totalChats: 0,
        totalIdeas: 0,
        totalConversations: 0,
        lastChat: null,
        lastIdea: null
      };
    }
  }
}

// Create global instance
const memoryManager = new MemoryManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MemoryManager;
} else {
  window.MemoryManager = MemoryManager;
  window.memoryManager = memoryManager;
}
