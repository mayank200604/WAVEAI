/**
 * Wave AI Web Gen Integration
 * Connects Wave App to Wave AI Web Gen for code generation
 */

export interface WebGenOptions {
  prompt?: string;
  idea?: string;
  techStack?: string;
  mode?: 'new' | 'existing';
}

export class WaveWebGenIntegration {
  private static readonly WEB_GEN_URL = 'http://localhost:5173';
  
  /**
   * Open Wave AI Web Gen in a new tab
   */
  static open(options?: WebGenOptions): void {
    const url = this.buildUrl(options);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Build URL with query parameters
   */
  private static buildUrl(options?: WebGenOptions): string {
    if (!options) {
      return this.WEB_GEN_URL;
    }

    const params = new URLSearchParams();

    if (options.prompt) {
      params.append('prompt', options.prompt);
    }

    if (options.idea) {
      params.append('idea', options.idea);
    }

    if (options.techStack) {
      params.append('techStack', options.techStack);
    }

    if (options.mode) {
      params.append('mode', options.mode);
    }

    const queryString = params.toString();
    return queryString ? `${this.WEB_GEN_URL}?${queryString}` : this.WEB_GEN_URL;
  }

  /**
   * Check if Wave AI Web Gen is running
   */
  static async isRunning(): Promise<boolean> {
    try {
      await fetch(this.WEB_GEN_URL, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate code from an idea
   */
  static generateFromIdea(idea: string, techStack?: string): void {
    this.open({
      prompt: `Create a ${techStack || 'modern web'} application for: ${idea}`,
      idea,
      techStack,
      mode: 'new',
    });
  }

  /**
   * Open with a specific prompt
   */
  static generateFromPrompt(prompt: string): void {
    this.open({ prompt, mode: 'new' });
  }

  /**
   * Format idea for Wave AI Web Gen
   */
  static formatIdeaPrompt(ideaData: {
    title?: string;
    description: string;
    category?: string;
    features?: string[];
  }): string {
    let prompt = '';

    if (ideaData.title) {
      prompt += `# ${ideaData.title}\n\n`;
    }

    prompt += ideaData.description;

    if (ideaData.category) {
      prompt += `\n\nCategory: ${ideaData.category}`;
    }

    if (ideaData.features && ideaData.features.length > 0) {
      prompt += '\n\nKey Features:\n';
      ideaData.features.forEach((feature, index) => {
        prompt += `${index + 1}. ${feature}\n`;
      });
    }

    return prompt;
  }
}

// Export convenience functions
export const openWaveWebGen = (options?: WebGenOptions) => WaveWebGenIntegration.open(options);
export const generateCodeFromIdea = (idea: string, techStack?: string) => 
  WaveWebGenIntegration.generateFromIdea(idea, techStack);
export const generateCodeFromPrompt = (prompt: string) => 
  WaveWebGenIntegration.generateFromPrompt(prompt);
