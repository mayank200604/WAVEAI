import { aiService } from './ai';

export class ContentGenerator {
  /**
   * Generate SEO-optimized content using Groq
   */
  static async generateSEOContent(
    companyName: string,
    businessType: string,
    description: string
  ): Promise<{
    title: string;
    tagline: string;
    heroDescription: string;
    features: Array<{ title: string; description: string; icon: string }>;
    aboutText: string;
    metaDescription: string;
  }> {
    const prompt = `Generate premium, SEO-optimized content for a ${businessType} company called "${companyName}".

Description: ${description}

Generate ONLY a JSON response with this exact structure:
{
  "title": "Compelling company title with keywords",
  "tagline": "Powerful tagline that converts",
  "heroDescription": "Compelling hero description that drives action",
  "features": [
    {
      "title": "Feature 1 Title",
      "description": "Benefit-focused feature description",
      "icon": "⚡"
    },
    {
      "title": "Feature 2 Title", 
      "description": "Benefit-focused feature description",
      "icon": "🚀"
    },
    {
      "title": "Feature 3 Title",
      "description": "Benefit-focused feature description", 
      "icon": "💎"
    }
  ],
  "aboutText": "Professional about section with credibility and trust signals",
  "metaDescription": "SEO-optimized meta description under 160 characters"
}

Requirements:
- Use power words and emotional triggers
- Include relevant keywords naturally
- Focus on benefits, not features
- Create urgency and desire
- Professional and trustworthy tone
- No generic or boring language`;

    try {
      // Use Groq specifically for content generation
      const response = await this.callGroqDirectly(prompt);
      
      if (response) {
        try {
          const parsed = JSON.parse(response);
          return parsed;
        } catch (parseError) {
          console.log('⚠️ JSON parse failed, using fallback content');
        }
      }
    } catch (error) {
      console.log('⚠️ Groq content generation failed, using fallback');
    }
    
    // Fallback content
    return this.getFallbackContent(companyName, businessType);
  }

  private static async callGroqDirectly(prompt: string): Promise<string | null> {
    try {
      const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        throw new Error('Groq API key not found');
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
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
        throw new Error(`Groq API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || null;
    } catch (error) {
      console.error('Groq API call failed:', error);
      return null;
    }
  }

  private static getFallbackContent(companyName: string, businessType: string): any {
    const fallbacks = {
      saas: {
        title: `${companyName} - Revolutionary SaaS Platform`,
        tagline: "Transform Your Business with Cutting-Edge Technology",
        heroDescription: "Streamline operations, boost productivity, and scale your business with our innovative SaaS solution designed for modern enterprises.",
        features: [
          { title: "Lightning Fast Performance", description: "Experience blazing-fast speeds with our optimized infrastructure", icon: "⚡" },
          { title: "Enterprise Security", description: "Bank-level security with end-to-end encryption and compliance", icon: "🔒" },
          { title: "Advanced Analytics", description: "Real-time insights and comprehensive reporting dashboards", icon: "📊" }
        ],
        aboutText: `${companyName} is a leading SaaS provider dedicated to transforming how businesses operate. With cutting-edge technology and innovative solutions, we help companies streamline processes, increase efficiency, and achieve unprecedented growth.`,
        metaDescription: `${companyName} - Revolutionary SaaS platform for modern businesses. Streamline operations, boost productivity, and scale with confidence.`
      },
      restaurant: {
        title: `${companyName} - Exceptional Dining Experience`,
        tagline: "Where Culinary Art Meets Unforgettable Moments",
        heroDescription: "Indulge in exquisite cuisine crafted by world-class chefs in an atmosphere of elegance and sophistication.",
        features: [
          { title: "Award-Winning Cuisine", description: "Michelin-starred dishes crafted with premium ingredients", icon: "🍽️" },
          { title: "Elegant Atmosphere", description: "Sophisticated dining environment with impeccable service", icon: "✨" },
          { title: "Private Events", description: "Exclusive event spaces for memorable celebrations", icon: "🎉" }
        ],
        aboutText: `${companyName} represents the pinnacle of fine dining, where culinary excellence meets exceptional service. Our award-winning chefs create extraordinary dishes using the finest ingredients, delivering an unforgettable dining experience.`,
        metaDescription: `${companyName} - Award-winning fine dining restaurant. Experience exceptional cuisine, elegant atmosphere, and world-class service.`
      },
      portfolio: {
        title: `${companyName} - Creative Design Excellence`,
        tagline: "Transforming Ideas into Visual Masterpieces",
        heroDescription: "Award-winning creative professional specializing in innovative design solutions that captivate audiences and drive results.",
        features: [
          { title: "Creative Excellence", description: "Award-winning designs that stand out and make an impact", icon: "🎨" },
          { title: "Strategic Thinking", description: "Design solutions aligned with business objectives", icon: "🧠" },
          { title: "Client Success", description: "Proven track record of delivering exceptional results", icon: "🏆" }
        ],
        aboutText: `${companyName} is a creative professional with over a decade of experience in delivering innovative design solutions. Specializing in brand identity, digital experiences, and creative strategy, I help businesses stand out in competitive markets.`,
        metaDescription: `${companyName} - Award-winning creative designer. Innovative design solutions, brand identity, and digital experiences that drive results.`
      }
    };

    return fallbacks[businessType as keyof typeof fallbacks] || fallbacks.saas;
  }
}
