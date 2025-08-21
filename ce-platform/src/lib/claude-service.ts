// Claude AI Service for content analysis and slide generation
export interface ClaudeConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export interface ContentAnalysis {
  mainTopics: string[];
  keyPoints: string[];
  structure: {
    sections: Array<{
      title: string;
      content: string;
      importance: number;
    }>;
  };
  suggestedSlideCount: number;
  estimatedDuration: number;
}

export interface SlideContent {
  title: string;
  bulletPoints: string[];
  speakerNotes: string;
  visualSuggestions: string[];
  slideType: 'title' | 'content' | 'image' | 'comparison' | 'conclusion';
}

export class ClaudeService {
  private config: ClaudeConfig;

  constructor(config: ClaudeConfig) {
    this.config = config;
  }

  async analyzeContent(text: string, options: {
    targetSlideCount?: number;
    audience?: string;
    tone?: string;
    complexity?: string;
  } = {}): Promise<ContentAnalysis> {
    // Mock implementation - replace with actual Claude API call
    const words = text.split(/\s+/).length;
    const estimatedSlides = Math.max(3, Math.min(15, Math.floor(words / 200)));
    
    const mockAnalysis: ContentAnalysis = {
      mainTopics: this.extractTopics(text),
      keyPoints: this.extractKeyPoints(text),
      structure: {
        sections: this.identifySections(text)
      },
      suggestedSlideCount: options.targetSlideCount || estimatedSlides,
      estimatedDuration: estimatedSlides * 2 // 2 minutes per slide average
    };

    return mockAnalysis;
  }

  async generateSlides(analysis: ContentAnalysis, options: {
    theme?: string;
    includeImages?: boolean;
    speakerNotes?: boolean;
  } = {}): Promise<SlideContent[]> {
    const slides: SlideContent[] = [];

    // Title slide
    slides.push({
      title: analysis.mainTopics[0] || 'Presentation Title',
      bulletPoints: ['AI-Generated Presentation', `${analysis.structure.sections.length} Key Topics`],
      speakerNotes: 'Welcome to this AI-generated presentation. We will cover the main topics identified from your content.',
      visualSuggestions: ['Professional title layout', 'Company logo placement'],
      slideType: 'title'
    });

    // Content slides from sections
    analysis.structure.sections.forEach((section, index) => {
      const bulletPoints = this.extractBulletsFromSection(section.content);
      
      slides.push({
        title: section.title,
        bulletPoints,
        speakerNotes: this.generateSpeakerNotes(section.content),
        visualSuggestions: this.suggestVisuals(section.content),
        slideType: index === analysis.structure.sections.length - 1 ? 'conclusion' : 'content'
      });
    });

    return slides;
  }

  private extractTopics(text: string): string[] {
    // Simple topic extraction - in real implementation, use Claude's analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const topics = sentences
      .slice(0, 5)
      .map(s => s.trim().substring(0, 50) + (s.length > 50 ? '...' : ''));
    
    return topics.length > 0 ? topics : ['Main Topic'];
  }

  private extractKeyPoints(text: string): string[] {
    // Extract key sentences/points
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 8).map(s => s.trim());
  }

  private identifySections(text: string): Array<{ title: string; content: string; importance: number }> {
    // Split text into logical sections
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    return paragraphs.slice(0, 8).map((paragraph, index) => ({
      title: `Section ${index + 1}`,
      content: paragraph.trim(),
      importance: Math.random() * 0.5 + 0.5 // Mock importance score
    }));
  }

  private extractBulletsFromSection(content: string): string[] {
    // Convert content to bullet points
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 4).map(s => s.trim()).filter(s => s.length > 0);
  }

  private generateSpeakerNotes(content: string): string {
    // Generate speaking notes from content
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }

  private suggestVisuals(content: string): string[] {
    // Suggest appropriate visuals based on content
    const suggestions = ['Relevant image', 'Chart or graph', 'Icon illustration'];
    return suggestions.slice(0, 2);
  }
}

// Export configured instance (will be configured when API keys are available)
export const claudeService = new ClaudeService({
  apiKey: process.env.REACT_APP_CLAUDE_API_KEY || 'demo-key',
  model: 'claude-3-sonnet-20240229',
  maxTokens: 4000
});