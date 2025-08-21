import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  PlusIcon, 
  TrashIcon, 
  WandIcon, 
  CheckCircleIcon,
  XCircleIcon,
  SaveIcon 
} from 'lucide-react';
import { generateQuizQuestionsFromTranscript } from '@/lib/openai-service';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questions: QuizQuestion[]) => void;
  transcript?: string;
  existingQuestions?: QuizQuestion[];
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export default function QuizBuilderModal({ 
  isOpen, 
  onClose, 
  onSave, 
  transcript = '', 
  existingQuestions = [] 
}: QuizBuilderModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(existingQuestions);
  const [activeTab, setActiveTab] = useState('manual');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  // Initialize with existing questions or create empty question
  useEffect(() => {
    if (existingQuestions.length > 0) {
      setQuestions(existingQuestions);
    } else if (questions.length === 0) {
      addNewQuestion();
    }
  }, [existingQuestions]);

  const addNewQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: generateId(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, field: keyof QuizQuestion, value: string | number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.map((opt, idx) => idx === optionIndex ? value : opt) }
        : q
    ));
  };

  const deleteQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const generateAIQuiz = async () => {
    if (!transcript.trim()) {
      alert('Please add transcript content to generate AI quiz questions.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateQuizQuestionsFromTranscript(transcript);
      
      if (response && response.choices && response.choices[0]) {
        const quizContent = response.choices[0].message.content;
        const quizData = JSON.parse(quizContent);
        
        if (quizData && quizData.quizzes && Array.isArray(quizData.quizzes)) {
          const aiQuestions: QuizQuestion[] = quizData.quizzes.map((q: {
            question: string;
            options: string[];
            correctAnswer: number;
            explanation?: string;
          }) => ({
            id: generateId(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || 'AI generated question'
          }));
          
          setQuestions(aiQuestions);
          setActiveTab('manual'); // Switch to manual tab to review generated questions
          alert(`Generated ${aiQuestions.length} quiz questions from transcript!`);
        }
      }
    } catch (error) {
      console.error('Error generating AI quiz:', error);
      alert('Failed to generate quiz questions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const validateQuiz = () => {
    const errors = [];
    
    questions.forEach((q, index) => {
      if (!q.question.trim()) {
        errors.push(`Question ${index + 1}: Question text is required`);
      }
      if (q.options.some(opt => !opt.trim())) {
        errors.push(`Question ${index + 1}: All answer options must be filled`);
      }
    });

    return errors;
  };

  const handleSave = () => {
    const errors = validateQuiz();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
      return;
    }

    onSave(questions);
    onClose();
  };

  const startPreview = () => {
    if (questions.length === 0) {
      alert('Please add at least one question to preview.');
      return;
    }
    setPreviewMode(true);
    setCurrentPreviewIndex(0);
    setStudentAnswers({});
    setShowResults(false);
  };

  const submitAnswer = (questionId: string, answerIndex: number) => {
    setStudentAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateResults = () => {
    let correct = 0;
    questions.forEach(q => {
      if (studentAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: questions.length, percentage: (correct / questions.length) * 100 };
  };

  const finishQuiz = () => {
    setShowResults(true);
  };

  if (previewMode) {
    const results = showResults ? calculateResults() : null;
    
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Preview - Student View</DialogTitle>
            <DialogDescription>
              Experience how students will take this quiz
            </DialogDescription>
          </DialogHeader>

          {!showResults ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Question {currentPreviewIndex + 1} of {questions.length}
                </span>
                <Button 
                  variant="outline" 
                  onClick={() => setPreviewMode(false)}
                >
                  Exit Preview
                </Button>
              </div>

              {questions[currentPreviewIndex] && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {questions[currentPreviewIndex].question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={studentAnswers[questions[currentPreviewIndex].id]?.toString()}
                      onValueChange={(value) => submitAnswer(questions[currentPreviewIndex].id, parseInt(value))}
                    >
                      {questions[currentPreviewIndex].options.map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                          <Label htmlFor={`option-${idx}`} className="cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>

                    <div className="flex justify-between mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPreviewIndex(Math.max(0, currentPreviewIndex - 1))}
                        disabled={currentPreviewIndex === 0}
                      >
                        Previous
                      </Button>

                      {currentPreviewIndex < questions.length - 1 ? (
                        <Button
                          onClick={() => setCurrentPreviewIndex(currentPreviewIndex + 1)}
                          disabled={studentAnswers[questions[currentPreviewIndex].id] === undefined}
                        >
                          Next
                        </Button>
                      ) : (
                        <Button
                          onClick={finishQuiz}
                          disabled={Object.keys(studentAnswers).length !== questions.length}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Submit Quiz
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <Card className={`border-2 ${results!.percentage >= 70 ? 'border-green-500' : 'border-red-500'}`}>
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {results!.percentage >= 70 ? (
                      <CheckCircleIcon className="text-green-600" />
                    ) : (
                      <XCircleIcon className="text-red-600" />
                    )}
                    Quiz {results!.percentage >= 70 ? 'Passed' : 'Failed'}
                  </CardTitle>
                  <p className="text-2xl font-bold">
                    {results!.correct} / {results!.total} ({results!.percentage.toFixed(0)}%)
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600">
                    {results!.percentage >= 70 
                      ? 'Congratulations! You can continue to the next lesson.'
                      : 'Please review the material and retake the quiz to continue.'
                    }
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h3 className="font-semibold">Review Answers:</h3>
                {questions.map((q, idx) => {
                  const studentAnswer = studentAnswers[q.id];
                  const isCorrect = studentAnswer === q.correctAnswer;
                  
                  return (
                    <Card key={q.id} className={`border ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2 mb-2">
                          {isCorrect ? (
                            <CheckCircleIcon size={20} className="text-green-600 mt-1" />
                          ) : (
                            <XCircleIcon size={20} className="text-red-600 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{q.question}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Your answer: {q.options[studentAnswer]}
                            </p>
                            {!isCorrect && (
                              <p className="text-sm text-green-600 mt-1">
                                Correct answer: {q.options[q.correctAnswer]}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => setPreviewMode(false)}>
                  Exit Preview
                </Button>
                <Button onClick={() => {
                  setShowResults(false);
                  setCurrentPreviewIndex(0);
                  setStudentAnswers({});
                }}>
                  Retake Quiz
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz Builder</DialogTitle>
          <DialogDescription>
            Create multiple-choice assessments for your students. Students must answer all questions correctly to continue.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">AI Quiz Generator</TabsTrigger>
            <TabsTrigger value="manual">Manual Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <WandIcon size={20} />
                  AI Quiz Generator
                </CardTitle>
                <CardDescription>
                  Heights AI reviews the content of your lesson to automatically generate a quiz for your students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Lesson Content</Label>
                  <Textarea
                    value={transcript}
                    readOnly
                    rows={8}
                    placeholder="Add lesson content to generate quiz questions..."
                    className="bg-gray-50"
                  />
                </div>
                
                <Button
                  onClick={generateAIQuiz}
                  disabled={!transcript.trim() || isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <WandIcon className="mr-2 h-4 w-4" />
                      Generate Quiz from Content
                    </>
                  )}
                </Button>

                {questions.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-800 font-medium">
                      ✅ Generated {questions.length} quiz questions
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      Switch to Manual Builder tab to review and edit the generated questions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Quiz Questions ({questions.length})</h3>
              <div className="space-x-2">
                <Button variant="outline" onClick={startPreview}>
                  Preview Quiz
                </Button>
                <Button variant="outline" onClick={addNewQuestion}>
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <Card key={question.id}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <TrashIcon size={16} />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        placeholder="Enter your question here..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Answer Options</Label>
                      <div className="space-y-3 mt-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(question.id, 'correctAnswer', optionIndex)}
                              className="text-green-600"
                            />
                            <Input
                              value={option}
                              onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                              placeholder={`Option ${optionIndex + 1}`}
                              className="flex-1"
                            />
                            <span className="text-xs text-gray-500 w-16">
                              {question.correctAnswer === optionIndex ? 'Correct' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Select the correct answer by clicking the radio button to the left of the choice.
                      </p>
                    </div>

                    <div>
                      <Label>Explanation (Optional)</Label>
                      <Input
                        value={question.explanation || ''}
                        onChange={(e) => updateQuestion(question.id, 'explanation', e.target.value)}
                        placeholder="Explain why this answer is correct..."
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={questions.length === 0}>
            <SaveIcon className="mr-2 h-4 w-4" />
            Finish Editing Quiz
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}