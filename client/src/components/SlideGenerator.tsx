import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Presentation,
  Sparkles,
  Play,
  Download,
  Edit,
  Plus,
  Trash2,
  Copy,
  FileText,
  Loader2,
  CheckCircle,
  Eye,
  ArrowLeft,
  ArrowRight,
  Image,
  Users,
  Clock,
  Settings,
  Palette,
  BookOpen,
  Building,
  GraduationCap,
  TrendingUp
} from "lucide-react";

interface Slide {
  title: string;
  content: string[];
  notes: string;
}

interface SlideTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: "business" | "education" | "creative" | "minimal";
}

interface SlideGeneratorProps {
  onComplete?: (slides: Slide[]) => void;
  onUpdate?: (updates: any) => void;
  initialContent?: string;
  courseContent?: any;
  courseData?: any;
}

const slideTemplates: SlideTemplate[] = [
  {
    id: "business-professional",
    name: "Business Professional",
    description: "Clean, corporate design perfect for business presentations",
    thumbnail: "bg-gradient-to-br from-blue-600 to-blue-800",
    category: "business"
  },
  {
    id: "education-modern",
    name: "Modern Education",
    description: "Engaging design optimized for learning and instruction",
    thumbnail: "bg-gradient-to-br from-green-500 to-emerald-600",
    category: "education"
  },
  {
    id: "creative-bold",
    name: "Creative Bold",
    description: "Vibrant and dynamic for creative presentations",
    thumbnail: "bg-gradient-to-br from-purple-500 to-pink-500",
    category: "creative"
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Simple, elegant design focusing on content",
    thumbnail: "bg-gradient-to-br from-gray-600 to-gray-800",
    category: "minimal"
  },
  {
    id: "insurance-compliance",
    name: "Insurance Compliance",
    description: "Professional design for insurance education",
    thumbnail: "bg-gradient-to-br from-indigo-600 to-blue-700",
    category: "business"
  },
  {
    id: "tech-innovation",
    name: "Tech Innovation",
    description: "Modern tech-focused design with clean lines",
    thumbnail: "bg-gradient-to-br from-cyan-500 to-blue-600",
    category: "business"
  }
];

const presentationLengths = [
  { id: "short", name: "Short", slides: 5, description: "Quick overview" },
  { id: "informative", name: "Informative", slides: 10, description: "Balanced detail" },
  { id: "detailed", name: "Detailed", slides: 15, description: "Comprehensive coverage" },
  { id: "custom", name: "Custom", slides: 0, description: "Choose your own" }
];

const audienceTypes = [
  "General Audience",
  "College/University Students", 
  "Insurance Professionals",
  "Business Executives",
  "Continuing Education",
  "Training & Development"
];

const presentationTones = [
  "Professional",
  "Educational",
  "Conversational", 
  "Formal",
  "Engaging",
  "Technical"
];

