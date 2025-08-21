// Advanced Content Extraction Service - Similar to MagicSlides
export interface ExtractedContent {
  mainTopics: string[];
  keyPoints: Array<{
    topic: string;
    points: string[];
    context: string;
    importance: number;
  }>;
  structure: {
    introduction: string[];
    mainContent: Array<{
      section: string;
      subsections: string[];
    }>;
    conclusion: string[];
  };
  metadata: {
    contentType: 'educational' | 'business' | 'technical' | 'general';
    complexity: 'basic' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
    suggestedSlideCount: number;
  };
}

export class AdvancedContentExtractor {
  // Advanced NLP-style content analysis
  static async extractContent(text: string, source: 'text' | 'pdf' | 'url' | 'video' = 'text'): Promise<ExtractedContent> {
    // Simulate advanced NLP processing
    const sentences = this.splitIntoSentences(text);
    const paragraphs = this.splitIntoParagraphs(text);
    
    // Topic extraction using keyword density and semantic analysis
    const mainTopics = this.extractMainTopics(text);
    
    // Key point extraction with context understanding
    const keyPoints = this.extractKeyPoints(sentences, paragraphs);
    
    // Content structure analysis
    const structure = this.analyzeContentStructure(paragraphs);
    
    // Metadata generation
    const metadata = this.generateMetadata(text, keyPoints.length);
    
    return {
      mainTopics,
      keyPoints,
      structure,
      metadata
    };
  }

