import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardListIcon, 
  PlusIcon, 
  EditIcon, 
  PlayIcon,
  CheckCircleIcon 
} from 'lucide-react';
import QuizBuilderModal from './QuizBuilderModal';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface AssignmentSlideProps {
  slideId: string;
  title: string;
  quizQuestions: QuizQuestion[];
  transcript?: string;
  onUpdateSlide: (updates: Partial<AssignmentSlideProps>) => void;
  onUpdateQuiz: (questions: QuizQuestion[]) => void;
  theme: string;
}

export default function AssignmentSlide({
  slideId,
  title,
  quizQuestions = [],
  transcript = '',
  onUpdateSlide,
  onUpdateQuiz,
  theme
}: AssignmentSlideProps) {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  const handleQuizSave = (questions: QuizQuestion[]) => {
    onUpdateQuiz(questions);
    setIsQuizModalOpen(false);
  };

  const hasQuiz = quizQuestions.length > 0;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ClipboardListIcon className="text-blue-600" size={24} />
            <CardTitle className="text-blue-800">Assignment Lesson</CardTitle>
          </div>
          <p className="text-blue-600 text-sm">
            Students must complete this assessment to continue through the course
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            
            {hasQuiz ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircleIcon className="text-green-600" size={20} />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {quizQuestions.length} Question{quizQuestions.length !== 1 ? 's' : ''} Ready
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✅ Multiple choice quiz configured</p>
                  <p>✅ Students must answer all questions correctly</p>
                  <p>✅ Certificate issued upon completion</p>
                </div>

                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsQuizModalOpen(true)}
                  >
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edit Quiz
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsQuizModalOpen(true)}
                  >
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  No quiz has been created for this assignment yet.
                </p>
                
                <Button
                  onClick={() => setIsQuizModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Multiple Choice Quiz
                </Button>
                
                <div className="text-xs text-gray-500 max-w-md mx-auto">
                  <p>
                    You can manually add questions or use our Heights AI to automatically 
                    generate quiz questions from your lesson content.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quiz Builder Modal */}
      <QuizBuilderModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        onSave={handleQuizSave}
        transcript={transcript}
        existingQuestions={quizQuestions}
      />
    </div>
  );
}