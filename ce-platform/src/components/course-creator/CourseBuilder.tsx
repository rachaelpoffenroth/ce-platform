import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { saveCourse as saveToStorage } from '@/lib/course-storage';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableSlide } from '@/components/course-creator/SortableSlide';
import CanvasEditor from '@/components/course-creator/CanvasEditor';
import SuperSimpleSlides from '@/components/course-creator/SuperSimpleSlides';
import ProfessionalSlideRenderer from '@/components/course-creator/ProfessionalSlideRenderer';
import { 
  PlusIcon, 
  UploadIcon, 
  PlayIcon, 
  PauseIcon, 
  MicIcon, 
  FileTextIcon,
  ClipboardIcon,
  SaveIcon,
  PaletteIcon,
  Sparkles,
  BrainIcon,
} from 'lucide-react';

// Slide templates
const SLIDE_TEMPLATES = {
  title: { type: 'title', title: 'New Title Slide', subtitle: 'Subtitle here' },
  content: { type: 'content', title: 'Content Slide', content: 'Add your content here' },
  image: { type: 'image', title: 'Image Slide', imageUrl: '', caption: 'Image caption' },
  assignment: { type: 'assignment', title: 'Assignment', quizQuestions: [] },
  quiz: { type: 'quiz', question: 'Question text', options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'], correctAnswer: 0 },
  video: { type: 'video', title: 'Video Slide', videoUrl: '', caption: 'Video caption' },
};

// Slide type interfaces
interface BaseSlide {
  id: string;
  type: string;
  startTime?: number;
  endTime?: number;
}

interface TitleSlide extends BaseSlide {
  type: 'title';
  title: string;
  subtitle: string;
}

interface ContentSlide extends BaseSlide {
  type: 'content';
  title: string;
  content: string;
}

interface ImageSlide extends BaseSlide {
  type: 'image';
  title: string;
  imageUrl: string;
  caption: string;
}

interface QuizSlide extends BaseSlide {
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: number;
}

interface VideoSlide extends BaseSlide {
  type: 'video';
  title: string;
  videoUrl: string;
  caption: string;
}

interface AssignmentSlide extends BaseSlide {
  type: 'assignment';
  title: string;
  quizQuestions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

type Slide = TitleSlide | ContentSlide | ImageSlide | QuizSlide | VideoSlide | AssignmentSlide;

// Course interface
interface Course {
  id: string;
  title: string;
  description: string;
  audioFile: File | null;
  audioUrl: string | null;
  transcript: string;
  slides: Slide[];
}

// Helper function to generate unique IDs
const generateId = () => {
  return Math.random().toString(36).substring(2, 9);
};

import { useLocation } from 'react-router-dom';
import { getCourseById } from '@/lib/course-storage';
import { generateSlidesFromTranscript as openAIGenerateSlides, generateQuizQuestionsFromTranscript, setApiKey, hasApiKey } from '@/lib/openai-service';
import { ApiKeyModal } from '@/components/ui/api-key-modal';
import AssignmentSlide from '@/components/course-creator/AssignmentSlide';
import LessonEditor from '@/components/course-creator/LessonEditor';

export default function CourseBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId;
  
  // Course state with initial values
  const [course, setCourse] = useState<Course>(() => {
    // Try to load existing course if courseId is provided
    if (courseId) {
      const existingCourse = getCourseById(courseId);
      if (existingCourse) {
        // If we have audio URL from localStorage but no actual file (since File objects can't be stored)
        // we need to handle this situation
        return {
          ...existingCourse,
          audioFile: null // File objects cannot be serialized in localStorage
        };
      }
    }
    
    // Default new course
    return {
      id: generateId(),
      title: 'New Course',
      description: '',
      audioFile: null,
      audioUrl: null,
      transcript: '',
      slides: [
        { id: generateId(), type: 'title', title: 'Welcome to the Course', subtitle: 'Learn at your own pace' },
      ]
    };
  });

  // UI state
  const [activeSlideId, setActiveSlideId] = useState<string | null>(course.slides[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [currentTheme, setCurrentTheme] = useState<string>('professional');
  const [viewMode, setViewMode] = useState<'builder' | 'lesson'>('builder');
  const [showMagicSlidesAI, setShowMagicSlidesAI] = useState(false);
  
  // References
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get active slide
  const activeSlide = course.slides.find(slide => slide.id === activeSlideId) || course.slides[0];
  
  // Handle audio file upload
  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create object URL for the audio file
    const audioUrl = URL.createObjectURL(file);
    
    setCourse({
      ...course,
      audioFile: file,
      audioUrl: audioUrl
    });
  };
  
  // Handle transcript upload or generation
  const handleTranscriptChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCourse({
      ...course,
      transcript: e.target.value
    });
  };
  
  // Slide themes
  const SLIDE_THEMES = {
    professional: {
      titleBg: 'bg-blue-700',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-blue-500'
    },
    modern: {
      titleBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-purple-400'
    },
    minimal: {
      titleBg: 'bg-gray-100',
      titleText: 'text-gray-900',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-gray-400'
    },
    corporate: {
      titleBg: 'bg-gray-800',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-gray-700'
    },
    vibrant: {
      titleBg: 'bg-gradient-to-r from-green-400 to-blue-500',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-green-400'
    }
  };

  // The active slide theme
  const [slideTheme, setSlideTheme] = useState<string>('professional');
  
  // Apply theme when it changes
  useEffect(() => {
    setSlideTheme(currentTheme);
  }, [currentTheme]);

  // Handle AI generated slides
  const handleAIGeneratedSlides = (aiSlides: Array<{
    type: string;
    title: string;
    content?: string | string[];
    speakerNotes?: string;
  }>) => {
    const convertedSlides: Slide[] = aiSlides.map((aiSlide, index) => {
      const baseSlide = {
        id: generateId(),
        startTime: undefined,
        endTime: undefined
      };

      if (aiSlide.type === 'title') {
        return {
          ...baseSlide,
          type: 'title' as const,
          title: aiSlide.title,
          subtitle: aiSlide.content?.[0] || 'AI Generated Presentation'
        };
      } else {
        return {
          ...baseSlide,
          type: 'content' as const,
          title: aiSlide.title,
          content: Array.isArray(aiSlide.content) ? aiSlide.content.join('\n\n') : (aiSlide.content || '')
        };
      }
    });

    setCourse(prev => ({
      ...prev,
      slides: [...prev.slides, ...convertedSlides]
    }));
    
    setShowMagicSlidesAI(false);
    
    if (convertedSlides.length > 0) {
      setActiveSlideId(convertedSlides[0].id);
    }
  };

  // Add a new slide
  const addSlide = (type: keyof typeof SLIDE_TEMPLATES) => {
    const newSlide = {
      ...SLIDE_TEMPLATES[type],
      id: generateId(),
    } as Slide;
    
    setCourse({
      ...course,
      slides: [...course.slides, newSlide]
    });
    
    // Set new slide as active
    setActiveSlideId(newSlide.id);
  };
  
  // Update a slide
  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setCourse({
      ...course,
      slides: course.slides.map(slide => 
        slide.id === id ? { ...slide, ...updates } : slide
      )
    });
  };
  
  // Delete a slide
  const deleteSlide = (id: string) => {
    if (course.slides.length <= 1) {
      return; // Don't delete the last slide
    }
    
    const slideIndex = course.slides.findIndex(s => s.id === id);
    const newSlides = course.slides.filter(slide => slide.id !== id);
    
    // Set active slide (previous slide or first slide)
    const newActiveIndex = Math.max(0, slideIndex - 1);
    setActiveSlideId(newSlides[newActiveIndex].id);
    
    setCourse({
      ...course,
      slides: newSlides
    });
  };
  
  // Handle drag end for slide reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = course.slides.findIndex(slide => slide.id === active.id);
      const newIndex = course.slides.findIndex(slide => slide.id === over.id);
      
      setCourse({
        ...course,
        slides: arrayMove(course.slides, oldIndex, newIndex)
      });
    }
  };
  
  // Save course
  const saveCourse = () => {
    try {
      // Prepare the course object for saving
      const courseToSave = {
        ...course,
        status: "draft", 
        lastUpdated: new Date().toISOString(),
        students: 0,
        completion: 0
      };
      
      const result = saveToStorage(courseToSave);
      
      if (result) {
        alert('Course saved successfully!');
        console.log('Course saved:', courseToSave);
        // Navigate back to dashboard or stay on the page
        navigate('/instructor-dashboard');
      } else {
        alert('Failed to save course. Please try again.');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      alert('An error occurred while saving the course.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Course Builder</h1>
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => setShowMagicSlidesAI(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center gap-2 shadow-lg"
          >
            <Sparkles size={16} />
            MagicSlides AI
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/instructor-dashboard')}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Course details & slides list */}
        <div className="lg:col-span-1">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="details">Course Details</TabsTrigger>
              <TabsTrigger value="slides">Slides</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input 
                  id="title" 
                  value={course.title} 
                  onChange={(e) => setCourse({...course, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea 
                  id="description" 
                  value={course.description} 
                  onChange={(e) => setCourse({...course, description: e.target.value})}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={saveCourse}
              >
                <SaveIcon className="mr-2 h-4 w-4" />
                Save Course
              </Button>
            </TabsContent>
            
            <TabsContent value="slides" className="mt-4">
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Slides</h3>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlide('title')}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Title
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlide('content')}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Content
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSlide('quiz')}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Quiz
                  </Button>
                </div>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={course.slides.map(slide => slide.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {course.slides.map((slide) => (
                      <SortableSlide
                        key={slide.id}
                        slide={slide}
                        isActive={slide.id === activeSlideId}
                        onClick={() => setActiveSlideId(slide.id)}
                        onDelete={() => deleteSlide(slide.id)}
                        onSetStart={() => {}}
                        onSetEnd={() => {}}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right column - Slide editor & preview */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="p-6">
              <CanvasEditor 
                slide={activeSlide}
                updateSlide={(updates) => updateSlide(activeSlide.id, updates)}
                theme={currentTheme}
              />
            </CardContent>
          </Card>
          
          {/* Professional Slide Preview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Professional Preview</h3>
                <div className="flex items-center gap-2">
                  <Select value={currentTheme} onValueChange={setCurrentTheme}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="vibrant">Vibrant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                <ProfessionalSlideRenderer 
                  slide={activeSlide}
                  theme={currentTheme}
                  className="w-full h-full"
                />
              </div>
              
              <div className="mt-4 flex justify-center">
                <Button onClick={() => window.open('/course-preview', '_blank')}>
                  Open Full Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showMagicSlidesAI && (
        <Dialog open={showMagicSlidesAI} onOpenChange={setShowMagicSlidesAI}>
          <DialogContent className="max-w-6xl h-[95vh] overflow-hidden p-0 border-0">
            <div className="h-full overflow-auto bg-gray-50">
              <SuperSimpleSlides
                onGenerateSlides={handleAIGeneratedSlides}
                onClose={() => setShowMagicSlidesAI(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Helper function to format time (seconds to MM:SS)
function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}