  private static splitIntoSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 10);
  }

  private static splitIntoParagraphs(text: string): string[] {
    return text
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 20);
  }

  private static extractMainTopics(text: string): string[] {
    const words = text.toLowerCase().split(/\W+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
    
    // Word frequency analysis
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      if (word.length > 3 && !stopWords.has(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Get top keywords
    const topWords = Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // Enhanced topic detection
    const educationKeywords = ['insurance', 'policy', 'coverage', 'compliance', 'regulation', 'ethics', 'professional', 'continuing', 'education', 'license', 'certification'];
    const detectedTopics = [];

    // Check for educational content
    if (educationKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
      detectedTopics.push('Professional Development');
      detectedTopics.push('Regulatory Compliance');
    }

    // Add domain-specific topics based on content
    if (text.toLowerCase().includes('risk')) detectedTopics.push('Risk Management');
    if (text.toLowerCase().includes('client')) detectedTopics.push('Client Relations');
    if (text.toLowerCase().includes('law') || text.toLowerCase().includes('legal')) detectedTopics.push('Legal Requirements');

    return [...new Set([...detectedTopics, ...topWords.slice(0, 3)])];
  }

  private static extractKeyPoints(sentences: string[], paragraphs: string[]): Array<{
    topic: string;
    points: string[];
    context: string;
    importance: number;
  }> {
    const keyPoints = [];

    paragraphs.forEach((paragraph, index) => {
      const paragraphSentences = sentences.filter(s => paragraph.includes(s));
      
      // Identify important sentences
      const importantSentences = paragraphSentences.filter(sentence => {
        const lowerSentence = sentence.toLowerCase();
        return (
          lowerSentence.includes('important') ||
          lowerSentence.includes('key') ||
          lowerSentence.includes('critical') ||
          lowerSentence.includes('essential') ||
          lowerSentence.includes('must') ||
          lowerSentence.includes('should') ||
          lowerSentence.includes('required') ||
          lowerSentence.includes('significant') ||
          sentence.length > 50 // Longer sentences often contain more information
        );
      });

      if (importantSentences.length > 0) {
        // Extract topic from first few words
        const topic = this.extractTopicFromText(paragraph.substring(0, 100));
        
        keyPoints.push({
          topic,
          points: importantSentences.slice(0, 3), // Max 3 points per topic
          context: paragraph.substring(0, 200) + '...',
          importance: this.calculateImportance(importantSentences, paragraph)
        });
      }
    });

    return keyPoints.sort((a, b) => b.importance - a.importance).slice(0, 8);
  }

  private static extractTopicFromText(text: string): string {
    const words = text.split(' ').slice(0, 10);
    const meaningfulWords = words.filter(word => 
      word.length > 3 && 
      !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'man', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(word.toLowerCase())
    );
    
    return meaningfulWords.slice(0, 3).join(' ') || 'Key Concept';
  }

  private static calculateImportance(sentences: string[], context: string): number {
    let score = sentences.length * 2; // Base score
    
    // Boost score for educational keywords
    const educationalKeywords = ['compliance', 'regulation', 'professional', 'ethics', 'standard', 'requirement', 'policy', 'procedure'];
    educationalKeywords.forEach(keyword => {
      if (context.toLowerCase().includes(keyword)) score += 3;
    });
    
    // Boost for action words
    const actionWords = ['must', 'should', 'required', 'ensure', 'implement', 'follow', 'adhere'];
    actionWords.forEach(word => {
      if (context.toLowerCase().includes(word)) score += 2;
    });
    
    return score;
  }

  private static analyzeContentStructure(paragraphs: string[]): {
    introduction: string[];
    mainContent: Array<{
      section: string;
      subsections: string[];
    }>;
    conclusion: string[];
  } {
    const introduction = [];
    const mainContent = [];
    const conclusion = [];

    paragraphs.forEach((paragraph, index) => {
      const lowerParagraph = paragraph.toLowerCase();
      
      if (index === 0 || lowerParagraph.includes('introduction') || lowerParagraph.includes('overview')) {
        introduction.push(paragraph);
      } else if (index === paragraphs.length - 1 || lowerParagraph.includes('conclusion') || lowerParagraph.includes('summary')) {
        conclusion.push(paragraph);
      } else {
        // Try to identify section headers
        const sentences = paragraph.split('.').filter(s => s.trim().length > 0);
        const sectionTitle = this.extractTopicFromText(sentences[0]);
        
        mainContent.push({
          section: sectionTitle,
          subsections: sentences.slice(1, 4).map(s => s.trim()).filter(s => s.length > 10)
        });
      }
    });

    return { introduction, mainContent, conclusion };
  }

  private static generateMetadata(text: string, keyPointsCount: number): {
    contentType: 'educational' | 'business' | 'technical' | 'general';
    complexity: 'basic' | 'intermediate' | 'advanced';
    estimatedReadTime: number;
    suggestedSlideCount: number;
  } {
    const wordCount = text.split(/\s+/).length;
    const educationalKeywords = ['course', 'training', 'education', 'learning', 'certification', 'compliance'];
    const technicalKeywords = ['system', 'process', 'technical', 'implementation', 'analysis'];
    const businessKeywords = ['business', 'strategy', 'management', 'operations', 'performance'];

    // Determine content type
    let contentType: 'educational' | 'business' | 'technical' | 'general' = 'general';
    if (educationalKeywords.some(kw => text.toLowerCase().includes(kw))) {
      contentType = 'educational';
    } else if (technicalKeywords.some(kw => text.toLowerCase().includes(kw))) {
      contentType = 'technical';
    } else if (businessKeywords.some(kw => text.toLowerCase().includes(kw))) {
      contentType = 'business';
    }

    // Determine complexity
    const avgSentenceLength = wordCount / text.split(/[.!?]+/).length;
    const complexity = avgSentenceLength > 20 ? 'advanced' : avgSentenceLength > 15 ? 'intermediate' : 'basic';

    // Calculate suggested slide count (similar to MagicSlides)
    const baseSlideCount = Math.max(5, Math.min(25, Math.ceil(wordCount / 150))); // ~150 words per slide
    const adjustedSlideCount = Math.ceil(baseSlideCount + (keyPointsCount * 0.5)); // Adjust based on key points

    return {
      contentType,
      complexity,
      estimatedReadTime: Math.ceil(wordCount / 200), // 200 words per minute
      suggestedSlideCount: adjustedSlideCount
    };
  }

  // Enhanced PDF extraction
  static async extractFromPDF(file: File): Promise<string> {
    // This would integrate with a PDF parsing library in a real implementation
    // For now, we'll simulate PDF text extraction
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate PDF text extraction
        const simulatedText = `
          Professional Development in Insurance Industry
          
          This comprehensive course covers essential aspects of professional development for insurance professionals.
          
          Key areas include regulatory compliance, ethical standards, and continuing education requirements.
          
          Regulatory Compliance:
          Insurance professionals must adhere to strict regulatory frameworks that govern their practice.
          These regulations ensure consumer protection and maintain industry standards.
          
          Ethical Standards:
          Professional ethics form the foundation of trustworthy insurance practice.
          Professionals must maintain integrity in all client interactions and business dealings.
          
          Continuing Education:
          Regular training and education are required to maintain professional licenses.
          This ensures professionals stay current with industry developments and best practices.
        `;
        resolve(simulatedText);
      };
      reader.readAsText(file);
    });
  }

  // YouTube video content extraction (simulated)
  static async extractFromVideo(url: string): Promise<string> {
    // In a real implementation, this would use YouTube API + speech-to-text
    return `
      Video Content: Professional Insurance Practices
      
      This video covers fundamental concepts in insurance professional development.
      Key topics include client communication, risk assessment, and regulatory compliance.
      
      The presenter emphasizes the importance of maintaining professional standards
      and staying updated with industry regulations and best practices.
    `;
  }

  // URL content extraction (simulated)
  static async extractFromURL(url: string): Promise<string> {
    // In a real implementation, this would scrape and parse web content
    return `
      Web Content: Industry Best Practices Guide
      
      This comprehensive guide outlines best practices for insurance professionals.
      Topics covered include professional development, regulatory compliance, and ethical conduct.
      
      The content emphasizes continuous learning and adherence to industry standards.
    `;
  }
}