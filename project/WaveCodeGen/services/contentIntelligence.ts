/**
 * Content Intelligence Service
 * Generates smart, contextual, and SEO-optimized content for websites
 */

interface BusinessContext {
  industry: string;
  businessType: string;
  targetAudience: string;
  location?: string;
  services: string[];
  uniqueValue: string;
}

interface ContentTemplate {
  headlines: string[];
  taglines: string[];
  serviceDescriptions: string[];
  testimonials: Array<{
    name: string;
    company: string;
    role: string;
    text: string;
    rating: number;
  }>;
  features: Array<{
    title: string;
    description: string;
    benefit: string;
  }>;
  ctaTexts: string[];
  aboutContent: string;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
}

export class ContentIntelligence {
  
  /**
   * Analyze user request and extract business context
   */
  static analyzeBusinessContext(userRequest: string, companyName: string): BusinessContext {
    const request = userRequest.toLowerCase();
    
    // Detect industry
    let industry = 'technology';
    let businessType = 'service';
    let targetAudience = 'businesses';
    let services: string[] = [];
    let uniqueValue = 'innovative solutions';
    
    // Industry detection - Enhanced with more keywords
    if (request.includes('restaurant') || request.includes('food') || request.includes('dining') || request.includes('cafe') || request.includes('bistro') || request.includes('eatery') || request.includes('cuisine')) {
      industry = 'food-service';
      businessType = 'restaurant';
      targetAudience = 'food lovers and culinary enthusiasts';
      services = ['Fine Dining', 'Catering Services', 'Private Events', 'Takeout & Delivery', 'Wine Pairing', 'Chef Specials'];
      uniqueValue = 'exceptional culinary experience with world-class cuisine';
    } else if (request.includes('health') || request.includes('medical') || request.includes('doctor') || request.includes('clinic') || request.includes('hospital') || request.includes('wellness')) {
      industry = 'healthcare';
      businessType = 'medical practice';
      targetAudience = 'patients';
      services = ['Consultations', 'Diagnostics', 'Treatment Plans', 'Preventive Care'];
      uniqueValue = 'compassionate healthcare';
    } else if (request.includes('law') || request.includes('legal') || request.includes('attorney') || request.includes('lawyer')) {
      industry = 'legal';
      businessType = 'law firm';
      targetAudience = 'clients seeking legal help';
      services = ['Legal Consultation', 'Case Representation', 'Document Review', 'Legal Advice'];
      uniqueValue = 'expert legal representation';
    } else if (request.includes('real estate') || request.includes('property') || request.includes('realtor')) {
      industry = 'real-estate';
      businessType = 'real estate agency';
      targetAudience = 'property buyers and sellers';
      services = ['Property Sales', 'Property Management', 'Investment Consulting', 'Market Analysis'];
      uniqueValue = 'trusted property expertise';
    } else if (request.includes('fitness') || request.includes('gym') || request.includes('personal training')) {
      industry = 'fitness';
      businessType = 'fitness center';
      targetAudience = 'fitness enthusiasts';
      services = ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Fitness Assessments'];
      uniqueValue = 'transformative fitness journey';
    } else if (request.includes('education') || request.includes('school') || request.includes('course') || request.includes('learning')) {
      industry = 'education';
      businessType = 'educational institution';
      targetAudience = 'students and learners';
      services = ['Online Courses', 'Certification Programs', 'Tutoring', 'Skill Development'];
      uniqueValue = 'quality education and growth';
    } else if (request.includes('saas') || request.includes('software') || request.includes('app') || request.includes('platform')) {
      industry = 'technology';
      businessType = 'SaaS platform';
      targetAudience = 'businesses and professionals';
      services = ['Cloud Solutions', 'API Integration', 'Data Analytics', 'Custom Development'];
      uniqueValue = 'cutting-edge technology solutions';
    } else if (request.includes('agency') || request.includes('marketing') || request.includes('design') || request.includes('creative')) {
      industry = 'creative-services';
      businessType = 'creative agency';
      targetAudience = 'businesses needing creative solutions';
      services = ['Brand Design', 'Digital Marketing', 'Web Development', 'Content Creation'];
      uniqueValue = 'creative excellence and results';
    } else if (request.includes('consulting') || request.includes('business') || request.includes('strategy') || request.includes('advisory')) {
      industry = 'consulting';
      businessType = 'consulting firm';
      targetAudience = 'business leaders and executives';
      services = ['Strategic Planning', 'Business Analysis', 'Process Optimization', 'Growth Consulting', 'Market Research', 'Change Management'];
      uniqueValue = 'strategic business insights and proven methodologies';
    } else if (request.includes('ecommerce') || request.includes('shop') || request.includes('store') || request.includes('retail') || request.includes('online store')) {
      industry = 'ecommerce';
      businessType = 'online store';
      targetAudience = 'shoppers and consumers';
      services = ['Product Catalog', 'Secure Checkout', 'Fast Shipping', 'Customer Support', 'Returns & Exchanges', 'Loyalty Program'];
      uniqueValue = 'premium shopping experience with quality products';
    } else if (request.includes('fitness') || request.includes('gym') || request.includes('personal training') || request.includes('workout') || request.includes('health club')) {
      industry = 'fitness';
      businessType = 'fitness center';
      targetAudience = 'fitness enthusiasts and health-conscious individuals';
      services = ['Personal Training', 'Group Classes', 'Nutrition Coaching', 'Fitness Assessments', 'Cardio Equipment', 'Strength Training'];
      uniqueValue = 'transformative fitness journey with expert guidance';
    } else if (request.includes('education') || request.includes('school') || request.includes('course') || request.includes('learning') || request.includes('training') || request.includes('academy')) {
      industry = 'education';
      businessType = 'educational institution';
      targetAudience = 'students and lifelong learners';
      services = ['Online Courses', 'Certification Programs', 'Tutoring Services', 'Skill Development', 'Workshops', 'Professional Training'];
      uniqueValue = 'quality education and personal growth opportunities';
    } else if (request.includes('real estate') || request.includes('property') || request.includes('realtor') || request.includes('housing') || request.includes('realty')) {
      industry = 'real-estate';
      businessType = 'real estate agency';
      targetAudience = 'property buyers, sellers, and investors';
      services = ['Property Sales', 'Property Management', 'Investment Consulting', 'Market Analysis', 'Home Staging', 'Property Valuation'];
      uniqueValue = 'trusted property expertise and personalized service';
    } else if (request.includes('law') || request.includes('legal') || request.includes('attorney') || request.includes('lawyer') || request.includes('law firm')) {
      industry = 'legal';
      businessType = 'law firm';
      targetAudience = 'clients seeking legal representation';
      services = ['Legal Consultation', 'Case Representation', 'Document Review', 'Legal Advice', 'Contract Review', 'Litigation Support'];
      uniqueValue = 'expert legal representation with proven results';
    } else if (request.includes('agency') || request.includes('marketing') || request.includes('design') || request.includes('creative') || request.includes('advertising')) {
      industry = 'creative-services';
      businessType = 'creative agency';
      targetAudience = 'businesses needing creative solutions';
      services = ['Brand Design', 'Digital Marketing', 'Web Development', 'Content Creation', 'Social Media Management', 'Graphic Design'];
      uniqueValue = 'creative excellence and measurable results';
    }
    
    return {
      industry,
      businessType,
      targetAudience,
      services,
      uniqueValue
    };
  }
  
