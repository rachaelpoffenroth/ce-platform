import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Sparkles, FileText } from 'lucide-react';

interface Slide {
  type: string;
  title: string;
  content: string;
  speakerNotes?: string;
}

interface SuperSimpleSlidesProps {
  onGenerateSlides: (slides: Slide[]) => void;
  onClose: () => void;
}

export default function SuperSimpleSlides({ onGenerateSlides, onClose }: SuperSimpleSlidesProps) {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!content.trim()) return;
    
    setIsGenerating(true);
    setProgress(0);

    try {
      // Progress animation
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Simple content processing
      const slides = processContent(content);
      onGenerateSlides(slides);
      onClose();
      
    } catch (error) {
      console.error('Error generating slides:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const processContent = (text: string): Slide[] => {
    const slides: Slide[] = [];
    
    // Extract title (first non-empty line or generate one)
    const lines = text.split('\n').filter(line => line.trim());
    const title = lines[0]?.trim() || 'Presentation';
    
    // Title slide
    slides.push({
      type: 'title',
      title: title,
      content: 'Created with AI',
      speakerNotes: 'Introduction to the presentation.'
    });
    
    // Content slides - break by paragraphs
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
    
    paragraphs.forEach((paragraph, index) => {
      // Skip first paragraph if it's the title
      if (index === 0 && paragraph.includes(title)) return;
      
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim());
      if (sentences.length === 0) return;
      
      const slideTitle = sentences[0]?.trim().substring(0, 60) || `Slide ${index + 1}`;
      const bulletPoints = sentences.slice(1).map(s => `• ${s.trim()}`).join('\n');
      
      slides.push({
        type: 'content',
        title: slideTitle,
        content: bulletPoints || paragraph,
        speakerNotes: `Notes for slide ${index + 1}`
      });
    });
    
    // Add conclusion slide if enough content
    if (slides.length > 2) {
      slides.push({
        type: 'content',
        title: 'Thank You',
        content: '• Questions?\n• Discussion\n• Next Steps',
        speakerNotes: 'Conclusion of the presentation.'
      });
    }
    
    return slides;
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Create Slides Instantly</h2>
        <p className="text-gray-600">Paste your text and let AI do the work</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text here..."
            rows={10}
            className="resize-none w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isGenerating}
          />
          <div className="text-xs text-gray-500 mt-2 text-right">
            {content.length} characters
          </div>
        </div>
        
        {isGenerating && (
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-2">Creating your slides...</div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !content.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          >
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Create Slides
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="mt-8 flex items-center justify-center text-gray-500 text-sm">
        <FileText className="mr-2 h-4 w-4" />
        Just paste any text - your presentation will be ready in seconds
      </div>
    </div>
  );
}