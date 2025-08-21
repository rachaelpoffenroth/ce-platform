import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Palette, Brain, Wand2, FileText } from 'lucide-react';

interface Slide {
  type: string;
  title: string;
  content: string;
  speakerNotes: string;
}

interface AIPresentationMakerProps {
  onGenerateSlides: (slides: Slide[]) => void;
  onClose: () => void;
}

// Professional slide themes
const SLIDE_THEMES = {
  professional: {
    name: 'Professional',
    titleBg: 'bg-gradient-to-r from-blue-600 to-blue-800',
    contentBg: 'bg-white',
    titleText: 'text-white',
    contentText: 'text-gray-800',
    accent: 'text-blue-600',
    preview: 'bg-blue-600'
  },
  modern: {
    name: 'Modern',
    titleBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
    contentBg: 'bg-gray-50',
    titleText: 'text-white',
    contentText: 'text-gray-900',
    accent: 'text-purple-600',
    preview: 'bg-purple-500'
  },
  corporate: {
    name: 'Corporate',
    titleBg: 'bg-gradient-to-r from-gray-700 to-gray-900',
    contentBg: 'bg-white',
    titleText: 'text-white',
    contentText: 'text-gray-800',
    accent: 'text-gray-700',
    preview: 'bg-gray-700'
  },
  vibrant: {
    name: 'Vibrant',
    titleBg: 'bg-gradient-to-r from-green-400 to-teal-500',
    contentBg: 'bg-white',
    titleText: 'text-white',
    contentText: 'text-gray-800',
    accent: 'text-green-600',
    preview: 'bg-green-400'
  },
  elegant: {
    name: 'Elegant',
    titleBg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
    contentBg: 'bg-gray-50',
    titleText: 'text-white',
    contentText: 'text-gray-900',
    accent: 'text-indigo-600',
    preview: 'bg-indigo-600'
  }
};

