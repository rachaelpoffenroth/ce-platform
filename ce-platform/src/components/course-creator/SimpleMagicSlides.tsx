import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Upload, FileText, Zap } from 'lucide-react';

interface Slide {
  type: string;
  title: string;
  content: string;
  speakerNotes: string;
}

interface SimpleMagicSlidesProps {
  onGenerateSlides: (slides: Slide[]) => void;
  onClose: () => void;
}

const THEMES = [
  { id: 'modern', name: 'Modern', gradient: 'from-purple-500 to-blue-500', preview: '#8b5cf6' },
  { id: 'professional', name: 'Professional', gradient: 'from-blue-600 to-indigo-600', preview: '#2563eb' },
  { id: 'elegant', name: 'Elegant', gradient: 'from-teal-500 to-green-500', preview: '#14b8a6' },
  { id: 'vibrant', name: 'Vibrant', gradient: 'from-orange-500 to-red-500', preview: '#f97316' },
];

export default function SimpleMagicSlides({ onGenerateSlides, onClose }: SimpleMagicSlidesProps) {
  const [content, setContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const createProfessionalSlides = (text: string) => {
    const slides: Slide[] = [];
    
    // Extract title
    const lines = text.split('\n').filter(line => line.trim());
    const title = lines[0]?.trim() || 'Professional Presentation';
    
    // Title slide
    slides.push({
      type: 'title',
      title: title,
      content: `${title}\n\nCreated with MagicSlides AI\n${new Date().toLocaleDateString()}`,
      speakerNotes: 'Welcome to the presentation. Introduce yourself and the topic.'
    });

    // Split content into meaningful sections
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    
    if (paragraphs.length <= 1) {
      // Handle single block of text
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
      const chunkSize = Math.max(2, Math.floor(sentences.length / 3));
      
      for (let i = 0; i < sentences.length; i += chunkSize) {
        const chunk = sentences.slice(i, i + chunkSize);
        if (chunk.length === 0) continue;
        
        const slideTitle = chunk[0].trim().substring(0, 60);
        const bulletPoints = chunk.map(s => `• ${s.trim()}`).join('\n');
        
        slides.push({
          type: 'content',
          title: slideTitle,
          content: bulletPoints,
          speakerNotes: 'Elaborate on each point with examples and engage with the audience.'
        });
        
        if (slides.length >= 5) break;
      }
    } else {
      // Handle multiple paragraphs
      paragraphs.slice(0, 4).forEach((paragraph, index) => {
        const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 15);
        const slideTitle = sentences[0]?.trim().substring(0, 60) || `Key Point ${index + 1}`;
        
        const bulletPoints = sentences.slice(1, 4).map(s => `• ${s.trim()}`);
        if (bulletPoints.length === 0) {
          bulletPoints.push(`• ${paragraph.substring(0, 100)}...`);
        }
        
        slides.push({
          type: 'content',
          title: slideTitle,
          content: bulletPoints.join('\n'),
          speakerNotes: `Section ${index + 1}: Provide detailed explanation and examples.`
        });
      });
    }

    // Conclusion slide
    slides.push({
      type: 'content',
      title: 'Thank You',
      content: '• Questions & Discussion\n• Key takeaways from today\n• Next steps and follow-up\n• Contact information',
      speakerNotes: 'Summarize key points and open for questions.'
    });

    return slides;
  };

  const handleGenerate = async () => {
    if (!content.trim()) return;
    
    setIsGenerating(true);
    setProgress(0);

    // Simulate AI processing with realistic steps
    const steps = [
      { message: 'Analyzing content...', progress: 25 },
      { message: 'Extracting key themes...', progress: 50 },
      { message: 'Creating slide structure...', progress: 75 },
      { message: 'Applying design...', progress: 100 }
    ];

    for (const step of steps) {
      setProgress(step.progress);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    const slides = createProfessionalSlides(content);
    onGenerateSlides(slides);
    
    setIsGenerating(false);
    setProgress(0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            MagicSlides AI
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Create stunning presentations in seconds</p>
      </div>

      {/* Main Content */}
      <Card className="shadow-xl border-0 bg-white">
        <CardContent className="p-8">
          {/* Theme Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Choose Your Style</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className={`relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200 ${
                    selectedTheme === theme.id 
                      ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div 
                    className="w-full h-16 rounded-lg mb-3 shadow-inner"
                    style={{ backgroundColor: theme.preview }}
                  ></div>
                  <div className="text-center">
                    <div className="font-medium text-sm text-gray-800">{theme.name}</div>
                    {selectedTheme === theme.id && (
                      <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">Selected</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Your Content</h3>
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text, document, or topic here...&#10;&#10;The AI will automatically create professional slides with:&#10;✓ Clear titles and structure&#10;✓ Well-formatted bullet points&#10;✓ Speaker notes&#10;✓ Beautiful design"
                rows={12}
                className="resize-none text-sm border-2 border-gray-200 focus:border-blue-400 rounded-xl p-4"
                disabled={isGenerating}
              />
              <div className="absolute bottom-4 right-4">
                <Badge variant="outline" className="text-xs">
                  {content.length} characters
                </Badge>
              </div>
            </div>
          </div>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                <span className="font-medium text-blue-900">Creating your presentation...</span>
              </div>
              <Progress value={progress} className="h-2 mb-2" />
              <div className="text-sm text-blue-700">AI is working its magic ✨</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FileText className="h-4 w-4" />
              <span>Paste any content to get started</span>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isGenerating}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !content.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-2 rounded-lg shadow-lg disabled:opacity-50"
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

          {/* Features List */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-blue-500" />
                <span>Lightning Fast</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Wand2 className="h-4 w-4 text-purple-500" />
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Sparkles className="h-4 w-4 text-green-500" />
                <span>Professional Design</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}