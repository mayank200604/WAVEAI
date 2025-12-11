// Streaming Service for Human-like Bot Responses
// Simulates realistic typing patterns and streaming responses

export interface StreamingOptions {
  minDelay?: number;
  maxDelay?: number;
  chunkSize?: number;
  humanTypingSpeed?: boolean;
}

export class StreamingService {
  /**
   * Stream text with human-like typing patterns
   */
  static async streamText(
    text: string,
    onChunk: (chunk: string, isComplete: boolean) => void,
    options: StreamingOptions = {}
  ): Promise<void> {
    const {
      minDelay = 30,
      maxDelay = 80,
      chunkSize = 1,
      humanTypingSpeed = true
    } = options;

    let currentText = '';
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Add word character by character for more realistic typing
      if (humanTypingSpeed && word.length > 3) {
        for (let j = 0; j < word.length; j++) {
          currentText += word[j];
          onChunk(currentText, false);
          
          // Variable delay based on character type
          const delay = this.getCharacterDelay(word[j], minDelay, maxDelay);
          await this.delay(delay);
        }
      } else {
        currentText += word;
        onChunk(currentText, false);
        await this.delay(this.randomDelay(minDelay, maxDelay));
      }
      
      // Add space after word (except for last word)
      if (i < words.length - 1) {
        currentText += ' ';
        onChunk(currentText, false);
        
        // Longer pause after punctuation
        const lastChar = word[word.length - 1];
        if (['.', '!', '?', ':'].includes(lastChar)) {
          await this.delay(this.randomDelay(200, 400));
        } else if ([',', ';'].includes(lastChar)) {
          await this.delay(this.randomDelay(100, 200));
        } else {
          await this.delay(this.randomDelay(minDelay, maxDelay));
        }
      }
    }
    
    // Mark as complete
    onChunk(currentText, true);
  }

  /**
   * Get typing delay based on character type
   */
  private static getCharacterDelay(char: string, minDelay: number, maxDelay: number): number {
    // Slower typing for complex characters
    if (['{', '}', '[', ']', '(', ')', '<', '>', '|', '\\', '/', '@', '#', '$', '%', '^', '&', '*'].includes(char)) {
      return this.randomDelay(maxDelay * 1.5, maxDelay * 2);
    }
    
    // Normal typing for letters and numbers
    if (/[a-zA-Z0-9]/.test(char)) {
      return this.randomDelay(minDelay, maxDelay);
    }
    
    // Slightly slower for punctuation
    return this.randomDelay(minDelay * 1.2, maxDelay * 1.2);
  }

  /**
   * Generate random delay between min and max
   */
  private static randomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Promise-based delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Simulate thinking/processing delay before starting to type
   */
  static async simulateThinking(duration: number = 1000): Promise<void> {
    await this.delay(duration);
  }

  /**
   * Add human-like pauses and corrections to text
   */
  static humanizeText(text: string): string {
    // Add occasional hesitations and more natural language
    return text
      .replace(/\bWave AI\b/g, 'Wave AI')
      .replace(/\bI can\b/g, 'I can definitely')
      .replace(/\bYou can\b/g, 'You can absolutely')
      .replace(/\bThis is\b/g, 'This is exactly')
      .replace(/\bWe have\b/g, 'We\'ve got')
      .replace(/\bIt is\b/g, 'It\'s')
      .replace(/\bThat is\b/g, 'That\'s')
      .replace(/\bWe are\b/g, 'We\'re')
      .replace(/\bYou are\b/g, 'You\'re');
  }

  /**
   * Add typing indicators and natural conversation flow
   */
  static addConversationalElements(text: string): string {
    const starters = [
      'Great question! ',
      'Absolutely! ',
      'I\'d love to explain that! ',
      'That\'s a fantastic question! ',
      'Perfect timing for that question! ',
      'I\'m excited to share this with you! '
    ];
    
    const connectors = [
      'Here\'s the thing - ',
      'What makes this special is ',
      'The cool part is ',
      'What\'s really exciting is ',
      'Here\'s what\'s amazing - '
    ];
    
    // Add random starter (20% chance)
    if (Math.random() < 0.2) {
      const starter = starters[Math.floor(Math.random() * starters.length)];
      text = starter + text;
    }
    
    // Add connector in middle of longer responses (30% chance)
    if (text.length > 200 && Math.random() < 0.3) {
      const sentences = text.split('. ');
      if (sentences.length > 2) {
        const midPoint = Math.floor(sentences.length / 2);
        const connector = connectors[Math.floor(Math.random() * connectors.length)];
        sentences[midPoint] = connector + sentences[midPoint].toLowerCase();
        text = sentences.join('. ');
      }
    }
    
    return text;
  }
}