  /**
   * Generate intelligent content based on business context
   */
  static generateIntelligentContent(context: BusinessContext, companyName: string): ContentTemplate {
    const templates = this.getIndustryTemplates();
    const industryTemplate = templates[context.industry] || templates['technology'];
    
    // Customize content with company name and context
    const headlines = industryTemplate.headlines.map(h => 
      h.replace('{company}', companyName).replace('{value}', context.uniqueValue)
    );
    
    const taglines = industryTemplate.taglines.map(t => 
      t.replace('{company}', companyName).replace('{audience}', context.targetAudience)
    );
    
    const serviceDescriptions = context.services.map((service, index) => {
      const template = industryTemplate.serviceTemplates[index % industryTemplate.serviceTemplates.length];
      return template.replace('{service}', service).replace('{company}', companyName);
    });
    
    // Generate testimonials with realistic names and companies
    const testimonials = this.generateTestimonials(context, companyName);
    
    // Generate features with benefits
    const features = this.generateFeatures(context);
    
    // Generate CTAs
    const ctaTexts = industryTemplate.ctaTexts.map(cta => 
      cta.replace('{company}', companyName)
    );
    
    // Generate about content
    const aboutContent = industryTemplate.aboutTemplate
      .replace('{company}', companyName)
      .replace('{industry}', context.industry)
      .replace('{value}', context.uniqueValue)
      .replace('{audience}', context.targetAudience);
    
    // Generate FAQ items
    const faqItems = industryTemplate.faqItems.map(faq => ({
      question: faq.question.replace('{company}', companyName),
      answer: faq.answer.replace('{company}', companyName).replace('{value}', context.uniqueValue)
    }));
    
    return {
      headlines,
      taglines,
      serviceDescriptions,
      testimonials,
      features,
      ctaTexts,
      aboutContent,
      faqItems
    };
  }
  
