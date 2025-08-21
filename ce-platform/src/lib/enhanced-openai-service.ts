// Enhanced OpenAI Service with Advanced Slide Generation
export interface SlideGenerationRequest {
  content: string;
  slideCount?: number;
  presentationStyle?: 'educational' | 'business' | 'technical' | 'creative';
  audience?: 'beginners' | 'intermediate' | 'advanced';
  includeNotes?: boolean;
}

export interface GeneratedSlide {
  type: 'title' | 'content' | 'bullets' | 'comparison' | 'quote' | 'image' | 'conclusion';
  title: string;
  content: string | string[];
  speakerNotes?: string;
  imagePrompt?: string;
  layout?: 'single-column' | 'two-column' | 'centered' | 'image-text';
}

export class EnhancedOpenAIService {
  private static apiKey: string | null = null;

  static setApiKey(key: string) {
    this.apiKey = key;
  }

  static hasApiKey(): boolean {
    return !!this.apiKey;
  }

  // Advanced slide generation with contextual understanding
  static async generateSlides(request: SlideGenerationRequest): Promise<GeneratedSlide[]> {
    // For demo purposes, we'll create intelligent mock slides
    // In production, this would call OpenAI GPT-4 with advanced prompts
    
    const { content, slideCount = 8, presentationStyle = 'educational', audience = 'intermediate' } = request;
    
    // Simulate advanced AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return this.createIntelligentSlides(content, slideCount, presentationStyle, audience);
  }

  private static createIntelligentSlides(
    content: string, 
    slideCount: number, 
    style: string, 
    audience: string
  ): GeneratedSlide[] {
    const slides: GeneratedSlide[] = [];
    
    // 1. Title slide
    slides.push({
      type: 'title',
      title: this.extractMainTitle(content),
      content: this.extractSubtitle(content, style),
      speakerNotes: `Welcome to this ${style} presentation. This overview will cover the key concepts outlined in the provided content.`,
      layout: 'centered'
    });

    // 2. Agenda/Overview slide
    const keyTopics = this.extractKeyTopics(content);
    slides.push({
      type: 'bullets',
      title: 'Course Overview',
      content: keyTopics,
      speakerNotes: `Today we'll cover these essential topics. Each section builds upon the previous to give you a comprehensive understanding.`,
      layout: 'single-column'
    });

    // 3-6. Main content slides
    const contentSections = this.divideContentIntoSections(content, slideCount - 3);
    contentSections.forEach((section, index) => {
      const slideType = this.determineSlideType(section, index);
      slides.push({
        type: slideType,
        title: section.title,
        content: section.content,
        speakerNotes: section.notes,
        layout: slideType === 'comparison' ? 'two-column' : 'single-column',
        imagePrompt: slideType === 'image' ? this.generateImagePrompt(section.title) : undefined
      });
    });

    // Last slide - Conclusion/Summary
    slides.push({
      type: 'conclusion',
      title: 'Key Takeaways',
      content: this.generateKeyTakeaways(content),
      speakerNotes: `Let's recap the main points from today's session. These key takeaways should guide your professional practice.`,
      layout: 'centered'
    });

    return slides.slice(0, slideCount);
  }

  private static extractMainTitle(content: string): string {
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length > 5 && firstLine.length < 80) {
      return firstLine;
    }
    
    // Look for educational keywords to create appropriate title
    const educationalWords = ['professional', 'development', 'training', 'education', 'course', 'certification'];
    const hasEducational = educationalWords.some(word => content.toLowerCase().includes(word));
    
    if (hasEducational) {
      return 'Professional Development Course';
    }
    