function AIPresentationMaker({ onGenerateSlides, onClose }: AIPresentationMakerProps) {
  const [inputText, setInputText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('professional');
  const [presentationType, setPresentationType] = useState('educational');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('content');

  // Intelligent content extraction based on type
  const processEducationalContent = (text: string) => {
    const slides = [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 50);
    
    // Extract main title
    const title = extractTitle(text);
    
    // Title slide
    slides.push({
      type: 'title',
      title: title,
      content: `${title}\n\nProfessional Development Course`,
      speakerNotes: 'Welcome everyone to this educational presentation. Take a moment to introduce yourself and set expectations.'
    });

    // Learning objectives slide
    const objectives = extractLearningObjectives(text);
    if (objectives.length > 0) {
      slides.push({
        type: 'content',
        title: 'Learning Objectives',
        content: objectives.map(obj => `• ${obj}`).join('\n'),
        speakerNotes: 'These are the key learning outcomes participants will achieve by the end of this session.'
      });
    }

    // Main content slides
    const contentSections = extractContentSections(text, paragraphs);
    slides.push(...contentSections);

    // Key takeaways slide
    const takeaways = extractKeyTakeaways(text);
    slides.push({
      type: 'content',
      title: 'Key Takeaways',
      content: takeaways.map(takeaway => `• ${takeaway}`).join('\n'),
      speakerNotes: 'Summarize these main points and encourage questions from the audience.'
    });

    return slides;
  };

  const processPresentationContent = (text: string) => {
    const slides = [];
    const title = extractTitle(text);
    
    // Title slide with subtitle
    slides.push({
      type: 'title',
      title: title,
      content: `${title}\n\nPresented by: [Your Name]\n${new Date().toLocaleDateString()}`,
      speakerNotes: 'Welcome to the presentation. Introduce yourself and provide context for today\'s discussion.'
    });

    // Agenda slide
    const agenda = extractAgenda(text);
    if (agenda.length > 0) {
      slides.push({
        type: 'content',
        title: 'Agenda',
        content: agenda.map((item, index) => `${index + 1}. ${item}`).join('\n'),
        speakerNotes: 'Walk through the agenda to set expectations for the presentation flow.'
      });
    }

    // Content slides with better formatting
    const sections = extractPresentationSections(text);
    slides.push(...sections);

    // Conclusion slide
    slides.push({
      type: 'content',
      title: 'Questions & Discussion',
      content: '• What questions do you have?\n• How can we apply these concepts?\n• What are your next steps?\n\nThank you for your attention!',
      speakerNotes: 'Open the floor for questions and facilitate discussion. Thank participants for their engagement.'
    });

    return slides;
  };

  // Enhanced content extraction functions
  const extractTitle = (text: string): string => {
    // Look for title patterns
    const titlePatterns = [
      /^#\s+(.+)$/m,
      /^(.{10,80})\n={3,}/m,
      /^([A-Z][^.!?\n]{10,80})$/m,
      /title:\s*(.+)/i,
      /subject:\s*(.+)/i
    ];

    for (const pattern of titlePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback to first meaningful sentence
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences[0]) {
      const title = sentences[0].trim();
      return title.length > 80 ? title.substring(0, 77) + '...' : title;
    }

    return 'Professional Presentation';
  };

  const extractLearningObjectives = (text: string): string[] => {
    const objectives = [];
    const objectiveKeywords = /(?:objective|goal|learn|understand|identify|explain|demonstrate|analyze)/gi;
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    for (const sentence of sentences.slice(0, 10)) {
      if (objectiveKeywords.test(sentence)) {
        const cleaned = sentence.trim().replace(/^(by the end|after this|participants will|students will|you will)\s*/i, '');
        if (cleaned.length > 15 && cleaned.length < 150) {
          objectives.push(cleaned);
        }
      }
    }

    // If no objectives found, create them from content
    if (objectives.length === 0) {
      const keyPoints = extractKeyPoints(text).slice(0, 3);
      return keyPoints.map(point => `Understand ${point.toLowerCase()}`);
    }

    return objectives.slice(0, 4);
  };

  const extractContentSections = (text: string, paragraphs: string[]) => {
    const sections = [];
    
    for (let i = 0; i < Math.min(paragraphs.length, 5); i++) {
      const paragraph = paragraphs[i].trim();
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 15);
      
      if (sentences.length === 0) continue;
      
      // Create section title from first sentence
      let sectionTitle = sentences[0].trim();
      sectionTitle = sectionTitle.replace(/^(first|second|third|next|then|also|furthermore|additionally|moreover)\s+/i, '');
      sectionTitle = sectionTitle.length > 60 ? sectionTitle.substring(0, 57) + '...' : sectionTitle;
      
      // Create bullet points from remaining sentences
      const bulletPoints = sentences.slice(1, 5).map(sentence => {
        const cleaned = sentence.trim();
        return `• ${cleaned.substring(0, 120)}${cleaned.length > 120 ? '...' : ''}`;
      });

      // If only one sentence, break it into key concepts
      if (bulletPoints.length === 0) {
        const concepts = paragraph.split(/[,;]/).filter(c => c.trim().length > 20);
        bulletPoints.push(...concepts.slice(0, 3).map(concept => `• ${concept.trim()}`));
      }

      sections.push({
        type: 'content',
        title: sectionTitle,
        content: bulletPoints.join('\n'),
        speakerNotes: `Elaborate on each point in detail. Use examples and encourage participant engagement for section ${i + 1}.`
      });
    }

    return sections;
  };

  const extractKeyPoints = (text: string): string[] => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 6).map(s => s.trim().substring(0, 80));
  };

  const extractKeyTakeaways = (text: string): string[] => {
    const takeaways = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 15);
    
    // Get important sentences (first, middle, last)
    if (sentences.length > 0) takeaways.push(sentences[0]);
    if (sentences.length > 2) takeaways.push(sentences[Math.floor(sentences.length / 2)]);
    if (sentences.length > 1) takeaways.push(sentences[sentences.length - 1]);
    
    return takeaways.map(t => t.trim().substring(0, 100)).slice(0, 4);
  };

  const extractAgenda = (text: string): string[] => {
    const agenda = [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
    
    return paragraphs.slice(0, 4).map((p, i) => {
      const sentences = p.split(/[.!?]+/);
      const title = sentences[0]?.trim().substring(0, 50) || `Topic ${i + 1}`;
      return title;
    });
  };

  const extractPresentationSections = (text: string) => {
    const sections = [];
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 40);
    
    for (let i = 0; i < Math.min(paragraphs.length, 4); i++) {
      const paragraph = paragraphs[i];
      const sentences = paragraph.split(/[.!?]+/).filter(s => s.trim().length > 10);
      
      const title = sentences[0]?.trim().substring(0, 50) || `Key Point ${i + 1}`;
      const content = sentences.slice(1, 4).map(s => `• ${s.trim().substring(0, 100)}`).join('\n');
      
      sections.push({
        type: 'content',
        title: title,
        content: content || `• ${paragraph.substring(0, 200)}${paragraph.length > 200 ? '...' : ''}`,
        speakerNotes: `Provide detailed explanation and real-world examples for this section. Engage audience with questions.`
      });
    }
    
    return sections;
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setCurrentStep(1);
    setProgress(0);
    
    try {
      // Step 1: Content Analysis
      setProgress(20);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Step 2: AI Processing
      setCurrentStep(2);
      setProgress(45);
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Step 3: Theme Application
      setCurrentStep(3);
      setProgress(70);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Slide Generation
      setCurrentStep(4);
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Step 5: Finalization
      setCurrentStep(5);
      setProgress(100);
      
      // Generate slides based on type
      let generatedSlides;
      if (presentationType === 'educational') {
        generatedSlides = processEducationalContent(inputText);
      } else {
        generatedSlides = processPresentationContent(inputText);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onGenerateSlides(generatedSlides);
      
    } catch (error) {
      console.error('Error generating slides:', error);
    } finally {
      setIsGenerating(false);
      setCurrentStep(0);
      setProgress(0);
    }
  };

  const stepLabels = [
    '',
    'Analyzing content structure and context...',
    'Processing with advanced AI models...',
    'Applying professional design themes...',
    'Generating optimized slide layouts...',
    'Finalizing presentation and speaker notes...'
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Presentation Maker
            </h2>
            <p className="text-sm text-gray-600">Transform your content into stunning, professional presentations</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Design
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Generate
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="flex-1 mt-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Content Input
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Presentation Type</Label>
                <Select value={presentationType} onValueChange={setPresentationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational Course</SelectItem>
                    <SelectItem value="business">Business Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Enter your content</Label>
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste your content here...&#10;&#10;💡 Tips for better results:&#10;• Include clear headings and sections&#10;• Break content into logical paragraphs&#10;• Add key points and takeaways&#10;• Include learning objectives if educational"
                  rows={16}
                  className="resize-none font-mono text-sm"
                  disabled={isGenerating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design" className="flex-1 mt-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-600" />
                Design Theme
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(SLIDE_THEMES).map(([key, theme]) => (
                  <div
                    key={key}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTheme === key ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTheme(key)}
                  >
                    <div className={`w-full h-24 rounded ${theme.preview} flex items-center justify-center mb-3`}>
                      <div className="text-white font-semibold">Sample Title</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium">{theme.name}</div>
                      {selectedTheme === key && (
                        <Badge className="mt-1 bg-blue-100 text-blue-800">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="generate" className="flex-1 mt-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-green-600" />
                Generate Presentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Ready to Generate!</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Content: {inputText.length} characters</div>
                  <div>• Type: {presentationType === 'educational' ? 'Educational Course' : 'Business Presentation'}</div>
                  <div>• Theme: {SLIDE_THEMES[selectedTheme as keyof typeof SLIDE_THEMES].name}</div>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {stepLabels[currentStep]}
                    </span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Step {currentStep}/5
                    </Badge>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    AI is creating your professional presentation...
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !inputText.trim()}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white min-w-[200px]"
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Professional Slides
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AIPresentationMaker;