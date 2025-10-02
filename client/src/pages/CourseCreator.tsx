import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Layout from "@/components/Layout";
import CourseBuilder from "@/components/CourseBuilder";
import VoiceCloner from "@/components/VoiceCloner";
import QuizGenerator from "@/components/QuizGenerator";
import SlideGenerator from "@/components/SlideGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Brain, Mic, FileText, Presentation, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import type { Course, CourseModule, Quiz } from "@shared/schema";

// Define proper types for generated content
interface GeneratedCourse {
  title: string;
  description: string;
  duration: number;
  accreditationType: string;
  accreditationClass: string;
  modules?: GeneratedModule[];
}

interface GeneratedModule {
  id?: string;
  title: string;
  description: string | null;
  content: {
    keyPoints: string[];
    detailedContent: string;
  };
  duration: number | null;
  order?: number;
  createdAt?: Date | null;
  courseId?: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  materialUrls?: unknown;
  quiz?: {
    title: string;
    questions: QuizQuestion[];
  };
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// Slide types
interface Slide {
  title: string;
  content: string[];
  notes: string;
}

interface SlideData {
  slides?: Slide[];
  isGenerating?: boolean;
}

// Voice clone data types
interface VoiceCloneData {
  uploadedFile?: string;
  voiceCloneUrl?: string;
  uploadStep?: "upload" | "processing" | "preview" | "complete";
}

// Course generation options
interface CourseGenerationOptions {
  duration?: number;
  accreditationType?: string;
  accreditationClass?: string;
}

interface CourseCreationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

// User type with proper typing
interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// Utility function to convert GeneratedModule[] to CourseModule[]
const mapGeneratedModulesToCourseModules = (generatedModules: GeneratedModule[], courseId?: string): CourseModule[] => {
  if (!generatedModules || !Array.isArray(generatedModules)) {
    return [];
  }

  return generatedModules.map((generatedModule, index) => {
    // Create a properly structured CourseModule
    const courseModule: CourseModule = {
      id: generatedModule.id || `temp-${Date.now()}-${index}`,
      courseId: courseId || `temp-course-${Date.now()}`,
      title: generatedModule.title,
      description: generatedModule.description,
      // Convert content structure from {keyPoints, detailedContent} to jsonb format
      content: {
        ...generatedModule.content,
        keyPoints: generatedModule.content?.keyPoints || [],
        detailedContent: generatedModule.content?.detailedContent || ""
      },
      order: generatedModule.order ?? index + 1, // Ensure required order field is set
      duration: generatedModule.duration,
      videoUrl: generatedModule.videoUrl || null,
      audioUrl: generatedModule.audioUrl || null,
      materialUrls: generatedModule.materialUrls,
      createdAt: generatedModule.createdAt || new Date()
    };

    return courseModule;
  });
};

export default function CourseCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<Partial<Course>>({});
  const [generatedContent, setGeneratedContent] = useState<GeneratedCourse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [voiceCloneData, setVoiceCloneData] = useState<VoiceCloneData>({});
  const [slideData, setSlideData] = useState<SlideData>({});

