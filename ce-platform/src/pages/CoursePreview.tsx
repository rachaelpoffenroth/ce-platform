import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

// Placeholder slide type interfaces
interface BaseSlide {
  id: string;
  type: string;
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

type Slide = TitleSlide | ContentSlide | ImageSlide | QuizSlide;

export default function CoursePreview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  
  // For demo purposes, we'll use the sample slides
  // In a real implementation, we would get these from the state passed via location.state
  // or fetch them from an API using a course ID
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      type: 'title',
      title: 'The Chamber of a Thousand No\'s',
      subtitle: 'Continuing Education Course'
    },
    {
      id: '2',
      type: 'content',
      title: 'Introduction',
      content: 'Welcome to our Insurance Continuing Education course. In today\'s lesson, we\'ll cover regulatory compliance for insurance providers.'
    },
    {
      id: '3',
      type: 'content',
      title: 'Key Regulations',
      content: 'The first key regulation we\'ll discuss is the Insurance Data Security Model Law. This law requires insurance companies to implement robust information security programs.'
    },
    {
      id: '4',
      type: 'image',
      title: 'Visual Representation',
      imageUrl: '',
      caption: 'Data security framework illustration'
    },
    {
      id: '5',
      type: 'content',
      title: 'Privacy Requirements',
      content: 'Next, we\'ll cover customer privacy requirements under GLBA. Insurance providers must give clear notice about information collection practices.'
    },
    {
      id: '6',
      type: 'quiz',
      question: 'Which law requires insurance companies to implement information security programs?',
      options: [
        'Insurance Data Security Model Law',
        'HIPAA',
        'Gramm-Leach-Bliley Act',
        'Sarbanes-Oxley Act'
      ],
      correctAnswer: 0
    },
    {
      id: '7',
      type: 'content',
      title: 'Ethical Considerations',
      content: 'Finally, we\'ll discuss ethical considerations in insurance sales and marketing.'
    }
  ]);

  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentSlideIndex(index => Math.max(0, index - 1));
  };

  // Navigate to next slide
  const nextSlide = () => {
    const newIndex = Math.min(slides.length - 1, currentSlideIndex + 1);
    setCurrentSlideIndex(newIndex);
    
    // Pause audio on quiz slides
    const nextSlide = slides[newIndex];
    if (nextSlide.type === 'quiz' && audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  };

  // Close preview and return to course builder
  const closePreview = () => {
    navigate(-1);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'Escape') {
        closePreview();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle audio playback
  useEffect(() => {
    // Check if current slide is a quiz slide
    if (slides[currentSlideIndex].type === 'quiz' && audioRef.current && isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
  }, [currentSlideIndex, slides, isAudioPlaying]);
  
  // Current slide to display
  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Navigation bar */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closePreview}
            className="text-white hover:bg-gray-800"
          >
            <XIcon className="h-5 w-5 mr-2" />
            Exit Preview
          </Button>
        </div>
        <div className="text-sm">
          Slide {currentSlideIndex + 1} of {slides.length}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={prevSlide}
            disabled={currentSlideIndex === 0}
            className="text-white hover:bg-gray-800"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextSlide}
            disabled={currentSlideIndex === slides.length - 1}
            className="text-white hover:bg-gray-800"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Slide content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-950">
        <Card className="w-full max-w-4xl aspect-video bg-white shadow-2xl">
          <CardContent className="p-12 h-full flex flex-col justify-center">
            {currentSlide.type === 'title' && (
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-6">{currentSlide.title}</h1>
                <p className="text-xl text-gray-600">{currentSlide.subtitle}</p>
              </div>
            )}
            
            {currentSlide.type === 'content' && (
              <div>
                <h2 className="text-3xl font-semibold mb-6">{currentSlide.title}</h2>
                <p className="text-xl leading-relaxed">{currentSlide.content}</p>
              </div>
            )}
            
            {currentSlide.type === 'quiz' && (
              <div>
                <h2 className="text-3xl font-semibold mb-6">Quiz Question</h2>
                <p className="text-2xl mb-8">{currentSlide.question}</p>
                <div className="space-y-4">
                  {currentSlide.options.map((option, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <span className="font-medium text-lg">{option}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {currentSlide.type === 'image' && (
              <div className="text-center">
                <h2 className="text-3xl font-semibold mb-6">{currentSlide.title}</h2>
                {currentSlide.imageUrl ? (
                  <img 
                    src={currentSlide.imageUrl} 
                    alt={currentSlide.caption} 
                    className="max-h-[400px] mx-auto mb-4"
                  />
                ) : (
                  <div className="bg-gray-100 h-[300px] flex items-center justify-center mb-4 rounded-lg">
                    <p className="text-gray-500">Image placeholder</p>
                  </div>
                )}
                <p className="text-gray-600">{currentSlide.caption}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}