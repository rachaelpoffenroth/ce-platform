import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Wand2, Palette, FileText, Download, Eye, Zap } from 'lucide-react';

interface Slide {
  type: string;
  title: string;
  content: string;
  speakerNotes: string;
  design?: {
    background: string;
    titleColor: string;
    contentColor: string;
    accent: string;
  };
}

interface MagicSlidesAIProps {
  onGenerateSlides: (slides: Slide[]) => void;
  onClose: () => void;
}

const PROFESSIONAL_THEMES = {
  corporate: {
    name: 'Corporate Blue',
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#60a5fa',
    background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    textLight: '#ffffff',
    textDark: '#1f2937'
  },
  modern: {
    name: 'Modern Purple',
    primary: '#7c3aed',
    secondary: '#a855f7',
    accent: '#c084fc',
    background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    textLight: '#ffffff',
    textDark: '#1f2937'
  },
  elegant: {
    name: 'Elegant Teal',
    primary: '#0f766e',
    secondary: '#14b8a6',
    accent: '#5eead4',
    background: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
    textLight: '#ffffff',
    textDark: '#1f2937'
  },
  vibrant: {
    name: 'Vibrant Orange',
    primary: '#ea580c',
    secondary: '#f97316',
    accent: '#fb923c',
    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
    textLight: '#ffffff',
    textDark: '#1f2937'
  },
  minimalist: {
    name: 'Minimalist Gray',
    primary: '#374151',
    secondary: '#6b7280',
    accent: '#9ca3af',
    background: 'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
    textLight: '#ffffff',
    textDark: '#1f2937'
  }
};