  /**
   * Generate realistic testimonials
   */
  private static generateTestimonials(context: BusinessContext, companyName: string) {
    const names = [
      { name: 'Sarah Johnson', company: 'TechCorp Solutions', role: 'CEO' },
      { name: 'Michael Chen', company: 'Innovation Labs', role: 'CTO' },
      { name: 'Emily Rodriguez', company: 'Growth Dynamics', role: 'Marketing Director' },
      { name: 'David Thompson', company: 'Strategic Ventures', role: 'Operations Manager' },
      { name: 'Lisa Wang', company: 'Digital Innovations', role: 'Product Manager' }
    ];
    
    const testimonialTemplates = {
      'technology': [
        `${companyName} transformed our business operations with their innovative solutions. We saw a 40% increase in efficiency within the first month.`,
        `The team at ${companyName} delivered exactly what we needed. Their technical expertise and customer service are unmatched.`,
        `Working with ${companyName} was a game-changer. They understood our challenges and provided solutions that exceeded our expectations.`
      ],
      'food-service': [
        `The dining experience at ${companyName} is absolutely exceptional. Every dish is crafted with passion and attention to detail.`,
        `${companyName} catered our corporate event and it was flawless. The food was incredible and the service was professional.`,
        `I've been a regular customer for years. ${companyName} consistently delivers amazing food and outstanding service.`
      ],
      'healthcare': [
        `The care I received at ${companyName} was compassionate and thorough. Dr. Smith took the time to explain everything clearly.`,
        `${companyName} provides excellent healthcare services. The staff is professional and the facilities are state-of-the-art.`,
        `I trust ${companyName} with my family's health. They've been our healthcare provider for over 5 years.`
      ]
    };
    
    const templates = testimonialTemplates[context.industry] || testimonialTemplates['technology'];
    
    return names.slice(0, 3).map((person, index) => ({
      name: person.name,
      company: person.company,
      role: person.role,
      text: templates[index % templates.length],
      rating: 5
    }));
  }
  
  /**
   * Generate features with clear benefits
   */
  private static generateFeatures(context: BusinessContext) {
    const featureTemplates = {
      'technology': [
        { title: 'Advanced Analytics', description: 'Real-time data insights and reporting', benefit: 'Make data-driven decisions faster' },
        { title: 'Seamless Integration', description: 'Connect with your existing tools', benefit: 'Streamline your workflow' },
        { title: '24/7 Support', description: 'Round-the-clock technical assistance', benefit: 'Never worry about downtime' }
      ],
      'food-service': [
        { title: 'Fresh Ingredients', description: 'Locally sourced, premium quality ingredients', benefit: 'Taste the difference in every bite' },
        { title: 'Expert Chefs', description: 'Culinary masters with years of experience', benefit: 'Exceptional flavors and presentation' },
        { title: 'Cozy Atmosphere', description: 'Warm and inviting dining environment', benefit: 'Perfect for any occasion' }
      ],
      'healthcare': [
        { title: 'Experienced Doctors', description: 'Board-certified medical professionals', benefit: 'Receive the best possible care' },
        { title: 'Modern Equipment', description: 'State-of-the-art medical technology', benefit: 'Accurate diagnosis and treatment' },
        { title: 'Personalized Care', description: 'Tailored treatment plans for each patient', benefit: 'Healthcare that fits your needs' }
      ]
    };
    
    return featureTemplates[context.industry] || featureTemplates['technology'];
  }
  
