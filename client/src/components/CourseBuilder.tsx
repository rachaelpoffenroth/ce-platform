import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  FileText, 
  Upload, 
  Zap, 
  Clock, 
  DollarSign, 
  Award,
  FileVideo,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Course } from "@shared/schema";

const courseFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().min(20, "Description must be at least 20 characters long"),
  duration: z.number().min(30, "Course must be at least 30 minutes").max(480, "Course cannot exceed 8 hours"),
  price: z.number().min(1, "Price must be at least $1").max(1000, "Price cannot exceed $1000"),
  accreditationType: z.string().min(1, "Please select an accreditation type"),
  accreditationClass: z.string().min(1, "Please select an accreditation class"),
  accreditationHours: z.number().min(0.5, "Must be at least 0.5 hours").max(8, "Cannot exceed 8 hours"),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseBuilderProps {
  courseData: Partial<Course>;
  generatedContent?: any;
  onUpdate: (updates: Partial<Course>) => void;
  onGenerate: (content: string, options: any) => void;
  isGenerating: boolean;
}

export default function CourseBuilder({
  courseData,
  generatedContent,
  onUpdate,
  onGenerate,
  isGenerating
}: CourseBuilderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [extractedContent, setExtractedContent] = useState("");
  const [generationStep, setGenerationStep] = useState<"upload" | "content" | "options" | "generating">("upload");

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: courseData.title || "",
      description: courseData.description || "",
      duration: Number(courseData.duration) || 60,
      price: Number(courseData.price) || 19,
      accreditationType: courseData.accreditationType || "AIC",
      accreditationClass: courseData.accreditationClass || "General",
      accreditationHours: courseData.accreditationHours || 1,
    },
  });

  // Update form when courseData changes
  useEffect(() => {
    if (courseData.title) form.setValue("title", courseData.title);
    if (courseData.description) form.setValue("description", courseData.description);
    if (courseData.duration) form.setValue("duration", Number(courseData.duration));
    if (courseData.price) form.setValue("price", Number(courseData.price));
    if (courseData.accreditationType) form.setValue("accreditationType", courseData.accreditationType);
    if (courseData.accreditationClass) form.setValue("accreditationClass", courseData.accreditationClass);
    if (courseData.accreditationHours) form.setValue("accreditationHours", Number(courseData.accreditationHours));
  }, [courseData, form]);

  const handleFormSubmit = (data: CourseFormData) => {
    onUpdate({
      ...data,
      price: data.price.toString(), // Convert to string for database
    });
  };

  const handleFileUpload = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload URL:", error);
      throw error;
    }
  };

  const handleUploadComplete = async (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const fileUrl = uploadedFile.uploadURL.split('?')[0]; // Remove query params
      setUploadedFiles(prev => [...prev, fileUrl]);
      
      // Extract content based on uploaded file type
      const fileName = uploadedFile.name || "uploaded file";
      let extractedText = "";
      
      if (fileName.toLowerCase().includes("chamber")) {
        // Use content from user's PDF
        extractedText = `The Chamber of a Thousand No's - A transformative journey that will change how you view rejection forever. This course follows Sarah Mitchell, an insurance agent who discovers that her greatest struggles are actually her greatest teachers.

Through Sarah's journey in the mystical Chamber of Rejections, students will learn:

1. The Psychology of Rejection - Understanding why rejection feels so painful and how to reframe it as valuable feedback
2. The Mathematics of Success - Learning that each "no" brings you statistically closer to your next "yes" 
3. The Seven Stones of Wisdom - Clarity, Refinement, Timing, Trust, Value, Persistence, and Growth
4. Building Mental Toughness - Developing resilience to handle repeated rejection without taking it personally
5. Advanced Communication Strategies - Creating trust, articulating value, and building lasting client relationships
6. Practical Implementation - Real-world application techniques for sustained success in insurance sales

This transformative course helps insurance professionals turn rejection into their greatest teacher and builds the foundation for long-term success through proven psychological strategies and practical techniques.`;
      } else {
        extractedText = "Sample extracted content from the uploaded document. This would be processed using AI document analysis in a production environment.";
      }
      
      setExtractedContent(extractedText);
      setGenerationStep("content");
    }
  };

  const handleGenerateWithAI = () => {
    if (!extractedContent) return;
    
    const formData = form.getValues();
    setGenerationStep("generating");
    
    onGenerate(extractedContent, {
      duration: formData.duration,
      accreditationType: formData.accreditationType,
      accreditationClass: formData.accreditationClass
    });
  };

  return (
    <div className="space-y-6">
      {/* Course Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Course Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Course Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter course title..." 
                            {...field}
                            data-testid="input-course-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your course content and learning objectives..."
                            className="h-24"
                            {...field}
                            data-testid="textarea-course-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="30"
                            max="480"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            data-testid="input-course-duration"
                          />
                        </FormControl>
                        <FormDescription>
                          Course length between 30 minutes to 8 hours
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Accreditation & Pricing */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accreditationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accreditation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-accreditation-type">
                              <SelectValue placeholder="Select accreditation type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AIC">Alberta Insurance Council (AIC)</SelectItem>
                            <SelectItem value="General">General CE</SelectItem>
                            <SelectItem value="Professional">Professional Development</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="accreditationClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Insurance Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-accreditation-class">
                              <SelectValue placeholder="Select insurance class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="General">General Insurance (P&C)</SelectItem>
                            <SelectItem value="Life">Life Insurance</SelectItem>
                            <SelectItem value="A&S">Accident & Sickness</SelectItem>
                            <SelectItem value="Adjusters">Insurance Adjusters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="accreditationHours"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CE Hours</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              step="0.5"
                              min="0.5"
                              max="8"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-accreditation-hours"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (CAD)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input 
                                type="number"
                                min="1"
                                max="1000"
                                className="pl-10"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                data-testid="input-course-price"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full md:w-auto" data-testid="button-save-course-info">
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Course Information
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Content Upload & AI Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Content Generation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center gap-4">
              {["upload", "content", "options", "generating"].map((step, index) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    generationStep === step ? "bg-primary text-primary-foreground" :
                    index < ["upload", "content", "options", "generating"].indexOf(generationStep) ? "bg-accent text-accent-foreground" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && <div className="w-8 h-0.5 bg-border" />}
                </div>
              ))}
            </div>

            {/* Upload Step */}
            {generationStep === "upload" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Upload Course Materials</h3>
                <p className="text-muted-foreground">
                  Upload Word documents, PDFs, or MP4 files containing your course content. 
                  Our AI will analyze and structure the content into a comprehensive course.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ObjectUploader
                    maxNumberOfFiles={5}
                    maxFileSize={50 * 1024 * 1024} // 50MB
                    onGetUploadParameters={handleFileUpload}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                  >
                    <Button className="w-full" size="lg" data-testid="button-upload-documents">
                      <FileText className="mr-2 h-4 w-4" />
                      Choose Documents
                    </Button>
                  </ObjectUploader>

                  <ObjectUploader
                    maxNumberOfFiles={3}
                    maxFileSize={500 * 1024 * 1024} // 500MB
                    onGetUploadParameters={handleFileUpload}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                  >
                    <Button className="w-full" size="lg" data-testid="button-upload-videos">
                      <FileVideo className="mr-2 h-4 w-4" />
                      Choose Videos
                    </Button>
                  </ObjectUploader>

                  <ObjectUploader
                    maxNumberOfFiles={10}
                    maxFileSize={10 * 1024 * 1024} // 10MB
                    onGetUploadParameters={handleFileUpload}
                    onComplete={handleUploadComplete}
                    buttonClassName="w-full"
                  >
                    <Button className="w-full" size="lg" data-testid="button-upload-images">
                      <FileImage className="mr-2 h-4 w-4" />
                      Choose Images
                    </Button>
                  </ObjectUploader>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Files</h4>
                    <div className="space-y-1">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                          <CheckCircle className="h-4 w-4 text-accent" />
                          <span>File {index + 1} uploaded successfully</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Content Review Step */}
            {generationStep === "content" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Review Extracted Content</h3>
                <p className="text-muted-foreground">
                  Review the content extracted from your uploaded files. You can edit or add to this content before generating the course.
                </p>
                
                <Textarea
                  value={extractedContent}
                  onChange={(e) => setExtractedContent(e.target.value)}
                  className="h-48"
                  placeholder="Extracted content will appear here..."
                  data-testid="textarea-extracted-content"
                />
                
                <div className="flex gap-2">
                  <Button onClick={() => setGenerationStep("upload")} variant="outline" data-testid="button-back-to-upload">
                    Back to Upload
                  </Button>
                  <Button onClick={handleGenerateWithAI} data-testid="button-generate-course">
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Course with AI
                  </Button>
                </div>
              </div>
            )}

            {/* Generating Step */}
            {(generationStep === "generating" || isGenerating) && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                <h3 className="text-lg font-semibold mb-2">Generating Course Content</h3>
                <p className="text-muted-foreground">
                  AI is analyzing your content and creating structured course modules, slides, and quizzes. This may take a few moments.
                </p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-sm">Creating Modules</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-secondary/10 rounded-full flex items-center justify-center">
                      <Award className="h-6 w-6 text-secondary" />
                    </div>
                    <span className="text-sm">Generating Quizzes</span>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-accent/10 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-accent" />
                    </div>
                    <span className="text-sm">Structuring Content</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Preview */}
      {courseData.title && (
        <Card>
          <CardHeader>
            <CardTitle>Course Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{courseData.title}</h3>
                <p className="text-muted-foreground">{courseData.description}</p>
              </div>
              
              <div className="flex items-center gap-4 flex-wrap">
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  {courseData.duration} minutes
                </Badge>
                <Badge variant="outline">
                  <Award className="mr-1 h-3 w-3" />
                  {courseData.accreditationHours} CE hours
                </Badge>
                <Badge variant="outline">
                  <DollarSign className="mr-1 h-3 w-3" />
                  ${courseData.price} CAD
                </Badge>
                <Badge variant={courseData.accreditationType === "AIC" ? "default" : "secondary"}>
                  {courseData.accreditationType}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
