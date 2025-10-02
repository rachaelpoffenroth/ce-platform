import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import ProgressTracker from "@/components/ProgressTracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Volume2, 
  Clock, 
  Users, 
  CheckCircle, 
  BookOpen, 
  Brain,
  Tag,
  BarChart,
  Eye,
  Edit,
  Share,
  Download,
  MessageSquare
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import type { Course, Enrollment, CourseModule, Quiz } from "@shared/schema";

export default function CourseViewer() {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
  });

  const { data: modules = [], isLoading: modulesLoading } = useQuery({
    queryKey: ["/api/courses", courseId, "modules"],
    enabled: !!courseId,
  });

  const { data: enrollment } = useQuery({
    queryKey: ["/api/enrollments", courseId],
    enabled: !!courseId && user?.role !== "instructor",
  });

  const { data: quizzes = [] } = useQuery({
    queryKey: ["/api/courses", courseId, "quizzes"],
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/enrollments", { courseId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrolled Successfully",
        description: "You have been enrolled in this course!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/enrollments"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: { moduleId: string; completed: boolean; timeSpent: number }) => {
      const response = await apiRequest("POST", "/api/module-progress", {
        enrollmentId: enrollment?.id,
        ...data
      });
      return response.json();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data: { quizId: string; answers: Record<string, number> }) => {
      const response = await apiRequest("POST", "/api/quiz-attempts", {
        enrollmentId: enrollment?.id,
        quizId: data.quizId,
        answers: Object.values(data.answers)
      });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: result.passed ? "Quiz Passed!" : "Quiz Failed",
        description: `You scored ${Math.round(result.score)}%. ${
          result.passed ? "Great job!" : "You need 75% to pass."
        }`,
        variant: result.passed ? "default" : "destructive",
      });
      if (result.passed) {
        setShowQuiz(false);
        handleNextModule();
      }
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Submission Failed",
        description: "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Audio control handlers
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleNextModule = () => {
    if (currentModuleIndex < modules.length - 1) {
      const currentModule = modules[currentModuleIndex];
      
      // Update progress for current module
      if (enrollment && currentModule) {
        updateProgressMutation.mutate({
          moduleId: currentModule.id,
          completed: true,
          timeSpent: Math.round(currentTime)
        });
      }
      
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentTime(0);
      setIsPlaying(false);
      
      // Check if next module has a quiz
      const nextModuleQuiz = quizzes.find(q => q.moduleId === modules[currentModuleIndex + 1]?.id);
      if (nextModuleQuiz) {
        setShowQuiz(true);
      }
    }
  };

  const handlePreviousModule = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleQuizSubmit = () => {
    const currentQuiz = quizzes.find(q => q.moduleId === modules[currentModuleIndex]?.id);
    if (!currentQuiz) return;

    submitQuizMutation.mutate({
      quizId: currentQuiz.id,
      answers: quizAnswers
    });
  };

  const isInstructor = user?.id === course?.instructorId;
  const isEnrolled = !!enrollment;
  const canView = isInstructor || isEnrolled;
  const currentModule = modules[currentModuleIndex];
  const progressPercentage = modules.length > 0 ? (currentModuleIndex / modules.length) * 100 : 0;

  if (courseLoading || modulesLoading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Course Not Found</h1>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Course Header */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={course.status === "published" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
                {course.accreditationType === "AIC" && (
                  <Badge variant="outline">AIC Compliant</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{course.title}</h1>
              <p className="text-muted-foreground mb-4">{course.description}</p>
              
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration} minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{modules.length} modules</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.accreditationClass}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {!canView && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">${course.price}</p>
                  <Button 
                    size="lg" 
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    data-testid="button-enroll"
                  >
                    {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
                  </Button>
                </div>
              )}

              {isInstructor && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setLocation(`/create-course?edit=${courseId}`)}
                    data-testid="button-edit-course"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setLocation(`/analytics?course=${courseId}`)}
                    data-testid="button-analytics"
                  >
                    <BarChart className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link copied", description: "Course link copied to clipboard!" });
                    }}
                    data-testid="button-share-course"
                  >
                    <Share className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              )}

              {isEnrolled && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={progressPercentage} className="w-24" />
                    <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content */}
        {canView ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Video/Audio Player */}
              <Card>
                <CardContent className="p-6">
                  <div className="bg-muted rounded-lg aspect-video flex items-center justify-center relative mb-4">
                    {course.voiceCloneUrl && (
                      <audio
                        ref={audioRef}
                        src={course.voiceCloneUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={() => setIsPlaying(false)}
                      />
                    )}
                    <div className="text-center">
                      <div className="text-6xl mb-4">
                        {isPlaying ? <Pause className="mx-auto" /> : <Play className="mx-auto" />}
                      </div>
                      <p className="text-foreground font-semibold">
                        {currentModule?.title || "Loading..."}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
                        {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                    
                    {/* Player Controls */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-4">
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={handlePlayPause}
                        data-testid="button-play-pause"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <div className="flex-1 bg-muted-foreground/20 h-2 rounded-full">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        />
                      </div>
                      <Volume2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">1.5x</span>
                    </div>
                  </div>

                  {/* Module Navigation */}
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousModule}
                      disabled={currentModuleIndex === 0}
                      data-testid="button-previous-module"
                    >
                      Previous Module
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Module {currentModuleIndex + 1} of {modules.length}
                    </span>
                    <Button 
                      onClick={handleNextModule}
                      disabled={currentModuleIndex === modules.length - 1}
                      data-testid="button-next-module"
                    >
                      Next Module
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quiz Section */}
              {showQuiz && (
                <Card className="border-accent/20 bg-accent/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-accent" />
                      Interactive Quiz
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const currentQuiz = quizzes.find(q => q.moduleId === currentModule?.id);
                      if (!currentQuiz) return null;
                      
                      const questions = currentQuiz.questions as any[];
                      
                      return (
                        <div className="space-y-6">
                          {questions.map((question, qIndex) => (
                            <div key={qIndex} className="space-y-3">
                              <p className="font-medium text-foreground">
                                {qIndex + 1}. {question.question}
                              </p>
                              <div className="space-y-2">
                                {question.options.map((option: string, oIndex: number) => (
                                  <label 
                                    key={oIndex}
                                    className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${qIndex}`}
                                      value={oIndex}
                                      onChange={() => setQuizAnswers(prev => ({ ...prev, [qIndex]: oIndex }))}
                                      className="text-accent"
                                      data-testid={`radio-q${qIndex}-o${oIndex}`}
                                    />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                          
                          <div className="flex justify-between items-center pt-4">
                            <span className="text-sm text-muted-foreground">
                              Question {Object.keys(quizAnswers).length} of {questions.length} answered
                            </span>
                            <Button 
                              onClick={handleQuizSubmit}
                              disabled={Object.keys(quizAnswers).length < questions.length || submitQuizMutation.isPending}
                              data-testid="button-submit-quiz"
                            >
                              {submitQuizMutation.isPending ? "Submitting..." : "Submit Quiz"}
                            </Button>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}

              {/* Module Content */}
              {currentModule && (
                <Card>
                  <CardHeader>
                    <CardTitle>{currentModule.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{currentModule.description}</p>
                    {currentModule.content && typeof currentModule.content === 'object' && (
                      <div className="space-y-4">
                        {(currentModule.content as any).slides?.map((slide: any, index: number) => (
                          <div key={index} className="p-4 border border-border rounded-lg">
                            <h4 className="font-semibold mb-2">{slide.title}</h4>
                            {slide.content && Array.isArray(slide.content) && (
                              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {slide.content.map((point: string, pIndex: number) => (
                                  <li key={pIndex}>{point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Tracker */}
              {isEnrolled && (
                <ProgressTracker 
                  enrollment={enrollment}
                  modules={modules}
                  currentModuleIndex={currentModuleIndex}
                />
              )}

              {/* Course Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {modules.map((module: CourseModule, index: number) => (
                    <div
                      key={module.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === currentModuleIndex 
                          ? "bg-primary/10 text-primary border border-primary/20" 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setCurrentModuleIndex(index)}
                      data-testid={`module-${index}`}
                    >
                      {index < currentModuleIndex ? (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      ) : index === currentModuleIndex ? (
                        <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border border-border rounded-full" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{module.title}</p>
                        <p className="text-xs text-muted-foreground">{module.duration} min</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-accent">{modules.length}</p>
                      <p className="text-xs text-muted-foreground">Modules</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-secondary">{quizzes.length}</p>
                      <p className="text-xs text-muted-foreground">Quizzes</p>
                    </div>
                  </div>
                  
                  {isEnrolled && (
                    <>
                      <Separator />
                      <div className="text-center">
                        <p className="text-lg font-semibold text-foreground">87%</p>
                        <p className="text-xs text-muted-foreground">Average Quiz Score</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEnrolled && (
                    <>
                      <Button variant="outline" className="w-full" data-testid="button-download-materials">
                        <Download className="h-4 w-4 mr-2" />
                        Download Materials
                      </Button>
                      <Button variant="outline" className="w-full" data-testid="button-ask-question">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Ask Question
                      </Button>
                    </>
                  )}
                  
                  {enrollment?.status === "completed" && (
                    <Button className="w-full" data-testid="button-get-certificate">
                      <Tag className="h-4 w-4 mr-2" />
                      Get Tag
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Enrollment Required */
          <Card className="text-center p-12">
            <Eye className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Enrollment Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to enroll in this course to access the content.
            </p>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-primary">${course.price}</div>
              <Button 
                size="lg" 
                onClick={() => enrollMutation.mutate()}
                disabled={enrollMutation.isPending}
                data-testid="button-enroll-main"
              >
                {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