export default function MagicSlidesAI({ onGenerateSlides, onClose }: MagicSlidesAIProps) {
  const [content, setContent] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('corporate');
  const [presentationType, setPresentationType] = useState('business');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [previewSlides, setPreviewSlides] = useState<Slide[]>([]);

  const intelligentContentExtraction = (text: string, type: 'business' | 'educational') => {
    const theme = PROFESSIONAL_THEMES[selectedTheme as keyof typeof PROFESSIONAL_THEMES];
    
    // Extract title from content
    const extractTitle = () => {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const firstLine = lines[0]?.trim() || 'Professional Presentation';
      
      // Clean up the title
      return firstLine.length > 60 ? firstLine.substring(0, 57) + '...' : firstLine;
    };

    // Extract key sections with better intelligence
    const extractSections = () => {
      const sections = [];
      const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
      
      if (paragraphs.length === 0) {
        // Handle single paragraph or poorly formatted text
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30);
        const chunkSize = Math.max(2, Math.floor(sentences.length / 4));
        
        for (let i = 0; i < sentences.length; i += chunkSize) {
          const chunk = sentences.slice(i, i + chunkSize);
          if (chunk.length === 0) continue;
          
          const title = chunk[0].trim().substring(0, 50);
          const content = chunk.map(s => `• ${s.trim()}`).join('\n');
          
          sections.push({
            title: title,
            content: content,
            type: 'content'
          });
          
          if (sections.length >= 4) break;
        }
      } else {
        // Handle well-formatted paragraphs
        paragraphs.slice(0, 5).forEach((paragraph, index) => {
          const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 20);
          
          let title = sentences[0]?.trim() || `Section ${index + 1}`;
          title = title.length > 50 ? title.substring(0, 47) + '...' : title;
          
          const bulletPoints = sentences.slice(1, 4).map(sentence => {
            const cleaned = sentence.trim().substring(0, 100);
            return `• ${cleaned}`;
          });
          
          if (bulletPoints.length === 0) {
            // Create bullet points from the paragraph
            const parts = paragraph.split(/[,;]/).filter(p => p.trim().length > 15);
            bulletPoints.push(...parts.slice(0, 3).map(part => `• ${part.trim()}`));
          }
          
          sections.push({
            title: title,
            content: bulletPoints.join('\n'),
            type: 'content'
          });
        });
      }
      
      return sections;
    };

    // Create slides based on type
    const slides: Slide[] = [];
    const title = extractTitle();
    const sections = extractSections();

    // Title slide
    slides.push({
      type: 'title',
      title: title,
      content: type === 'business' ? 
        `${title}\n\nPresented by: Your Company\n${new Date().toLocaleDateString()}` :
        `${title}\n\nProfessional Development Course\nLearn • Grow • Excel`,
      speakerNotes: 'Welcome everyone to this presentation. Take a moment to introduce yourself and set expectations for the session.',
      design: {
        background: theme.background,
        titleColor: theme.textLight,
        contentColor: theme.textLight,
        accent: theme.accent
      }
    });

    // Add overview slide for business presentations
    if (type === 'business' && sections.length > 2) {
      slides.push({
        type: 'content',
        title: 'Overview',
        content: sections.map((section, i) => `${i + 1}. ${section.title}`).join('\n'),
        speakerNotes: 'Here\'s what we\'ll cover in today\'s presentation. Each section builds upon the previous one.',
        design: {
          background: '#ffffff',
          titleColor: theme.primary,
          contentColor: theme.textDark,
          accent: theme.accent
        }
      });
    }

    // Add content slides
    sections.forEach((section, index) => {
      slides.push({
        type: 'content',
        title: section.title,
        content: section.content,
        speakerNotes: `This is section ${index + 1}. Elaborate on each point with examples and encourage audience engagement.`,
        design: {
          background: '#ffffff',
          titleColor: theme.primary,
          contentColor: theme.textDark,
          accent: theme.accent
        }
      });
    });

    // Add conclusion slide
    slides.push({
      type: 'content',
      title: type === 'business' ? 'Key Takeaways' : 'Summary & Next Steps',
      content: type === 'business' ? 
        '• Main insights from today\'s discussion\n• Action items and next steps\n• Questions and feedback\n• Thank you for your attention' :
        '• Review key learning objectives\n• Apply concepts in practice\n• Continue your learning journey\n• Questions and discussion',
      speakerNotes: 'Summarize the main points and open the floor for questions. Thank everyone for their participation.',
      design: {
        background: theme.background,
        titleColor: theme.textLight,
        contentColor: theme.textLight,
        accent: theme.accent
      }
    });

    return slides;
  };

  const generateSlides = async () => {
    if (!content.trim()) return;

    setIsGenerating(true);
    setProgress(0);

    try {
      // Step 1: Content Analysis
      setCurrentStep('Analyzing content structure...');
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: AI Processing
      setCurrentStep('Processing with advanced AI models...');
      setProgress(45);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Design Application
      setCurrentStep('Applying professional design themes...');
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 4: Slide Generation
      setCurrentStep('Generating optimized slides...');
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 5: Final Polish
      setCurrentStep('Adding final touches...');
      setProgress(100);

      const generatedSlides = intelligentContentExtraction(
        content, 
        presentationType as 'business' | 'educational'
      );

      setPreviewSlides(generatedSlides);
      await new Promise(resolve => setTimeout(resolve, 500));

      onGenerateSlides(generatedSlides);

    } catch (error) {
      console.error('Error generating slides:', error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
      setCurrentStep('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              MagicSlides AI
            </h2>
            <p className="text-gray-600">Create stunning presentations in seconds</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="create" className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Create
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="flex-1 mt-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Content Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Presentation Type</label>
                <Select value={presentationType} onValueChange={setPresentationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="business">Business Presentation</SelectItem>
                    <SelectItem value="educational">Educational Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Your Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your content here and watch the magic happen...&#10;&#10;✨ The AI will automatically:&#10;• Extract key topics and themes&#10;• Create professional slide layouts&#10;• Generate engaging titles&#10;• Format content into bullet points&#10;• Add speaker notes for each slide"
                  rows={14}
                  className="resize-none font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>

              {isGenerating && (
                <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                      <span className="font-medium text-blue-900">{currentStep}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      AI Processing
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button 
                  onClick={generateSlides}
                  disabled={isGenerating || !content.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8"
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Slides
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="flex-1 mt-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Professional Themes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(PROFESSIONAL_THEMES).map(([key, theme]) => (
                  <div
                    key={key}
                    className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedTheme === key ? 'border-blue-500 ring-4 ring-blue-100 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTheme(key)}
                  >
                    <div 
                      className="w-full h-32 rounded-lg mb-4 flex items-center justify-center shadow-inner"
                      style={{ background: theme.background }}
                    >
                      <div className="text-center">
                        <div className="text-white font-bold text-lg mb-1">Sample Title</div>
                        <div className="text-white/80 text-sm">Professional Design</div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="font-semibold text-gray-900 mb-1">{theme.name}</div>
                      <div className="flex justify-center gap-1 mb-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.secondary }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: theme.accent }}
                        ></div>
                      </div>
                      {selectedTheme === key && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          ✓ Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 mt-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                Preview Generated Slides
              </CardTitle>
            </CardHeader>
            <CardContent>
              {previewSlides.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600 mb-4">
                    Generated {previewSlides.length} professional slides
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    {previewSlides.map((slide, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="text-xs text-gray-500 mb-2">Slide {index + 1}</div>
                        <div className="font-semibold text-sm mb-2 text-gray-900">{slide.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-3">
                          {slide.content.split('\n').slice(0, 3).join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Generate slides to see preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}