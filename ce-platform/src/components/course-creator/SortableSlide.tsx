import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
} from '@/components/ui/card';
import { 
  GripVertical, 
  X, 
  Clock,
  TimerIcon,
} from 'lucide-react';

interface Slide {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  question?: string;
  imageUrl?: string;
  startTime?: number;
  endTime?: number;
}

interface SortableSlideProps {
  slide: Slide;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
  onSetStart: () => void;
  onSetEnd: () => void;
}

export function SortableSlide({
  slide,
  isActive,
  onClick,
  onDelete,
  onSetStart,
  onSetEnd
}: SortableSlideProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  // Format time in MM:SS
  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return "--:--";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get slide title or name based on type
  const getSlideTitle = () => {
    switch (slide.type) {
      case 'title':
        return slide.title || 'Title Slide';
      case 'content':
        return slide.title || 'Content Slide';
      case 'image':
        return slide.title || 'Image Slide';
      case 'quiz':
        return 'Quiz: ' + (slide.question?.substring(0, 20) + '...' || 'Question');
      case 'video':
        return slide.title || 'Video Slide';
      default:
        return 'Slide';
    }
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} transition-colors cursor-pointer`}
      onClick={onClick}
    >
      <CardContent className="p-3 flex items-center">
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing mr-2 text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={16} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mr-2 ${getSlideTypeStyles(slide.type)}`}>
              {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
            </span>
            <p className="text-sm font-medium truncate">{getSlideTitle()}</p>
          </div>
          
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSetStart();
              }}
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(slide.startTime)}
            </Button>
            
            <span className="mx-1">-</span>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onSetEnd();
              }}
            >
              <TimerIcon className="h-3 w-3 mr-1" />
              {formatTime(slide.endTime)}
            </Button>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X size={14} />
          <span className="sr-only">Delete</span>
        </Button>
      </CardContent>
    </Card>
  );
}

// Helper to get color styles based on slide type
function getSlideTypeStyles(type: string): string {
  switch (type) {
    case 'title':
      return 'bg-blue-100 text-blue-800';
    case 'content':
      return 'bg-green-100 text-green-800';
    case 'image':
      return 'bg-purple-100 text-purple-800';
    case 'quiz':
      return 'bg-orange-100 text-orange-800';
    case 'video':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}