  /**
   * Get industry-specific content templates
   */
  private static getIndustryTemplates() {
    return {
      'technology': {
        headlines: [
          'Transform Your Business with {company}',
          'Innovation Meets Excellence at {company}',
          'Unlock Your Potential with {company}',
          'The Future of Technology is Here'
        ],
        taglines: [
          'Empowering {audience} with cutting-edge solutions',
          'Where innovation meets reliability',
          'Your trusted technology partner'
        ],
        serviceTemplates: [
          '{service} - Streamline your operations with our advanced {service} solutions',
          '{service} - Professional {service} services tailored to your needs',
          '{service} - Expert {service} that drives results'
        ],
        ctaTexts: [
          'Start Your Digital Transformation',
          'Get Started Today',
          'Schedule a Free Consultation',
          'Discover Our Solutions'
        ],
        aboutTemplate: `{company} is a leading provider of {value} in the {industry} industry. With years of experience and a team of dedicated experts, we specialize in helping {audience} achieve their goals through innovative technology and exceptional service. Our commitment to excellence and customer success has made us a trusted partner for businesses worldwide. We combine cutting-edge solutions with personalized attention to deliver results that exceed expectations and drive measurable growth.`,
        faqItems: [
          { question: 'How does {company} ensure quality in all services?', answer: 'We follow industry best practices and maintain rigorous quality standards in all our {value}. Our team undergoes continuous training and certification to stay current with the latest technologies and methodologies.' },
          { question: 'What makes {company} different from competitors?', answer: 'Our commitment to {value} and customer success sets us apart. We take a personalized approach, working closely with each client to understand their unique needs and deliver tailored solutions that drive real results.' },
          { question: 'How quickly can we get started with {company}?', answer: 'We can typically begin implementation within 1-2 weeks of initial consultation. Our streamlined onboarding process ensures a smooth transition and quick time-to-value for all clients.' },
          { question: 'What kind of support does {company} provide?', answer: 'We offer comprehensive support including 24/7 technical assistance, dedicated account management, regular check-ins, and ongoing optimization to ensure you get maximum value from our services.' },
          { question: 'Can {company} scale with our business growth?', answer: 'Absolutely! Our solutions are designed to scale seamlessly with your business. Whether you\'re a startup or an enterprise, we have flexible plans and infrastructure that grow with you.' }
        ]
      },
      'food-service': {
        headlines: [
          'Exceptional Dining at {company}',
          'Where Flavor Meets Passion',
          'A Culinary Journey Awaits',
          'Taste the Difference at {company}'
        ],
        taglines: [
          'Creating memorable dining experiences',
          'Fresh ingredients, bold flavors',
          'Your neighborhood culinary destination'
        ],
        serviceTemplates: [
          '{service} - Experience our signature {service} crafted with passion',
          '{service} - Professional {service} for your special occasions',
          '{service} - Delicious {service} made with the finest ingredients'
        ],
        ctaTexts: [
          'Make a Reservation',
          'Order Online Now',
          'View Our Menu',
          'Book Your Table'
        ],
        aboutTemplate: `{company} has been serving {audience} with {value} for years. Our commitment to fresh ingredients, expert preparation, and warm hospitality makes every visit special. We're more than just a restaurant - we're a place where memories are made.`,
        faqItems: [
          { question: 'Do you take reservations?', answer: 'Yes, we accept reservations online or by phone to ensure you have the perfect dining experience.' },
          { question: 'What are your hours?', answer: 'We\'re open Tuesday through Sunday, 5:00 PM to 10:00 PM. Closed Mondays.' },
          { question: 'Do you offer catering?', answer: 'Absolutely! We provide full catering services for events of all sizes.' }
        ]
      },
      'healthcare': {
        headlines: [
          'Your Health, Our Priority',
          'Compassionate Care at {company}',
          'Excellence in Healthcare',
          'Trusted Medical Care'
        ],
        taglines: [
          'Providing compassionate healthcare for all',
          'Your partner in health and wellness',
          'Quality care you can trust'
        ],
        serviceTemplates: [
          '{service} - Comprehensive {service} with a personal touch',
          '{service} - Expert {service} from experienced professionals',
          '{service} - Quality {service} focused on your wellbeing'
        ],
        ctaTexts: [
          'Schedule an Appointment',
          'Contact Us Today',
          'Book Your Visit',
          'Get the Care You Need'
        ],
        aboutTemplate: `{company} is dedicated to providing {value} to our community. Our team of experienced healthcare professionals is committed to your health and wellbeing. We combine medical expertise with compassionate care to ensure the best possible outcomes for our patients.`,
        faqItems: [
          { question: 'How do I schedule an appointment?', answer: 'You can schedule appointments online through our patient portal or by calling our office directly.' },
          { question: 'What insurance do you accept?', answer: 'We accept most major insurance plans. Please contact us to verify your specific coverage.' },
          { question: 'What should I bring to my appointment?', answer: 'Please bring a valid ID, insurance card, and any relevant medical records or medications.' }
        ]
      }
    };
  }
  
  /**
   * Generate SEO-optimized meta tags
   */
  static generateSEOMetaTags(context: BusinessContext, companyName: string): {
    title: string;
    description: string;
    keywords: string[];
    ogTags: Record<string, string>;
  } {
    const title = `${companyName} - ${context.uniqueValue} | ${context.businessType}`;
    const description = `Discover ${context.uniqueValue} at ${companyName}. Serving ${context.targetAudience} with professional ${context.services.join(', ').toLowerCase()} and exceptional service.`;
    
    const keywords = [
      companyName.toLowerCase(),
      context.industry,
      context.businessType,
      ...context.services.map(s => s.toLowerCase()),
      'professional',
      'quality',
      'trusted'
    ];
    
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:type': 'website',
      'og:site_name': companyName
    };
    
    return { title, description, keywords, ogTags };
  }
}