export default function SlideGenerator({ onComplete, onUpdate, initialContent, courseContent, courseData }: SlideGeneratorProps) {
  const { toast } = useToast();
  
  // Wizard Steps
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  // Step 1: Content Input - Auto-populate with course data
  const [isDirty, setIsDirty] = useState(false);
  
  const getFormattedCourseContent = () => {
    if (initialContent) return initialContent;
    if (courseData?.title || courseData?.description || courseContent?.modules?.length > 0) {
      const parts = [];
      if (courseData?.title) parts.push(`Course Title: ${courseData.title}`);
      if (courseData?.description) parts.push(`Course Description: ${courseData.description}`);
      
      if (courseContent?.modules?.length > 0) {
        parts.push("\nCourse Content:");
        courseContent.modules.forEach((module: any, index: number) => {
          parts.push(`\n${index + 1}. ${module.title}`);
          if (module.description) {
            parts.push(`Description: ${module.description}`);
          }
          
          // Properly serialize module.content object
          if (module.content) {
            if (module.content.keyPoints && Array.isArray(module.content.keyPoints) && module.content.keyPoints.length > 0) {
              parts.push("Key Points:");
              module.content.keyPoints.forEach((point: string) => {
                parts.push(`• ${point}`);
              });
            }
            
            if (module.content.detailedContent && typeof module.content.detailedContent === 'string') {
              parts.push("Detailed Content:");
              parts.push(module.content.detailedContent);
            }
          }
        });
      }
      
      return parts.join('\n');
    }
    return '';
  };
  
  const [inputText, setInputText] = useState(() => getFormattedCourseContent());
  
  // Auto-populate when props change (but don't overwrite user edits)
  useEffect(() => {
    if (!isDirty) {
      const formattedContent = getFormattedCourseContent();
      if (formattedContent && formattedContent !== inputText) {
        setInputText(formattedContent);
      }
    }
  }, [courseData, courseContent, initialContent, isDirty, inputText]);
  
  // Step 2: Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState<SlideTemplate>(slideTemplates[0]);
  
  // Step 3: Presentation Settings
  const [selectedLength, setSelectedLength] = useState(presentationLengths[1]);
  const [customSlideCount, setCustomSlideCount] = useState(8);
  const [targetAudience, setTargetAudience] = useState(audienceTypes[0]);
  const [presentationTone, setPresentationTone] = useState(presentationTones[0]);
  
  // Step 4: Advanced Options
  const [includeImages, setIncludeImages] = useState(true);
  const [includeWebResearch, setIncludeWebResearch] = useState(false);
  const [preserveText, setPreserveText] = useState(true);
  
  // Step 5: Generation & Results
  const [generatedSlides, setGeneratedSlides] = useState<Slide[]>([]);
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);

  const generateSlidesMutation = useMutation({
    mutationFn: async (config: any) => {
      const slideCount = selectedLength.id === 'custom' ? customSlideCount : selectedLength.slides;
      const response = await apiRequest("POST", "/api/slides/generate", { 
        text: inputText, 
        slideCount,
        template: selectedTemplate.id,
        audience: targetAudience,
        tone: presentationTone,
        includeImages,
        includeWebResearch,
        preserveText
      });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedSlides(data.slides || []);
      setCurrentStep(5);
      onComplete?.(data.slides || []);
      toast({
        title: "Professional Slides Generated!",
        description: `Successfully created ${data.slides?.length || 0} slides with ${selectedTemplate.name} template.`,
      });
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
        description: "Failed to generate slides. Please try again with different settings.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateSlides = () => {
    if (!inputText.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter some text content to generate slides from.",
        variant: "destructive",
      });
      return;
    }
    generateSlidesMutation.mutate({});
  };

  const handleEditSlide = (index: number) => {
    setSelectedSlide(index);
    setEditingSlide({ ...generatedSlides[index] });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editingSlide || selectedSlide === null) return;
    
    const updatedSlides = [...generatedSlides];
    updatedSlides[selectedSlide] = editingSlide;
    setGeneratedSlides(updatedSlides);
    setIsEditing(false);
    setSelectedSlide(null);
    setEditingSlide(null);
    onComplete?.(updatedSlides);
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToClone = generatedSlides[index];
    const newSlide = { ...slideToClone, title: `${slideToClone.title} (Copy)` };
    setGeneratedSlides([...generatedSlides, newSlide]);
  };

  const handleDeleteSlide = (index: number) => {
    const updatedSlides = generatedSlides.filter((_, i) => i !== index);
    setGeneratedSlides(updatedSlides);
    onComplete?.(updatedSlides);
  };

  const handleAddSlide = () => {
    const newSlide: Slide = {
      title: "New Slide",
      content: ["Add your content here"],
      notes: "Presenter notes for this slide"
    };
    setGeneratedSlides([...generatedSlides, newSlide]);
  };

  const loadCourseContent = () => {
    const formattedContent = getFormattedCourseContent();
    if (formattedContent) {
      setInputText(formattedContent);
      setIsDirty(true); // Mark as dirty since user explicitly loaded content
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "Enter Your Content";
      case 2: return "Choose Template & Style";
      case 3: return "Presentation Settings";
      case 4: return "Advanced Options";
      case 5: return "Review & Edit Slides";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Presentation className="h-5 w-5" />
              AI Slide Generator
            </CardTitle>
            <Badge variant="secondary">Step {currentStep} of {totalSteps}</Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{getStepTitle(currentStep)}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Content Input */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Create Professional Slides from Content</h3>
                <p className="text-muted-foreground mb-6">
                  Enter your content below and we'll transform it into beautiful, professional presentation slides.
                </p>
              </div>

              <div className="space-y-4">
                <Label htmlFor="slide-content">Content to Convert</Label>
                <Textarea
                  id="slide-content"
                  placeholder="Enter your course content, learning materials, or text that you'd like to convert into slides..."
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setIsDirty(true);
                  }}
                  rows={12}
                  className="min-h-[300px]"
                  data-testid="textarea-slide-content"
                />
                
                {courseContent?.modules && (
                  <Button
                    variant="outline"
                    onClick={loadCourseContent}
                    className="w-full"
                    data-testid="button-load-course-content"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Load from Generated Course
                  </Button>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Insurance Fundamentals
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Risk Management
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    Professional Development
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={nextStep}
                  disabled={!inputText.trim()}
                  data-testid="button-next-step"
                >
                  Choose Template & Style
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Template Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Choose Your Template</h3>
                <p className="text-muted-foreground mb-6">
                  Select a professional template that matches your presentation style.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slideTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate.id === template.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                    data-testid={`template-${template.id}`}
                  >
                    <CardContent className="p-4">
                      <div className={`h-24 rounded-lg mb-3 ${template.thumbnail} flex items-center justify-center`}>
                        <div className="text-white text-xs font-medium">Preview</div>
                      </div>
                      <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {template.category}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={nextStep} data-testid="button-next-to-settings">
                  Presentation Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Presentation Settings */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Presentation Settings</h3>
                <p className="text-muted-foreground mb-6">
                  Configure the length and details of your presentation.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-base font-medium mb-4 block">Presentation Length</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {presentationLengths.map((length) => (
                      <Card 
                        key={length.id}
                        className={`cursor-pointer transition-all hover:shadow-sm ${
                          selectedLength.id === length.id ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => setSelectedLength(length)}
                        data-testid={`length-${length.id}`}
                      >
                        <CardContent className="p-4 text-center">
                          <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                          <h4 className="font-semibold text-sm">{length.name}</h4>
                          {length.id !== 'custom' && (
                            <p className="text-lg font-bold text-primary">{length.slides}</p>
                          )}
                          <p className="text-xs text-muted-foreground">{length.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {selectedLength.id === 'custom' && (
                  <div className="space-y-2">
                    <Label htmlFor="custom-slides">Number of Slides</Label>
                    <Input
                      id="custom-slides"
                      type="number"
                      value={customSlideCount}
                      onChange={(e) => setCustomSlideCount(parseInt(e.target.value) || 8)}
                      min={3}
                      max={25}
                      data-testid="input-custom-slide-count"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={targetAudience} onValueChange={setTargetAudience}>
                      <SelectTrigger data-testid="select-audience">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {audienceTypes.map((audience) => (
                          <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Presentation Tone</Label>
                    <Select value={presentationTone} onValueChange={setPresentationTone}>
                      <SelectTrigger data-testid="select-tone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {presentationTones.map((tone) => (
                          <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={nextStep} data-testid="button-next-to-advanced">
                  Advanced Options
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Advanced Options */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Advanced Options</h3>
                <p className="text-muted-foreground mb-6">
                  Fine-tune your presentation with these optional enhancements.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Image className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="font-medium">Add Images</Label>
                        <p className="text-sm text-muted-foreground">Include relevant images in your slides</p>
                      </div>
                    </div>
                    <Switch 
                      checked={includeImages} 
                      onCheckedChange={setIncludeImages}
                      data-testid="switch-include-images"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Settings className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="font-medium">Web Research</Label>
                        <p className="text-sm text-muted-foreground">Enhance content with web research</p>
                      </div>
                    </div>
                    <Switch 
                      checked={includeWebResearch} 
                      onCheckedChange={setIncludeWebResearch}
                      data-testid="switch-web-research"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <Label className="font-medium">Preserve Text</Label>
                        <p className="text-sm text-muted-foreground">Keep original text structure when possible</p>
                      </div>
                    </div>
                    <Switch 
                      checked={preserveText} 
                      onCheckedChange={setPreserveText}
                      data-testid="switch-preserve-text"
                    />
                  </div>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      What You'll Get
                    </h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Professional slide titles and layouts</li>
                      <li>• Key bullet points and content structure</li>
                      <li>• Presenter notes for each slide</li>
                      <li>• Fully editable content</li>
                      {includeImages && <li>• Relevant images and visuals</li>}
                      {includeWebResearch && <li>• Enhanced content from web research</li>}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleGenerateSlides}
                  disabled={generateSlidesMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-generate-professional-slides"
                >
                  {generateSlidesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Slides...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Professional Slides
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Results & Preview */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Your Professional Slides</h3>
                <p className="text-muted-foreground mb-6">
                  Review and edit your generated slides. Click any slide to customize it.
                </p>
              </div>

              {generatedSlides.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">
                        {generatedSlides.length} Slides Generated
                      </Badge>
                      <Badge variant="outline">{selectedTemplate.name}</Badge>
                    </div>
                    <Button
                      onClick={handleAddSlide}
                      variant="outline"
                      size="sm"
                      data-testid="button-add-slide"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Slide
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedSlides.map((slide, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="text-xs">{index + 1}</Badge>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditSlide(index)}
                                data-testid={`button-edit-slide-${index}`}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDuplicateSlide(index)}
                                data-testid={`button-copy-slide-${index}`}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteSlide(index)}
                                data-testid={`button-delete-slide-${index}`}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <h4 className="font-semibold text-sm line-clamp-2">{slide.title}</h4>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <div className={`h-16 rounded mb-3 ${selectedTemplate.thumbnail} flex items-center justify-center`}>
                            <div className="text-white text-xs opacity-75">Slide Preview</div>
                          </div>
                          <ul className="text-xs text-muted-foreground space-y-1 mb-2">
                            {slide.content.slice(0, 3).map((point, i) => (
                              <li key={i} className="line-clamp-1">• {point}</li>
                            ))}
                            {slide.content.length > 3 && (
                              <li className="italic">+{slide.content.length - 3} more...</li>
                            )}
                          </ul>
                          {slide.notes && (
                            <p className="text-xs text-muted-foreground italic line-clamp-2 border-t pt-2">
                              Notes: {slide.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Create New Slides
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" data-testid="button-download-slides">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button data-testid="button-save-slides">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save & Continue
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Presentation className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No slides generated yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Slide Modal */}
          {isEditing && editingSlide && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle>Edit Slide {(selectedSlide || 0) + 1}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Slide Title</Label>
                    <Input
                      id="edit-title"
                      value={editingSlide.title}
                      onChange={(e) => setEditingSlide({...editingSlide, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-content">Content Points</Label>
                    <Textarea
                      id="edit-content"
                      value={editingSlide.content.join('\n')}
                      onChange={(e) => setEditingSlide({...editingSlide, content: e.target.value.split('\n')})}
                      rows={6}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-notes">Presenter Notes</Label>
                    <Textarea
                      id="edit-notes"
                      value={editingSlide.notes}
                      onChange={(e) => setEditingSlide({...editingSlide, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}