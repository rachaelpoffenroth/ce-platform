// Document processing service for various file formats
export interface ProcessedDocument {
  content: string;
  metadata: {
    filename: string;
    fileType: string;
    wordCount: number;
    pageCount?: number;
    extractedAt: Date;
  };
  structure: {
    headings: string[];
    paragraphs: number;
    sections: Array<{
      title: string;
      content: string;
      level: number;
    }>;
  };
}

export class DocumentProcessor {
  
  async processFile(file: File): Promise<ProcessedDocument> {
    const fileType = this.getFileType(file);
    
    switch (fileType) {
      case 'txt':
        return this.processTxtFile(file);
      case 'pdf':
        return this.processPdfFile(file);
      case 'docx':
      case 'doc':
        return this.processWordFile(file);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  async processMultipleFiles(files: File[]): Promise<ProcessedDocument[]> {
    const processedDocs = await Promise.all(
      files.map(file => this.processFile(file))
    );
    
    return processedDocs;
  }

  async combineDocuments(documents: ProcessedDocument[]): Promise<ProcessedDocument> {
    const combinedContent = documents.map(doc => doc.content).join('\n\n');
    const totalWordCount = documents.reduce((sum, doc) => sum + doc.metadata.wordCount, 0);
    const allHeadings = documents.flatMap(doc => doc.structure.headings);
    const allSections = documents.flatMap(doc => doc.structure.sections);

    return {
      content: combinedContent,
      metadata: {
        filename: `Combined_${documents.length}_Documents`,
        fileType: 'combined',
        wordCount: totalWordCount,
        extractedAt: new Date()
      },
      structure: {
        headings: allHeadings,
        paragraphs: combinedContent.split(/\n\s*\n/).length,
        sections: allSections
      }
    };
  }

  private getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  private async processTxtFile(file: File): Promise<ProcessedDocument> {
    const content = await this.readFileAsText(file);
    const structure = this.analyzeTextStructure(content);
    
    return {
      content,
      metadata: {
        filename: file.name,
        fileType: 'txt',
        wordCount: this.countWords(content),
        extractedAt: new Date()
      },
      structure
    };
  }

  private async processPdfFile(file: File): Promise<ProcessedDocument> {
    // Mock PDF processing - in real implementation, use PDF.js or similar library
    const mockContent = `[PDF Content from ${file.name}]\n\nThis would contain the extracted text from the PDF file. In a real implementation, this would use a PDF parsing library like PDF.js to extract text content, maintain formatting, and identify document structure including headings, paragraphs, and sections.`;
    
    const structure = this.analyzeTextStructure(mockContent);
    
    return {
      content: mockContent,
      metadata: {
        filename: file.name,
        fileType: 'pdf',
        wordCount: this.countWords(mockContent),
        pageCount: Math.ceil(file.size / 2000), // Mock page count
        extractedAt: new Date()
      },
      structure
    };
  }

  private async processWordFile(file: File): Promise<ProcessedDocument> {
    // Mock Word document processing - in real implementation, use mammoth.js or similar
    const mockContent = `[Word Document from ${file.name}]\n\nThis would contain the extracted text from the Word document. In a real implementation, this would use a library like mammoth.js to extract text content while preserving document structure, formatting, and identifying headings, lists, and other elements.`;
    
    const structure = this.analyzeTextStructure(mockContent);
    
    return {
      content: mockContent,
      metadata: {
        filename: file.name,
        fileType: file.name.endsWith('.docx') ? 'docx' : 'doc',
        wordCount: this.countWords(mockContent),
        extractedAt: new Date()
      },
      structure
    };
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  }

  private analyzeTextStructure(content: string): ProcessedDocument['structure'] {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const headings: string[] = [];
    const sections: Array<{ title: string; content: string; level: number }> = [];
    
    // Simple heading detection (lines that are shorter and may be titles)
    const potentialHeadings = lines.filter(line => 
      line.length < 60 && 
      line.length > 5 && 
      !line.endsWith('.') &&
      /^[A-Z]/.test(line)
    );
    
    headings.push(...potentialHeadings.slice(0, 8)); // Limit to first 8 headings
    
    // Create sections based on paragraphs
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    paragraphs.forEach((paragraph, index) => {
      if (index < 10) { // Limit to first 10 sections
        const firstLine = paragraph.split('\n')[0].trim();
        const title = firstLine.length < 80 ? firstLine : `Section ${index + 1}`;
        
        sections.push({
          title,
          content: paragraph.trim(),
          level: 1
        });
      }
    });

    return {
      headings,
      paragraphs: paragraphs.length,
      sections
    };
  }

  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // Utility method to extract key information for AI processing
  extractKeyInformation(document: ProcessedDocument): {
    summary: string;
    keyTopics: string[];
    importantSections: string[];
  } {
    const { content, structure } = document;
    
    // Create a summary from the first few sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, 3).join('. ') + '.';
    
    // Use headings as key topics
    const keyTopics = structure.headings.slice(0, 5);
    
    // Extract important sections (longer sections with good content)
    const importantSections = structure.sections
      .filter(section => section.content.length > 100)
      .slice(0, 5)
      .map(section => section.title);
    
    return {
      summary,
      keyTopics: keyTopics.length > 0 ? keyTopics : ['Main Content'],
      importantSections
    };
  }
}

// Export configured instance
export const documentProcessor = new DocumentProcessor();