    return 'Training Presentation';
  }

  private static extractSubtitle(content: string, style: string): string {
    const subtitles = {
      educational: 'Continuing Education for Professionals',
      business: 'Strategic Business Insights',
      technical: 'Technical Implementation Guide',
      creative: 'Innovative Approaches and Solutions'
    };
    
    return subtitles[style as keyof typeof subtitles] || 'Professional Development';
  }

  private static extractKeyTopics(content: string): string[] {
    const topics = [];
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // Look for headings or important statements
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.length > 10 && trimmedLine.length < 100) {
        // Check if it might be a heading (starts with capital, no ending punctuation)
        if (trimmedLine[0] === trimmedLine[0].toUpperCase() && !trimmedLine.endsWith('.')) {
          topics.push(trimmedLine);
        }
        // Or contains important keywords
        else if (trimmedLine.toLowerCase().includes('important') || 
                 trimmedLine.toLowerCase().includes('key') ||
                 trimmedLine.toLowerCase().includes('essential')) {
          topics.push(trimmedLine.replace(/^.*?[:] /, ''));
        }
      }
    });
    
    // If no topics found, create generic ones
    if (topics.length === 0) {
      return [
        'Introduction and Overview',
        'Key Concepts and Principles',
        'Best Practices and Guidelines',
        'Implementation Strategies',
        'Summary and Next Steps'
      ];
    }
    
    return topics.slice(0, 5);
  }

  private static divideContentIntoSections(content: string, sectionCount: number): Array<{
    title: string;
    content: string | string[];
    notes: string;
  }> {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 20);
    const sectionsPerSlide = Math.ceil(paragraphs.length / sectionCount);
    const sections = [];
    
    for (let i = 0; i < sectionCount && i * sectionsPerSlide < paragraphs.length; i++) {
      const sectionParagraphs = paragraphs.slice(i * sectionsPerSlide, (i + 1) * sectionsPerSlide);
      const title = this.generateSectionTitle(sectionParagraphs[0]);
      const content = this.formatSectionContent(sectionParagraphs);
      
      sections.push({
        title,
        content,
        notes: `This section covers: ${title.toLowerCase()}. Take time to explain each point and relate it to real-world applications.`
      });
    }
    
    return sections;
  }

  private static generateSectionTitle(paragraph: string): string {
    const sentences = paragraph.split('.').filter(s => s.trim().length > 0);
    const firstSentence = sentences[0].trim();
    
    // Extract key words for title
    const words = firstSentence.split(' ').slice(0, 6);
    const meaningfulWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'this', 'that', 'with', 'have', 'they', 'will', 'been', 'from', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'about', 'there', 'could', 'other', 'after', 'first', 'well', 'water', 'very', 'what', 'know', 'just', 'where', 'think', 'also', 'back', 'any', 'good', 'woman', 'through', 'us', 'life', 'child', 'work', 'down', 'may', 'after', 'should', 'call', 'world', 'over', 'school', 'still', 'try', 'in', 'as', 'last', 'ask', 'need', 'too', 'feel', 'three', 'when', 'state', 'never', 'become', 'between', 'high', 'really', 'something', 'most', 'another', 'much', 'family', 'own', 'out', 'leave', 'put', 'old', 'while', 'mean', 'on', 'keep', 'student', 'why', 'let', 'great', 'same', 'big', 'group', 'begin', 'seem', 'country', 'help', 'talk', 'where', 'turn', 'problem', 'every', 'start', 'hand', 'might', 'american', 'show', 'part', 'about', 'against', 'place', 'over', 'such', 'again', 'few', 'case', 'most', 'week', 'company', 'where', 'system', 'each', 'right', 'program', 'hear', 'so', 'question', 'during', 'work', 'play', 'government', 'run', 'small', 'number', 'off', 'always', 'move', 'like', 'night', 'live', 'mr', 'point', 'believe', 'hold', 'today', 'bring', 'happen', 'next', 'without', 'before', 'large', 'all', 'million', 'must', 'home', 'under', 'water', 'room', 'write', 'mother', 'area', 'national', 'money', 'story', 'young', 'fact', 'month', 'different', 'lot', 'right', 'study', 'book', 'eye', 'job', 'word', 'though', 'business', 'issue', 'side', 'kind', 'four', 'head', 'far', 'black', 'long', 'both', 'little', 'house', 'yes', 'after', 'since', 'long', 'provide', 'service', 'around', 'friend', 'important', 'father', 'sit', 'away', 'until', 'power', 'hour', 'game', 'often', 'yet', 'line', 'political', 'end', 'among', 'ever', 'stand', 'bad', 'lose', 'however', 'member', 'pay', 'law', 'meet', 'car', 'city', 'almost', 'include', 'continue', 'set', 'later', 'community', 'much', 'name', 'five', 'once', 'white', 'least', 'president', 'learn', 'real', 'change', 'team', 'minute', 'best', 'several', 'idea', 'kid', 'body', 'information', 'nothing', 'ago', 'right', 'lead', 'social', 'understand', 'whether', 'back', 'watch', 'together', 'follow', 'around', 'parent', 'only', 'stop', 'face', 'anything', 'create', 'public', 'already', 'speak', 'others', 'read', 'level', 'allow', 'add', 'office', 'spend', 'door', 'health', 'person', 'art', 'sure', 'such', 'war', 'history', 'party', 'within', 'grow', 'result', 'open', 'morning', 'walk', 'reason', 'low', 'win', 'research', 'girl', 'guy', 'early', 'food', 'before', 'moment', 'himself', 'air', 'teacher', 'force', 'offer'].includes(word.toLowerCase())
    );
    
    return meaningfulWords.slice(0, 4).join(' ') || 'Key Concepts';
  }

  private static formatSectionContent(paragraphs: string[]): string[] {
    const content = [];
    
    paragraphs.forEach(paragraph => {
      // Break long paragraphs into bullet points
      const sentences = paragraph.split('.').filter(s => s.trim().length > 10);
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed.length > 20 && trimmed.length < 200) {
          content.push('• ' + trimmed + (trimmed.endsWith('.') ? '' : '.'));
        }
      });
    });
    
    return content.slice(0, 4); // Max 4 bullets per slide
  }

  private static determineSlideType(section: { title: string; content: string | string[]; notes: string }, index: number): GeneratedSlide['type'] {
    const types: GeneratedSlide['type'][] = ['content', 'bullets', 'comparison', 'quote'];
    
    // Vary slide types for visual interest
    if (index === 0) return 'bullets';
    if (index % 3 === 0) return 'comparison';
    if (index % 4 === 0 && Math.random() > 0.5) return 'quote';
    
    return 'content';
  }

  private static generateImagePrompt(title: string): string {
    const prompts = {
      'professional': 'Professional business meeting, modern office setting',
      'compliance': 'Legal documents and regulations, professional environment',
      'education': 'Learning and development, training session',
      'ethics': 'Handshake, trust and integrity in business',
      'risk': 'Risk assessment charts and analysis',
      'default': 'Professional business concept illustration'
    };
    
    const titleLower = title.toLowerCase();
    for (const [key, prompt] of Object.entries(prompts)) {
      if (titleLower.includes(key)) {
        return prompt;
      }
    }
    
    return prompts.default;
  }

  private static generateKeyTakeaways(content: string): string[] {
    return [
      '• Understanding key concepts is essential for professional practice',
      '• Compliance with regulations protects both professionals and clients',
      '• Continuous learning ensures staying current with industry standards',
      '• Ethical practice builds trust and maintains professional integrity'
    ];
  }

  // Voice cloning integration with ElevenLabs
  static async generateVoiceNarration(slides: GeneratedSlide[], voiceSettings: {
    voice: string;
    stability: number;
    clarity: number;
    useCloning?: boolean;
    clonedVoiceFile?: File;
  }): Promise<Array<{ slideId: string; audioUrl: string }>> {
    // This would integrate with ElevenLabs API for voice cloning
    // For now, return mock audio URLs
    
    return slides.map((slide, index) => ({
      slideId: `slide-${index}`,
      audioUrl: `https://example.com/audio/slide-${index}.mp3`
    }));
  }
}