  const steps: CourseCreationStep[] = [
    {
      id: "basic-info",
      title: "Course Information",
      description: "Basic course details and settings",
      icon: BookOpen,
      completed: !!(courseData.title && courseData.description)
    },
    {
      id: "content-generation",
      title: "AI Content Generation",
      description: "Generate course content with AI",
      icon: Brain,
      completed: !!generatedContent
    },
    {
      id: "slide-generation",
      title: "Slide Generator",
      description: "Create presentation slides from content",
      icon: Presentation,
      completed: !!slideData.slides
    },
    {
      id: "voice-cloning",
      title: "Voice Cloning",
      description: "Add voice narration to your course",
      icon: Mic,
      completed: !!courseData.voiceCloneUrl
    },
    {
      id: "quiz-creation",
      title: "Quiz & Assessments",
      description: "Create interactive quizzes",
      icon: FileText,
      completed: false
    }
  ];

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: Partial<Course> & { instructorId: string; status: string }) => {
      const response = await apiRequest("POST", "/api/courses", courseData);
      return response.json();
    },
    onSuccess: (course) => {
      toast({
        title: "Course Created",
        description: "Your course has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses/my"] });
      setLocation(`/course/${course.id}`);
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
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateCourseMutation = useMutation({
    mutationFn: async (data: { content: string; courseTitle?: string; courseDescription?: string; duration: number; accreditationType: string; accreditationClass: string }) => {
      const response = await apiRequest("POST", "/api/courses/generate", data);
      return response.json();
    },
    onSuccess: (course: GeneratedCourse) => {
      setGeneratedContent(course);
      setCourseData(prev => ({ ...prev, ...course }));
      toast({
        title: "Course Generated",
        description: "AI has successfully generated your course content!",
      });
      setCurrentStep(2); // Move to slide generator step
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
        title: "Generation Failed",
        description: "Failed to generate course content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCourseDataUpdate = (updates: Partial<Course>) => {
    const newCourseData = { ...courseData, ...updates };
    setCourseData(newCourseData);
    
    // Auto-trigger AI generation when course information is complete
    if (newCourseData.title && newCourseData.description && newCourseData.duration && !generatedContent && !isGenerating) {
      // Set current step to content generation
      setCurrentStep(1);
      
      // Auto-generate course content with default content
      const defaultContent = newCourseData.title.toLowerCase().includes('chamber') ? 
        `The Chamber of a Thousand No's - A transformative journey that will change how you view rejection forever. This course follows Sarah Mitchell, an insurance agent who discovers that her greatest struggles are actually her greatest teachers.

Through Sarah's journey in the mystical Chamber of Rejections, students will learn:

1. The Psychology of Rejection - Understanding why rejection feels so painful and how to reframe it as valuable feedback
2. The Mathematics of Success - Learning that each "no" brings you statistically closer to your next "yes" 
3. The Seven Stones of Wisdom - Clarity, Refinement, Timing, Trust, Value, Persistence, and Growth
4. Building Mental Toughness - Developing resilience to handle repeated rejection without taking it personally
5. Advanced Communication Strategies - Creating trust, articulating value, and building lasting client relationships
6. Practical Implementation - Real-world application techniques for sustained success in insurance sales

This transformative course helps insurance professionals turn rejection into their greatest teacher and builds the foundation for long-term success through proven psychological strategies and practical techniques.` :
        `Professional development course content focusing on ${newCourseData.description}. This comprehensive course covers essential topics and practical applications for insurance professionals seeking to advance their knowledge and skills.`;

      // Trigger automatic AI generation
      setTimeout(() => {
        handleGenerateCourse(defaultContent, {
          duration: newCourseData.duration ?? undefined,
          accreditationType: newCourseData.accreditationType ?? undefined,
          accreditationClass: newCourseData.accreditationClass ?? undefined
        }, newCourseData.title, newCourseData.description);
      }, 1000);
      
      toast({
        title: "Automated Generation Started",
        description: "AI is now generating your course content automatically!",
      });
    }
  };

  const handleGenerateCourse = async (content: string, options: CourseGenerationOptions, courseTitle?: string, courseDescription?: string) => {
    setIsGenerating(true);
    try {
      await generateCourseMutation.mutateAsync({
        content,
        courseTitle: courseTitle || courseData.title,
        courseDescription: courseDescription || courseData.description,
        duration: options.duration ?? 60,
        accreditationType: options.accreditationType ?? "AIC",
        accreditationClass: options.accreditationClass ?? "General"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceCloneComplete = (voiceCloneUrl: string) => {
    setCourseData(prev => ({ ...prev, voiceCloneUrl }));
    setVoiceCloneData(prev => ({ ...prev, voiceCloneUrl, uploadStep: "complete" }));
    setCurrentStep(4); // Move to quiz creation step
  };

  const handleVoiceCloneUpdate = (updates: Partial<VoiceCloneData>) => {
    setVoiceCloneData(prev => ({ ...prev, ...updates }));
  };

  const handleSlideGenerationComplete = (slides: Slide[]) => {
    setSlideData(prev => ({ ...prev, slides }));
    toast({
      title: "Slides Generated",
      description: `Successfully created ${slides.length} presentation slides!`,
    });
  };

  const handleSlideUpdate = (updates: Partial<SlideData>) => {
    setSlideData(prev => ({ ...prev, ...updates }));
  };

  const handleFinalizeCourse = () => {
    const authUser = user as AuthUser;
    if (!courseData.title || !user || !authUser.id) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      });
      return;
    }

    createCourseMutation.mutate({
      ...courseData,
      instructorId: authUser.id,
      status: "draft"
    });
  };

  const progressPercentage = (steps.filter(step => step.completed).length / steps.length) * 100;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Course</h1>
            <p className="text-muted-foreground">
              Use AI to create engaging, AIC-compliant insurance courses
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-lg font-semibold">{Math.round(progressPercentage)}%</p>
            </div>
            <Progress value={progressPercentage} className="w-32" />
          </div>
        </div>

        {/* Steps Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Course Creation Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = step.completed;
                
                return (
                  <div
                    key={step.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      isActive ? "border-primary bg-primary/5" :
                      isCompleted ? "border-accent bg-accent/5" :
                      "border-border hover:border-muted-foreground"
                    }`}
                    onClick={() => setCurrentStep(index)}
                    data-testid={`step-${step.id}`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? "bg-accent text-accent-foreground" :
                        isActive ? "bg-primary text-primary-foreground" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {isCompleted ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <Badge variant={isCompleted ? "default" : isActive ? "secondary" : "outline"}>
                        {index + 1}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={steps[currentStep]?.id} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <TabsTrigger
                      key={step.id}
                      value={step.id}
                      onClick={() => setCurrentStep(index)}
                      className="flex items-center gap-2"
                      data-testid={`tab-${step.id}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden md:inline">{step.title}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="basic-info" className="space-y-6">
                <CourseBuilder
                  courseData={courseData}
                  generatedContent={generatedContent}
                  onUpdate={handleCourseDataUpdate}
                  onGenerate={handleGenerateCourse}
                  isGenerating={isGenerating}
                />
              </TabsContent>

              <TabsContent value="content-generation" className="space-y-6">
                {generatedContent ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI-Generated Course Content
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-accent">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">Course content generated successfully!</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 border border-border rounded-lg">
                            <h4 className="font-semibold mb-2">Generated Modules</h4>
                            <p className="text-2xl font-bold text-primary">{generatedContent.modules?.length || 0}</p>
                            <p className="text-sm text-muted-foreground">Course modules created</p>
                          </div>
                          <div className="p-4 border border-border rounded-lg">
                            <h4 className="font-semibold mb-2">Estimated Duration</h4>
                            <p className="text-2xl font-bold text-primary">{generatedContent.duration || 60} min</p>
                            <p className="text-sm text-muted-foreground">Total course length</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setCurrentStep(2)}
                          className="w-full"
                          data-testid="button-continue-slides"
                        >
                          Continue to Slide Generator
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <CourseBuilder
                    courseData={courseData}
                    generatedContent={generatedContent}
                    onUpdate={handleCourseDataUpdate}
                    onGenerate={handleGenerateCourse}
                    isGenerating={isGenerating}
                  />
                )}
              </TabsContent>

              <TabsContent value="slide-generation" className="space-y-6">
                <SlideGenerator
                  onComplete={handleSlideGenerationComplete}
                  onUpdate={handleSlideUpdate}
                  courseContent={generatedContent}
                  courseData={courseData}
                />
              </TabsContent>

              <TabsContent value="voice-cloning" className="space-y-6">
                <VoiceCloner
                  onComplete={handleVoiceCloneComplete}
                  onUpdate={handleVoiceCloneUpdate}
                  courseContent={generatedContent}
                  courseData={courseData}
                  persistedData={voiceCloneData}
                />
              </TabsContent>

              <TabsContent value="quiz-creation" className="space-y-6">
                <QuizGenerator
                  courseData={courseData}
                  modules={mapGeneratedModulesToCourseModules(generatedContent?.modules || [], courseData.id)}
                  onUpdate={handleCourseDataUpdate}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Course Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground">
                    {courseData.title || "Untitled Course"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {courseData.description || "No description provided"}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Duration:</span>
                    <span>{courseData.duration || 60} minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Type:</span>
                    <span>{courseData.accreditationType || "AIC"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Class:</span>
                    <span>{courseData.accreditationClass || "General"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Price:</span>
                    <span>${courseData.price || 19}</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h5 className="font-medium">Status</h5>
                  {steps.map(step => (
                    <div key={step.id} className="flex items-center gap-2 text-sm">
                      {step.completed ? (
                        <CheckCircle className="h-4 w-4 text-accent" />
                      ) : currentStep === steps.indexOf(step) ? (
                        <Clock className="h-4 w-4 text-primary" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  data-testid="button-previous-step"
                >
                  Previous Step
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  data-testid="button-next-step"
                >
                  Next Step
                </Button>

                <Button
                  className="w-full"
                  onClick={handleFinalizeCourse}
                  disabled={!courseData.title || createCourseMutation.isPending}
                  data-testid="button-create-course"
                >
                  {createCourseMutation.isPending ? "Creating..." : "Create Course"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
