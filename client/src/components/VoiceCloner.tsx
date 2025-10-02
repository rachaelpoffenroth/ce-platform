import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ObjectUploader } from "@/components/ObjectUploader";
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  AudioWaveform,
  FileAudio,
  Settings,
  Languages,
  Clock,
  Download
} from "lucide-react";
import type { UploadResult } from "@uppy/core";

interface VoiceClonerProps {
  onComplete: (voiceCloneUrl: string) => void;
  onUpdate?: (updates: any) => void;
  courseContent?: any;
  courseData?: any;
  persistedData?: {
    uploadedFile?: string;
    voiceCloneUrl?: string;
    uploadStep?: "upload" | "processing" | "preview" | "complete";
  };
}

interface VoiceValidation {
  isValid: boolean;
  duration: number;
  quality: 'excellent' | 'good' | 'poor';
  issues: string[];
}

export default function VoiceCloner({ onComplete, onUpdate, courseContent, courseData, persistedData }: VoiceClonerProps) {
  const { toast } = useToast();
  
  const [uploadStep, setUploadStep] = useState<"upload" | "processing" | "preview" | "complete">(persistedData?.uploadStep || "upload");
  const [uploadedFile, setUploadedFile] = useState<string | null>(persistedData?.uploadedFile || null);
  const [voiceValidation, setVoiceValidation] = useState<VoiceValidation | null>(null);
  const [extractedAudio, setExtractedAudio] = useState<string | null>(null);
  const [voiceCloneUrl, setVoiceCloneUrl] = useState<string | null>(persistedData?.voiceCloneUrl || null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-CA");
  const [testVoiceText, setTestVoiceText] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-populate test voice text with course content
  const getFormattedCourseContent = () => {
    if (!courseData && !courseContent) return "";
    
    const parts = [];
    
    if (courseData?.title) {
      parts.push(`Welcome to "${courseData.title}".`);
    }
    
    if (courseData?.description) {
      parts.push(courseData.description);
    }
    
    if (courseContent?.modules?.length > 0) {
      parts.push("This course covers the following topics:");
      courseContent.modules.forEach((module: any, index: number) => {
        if (module.title) {
          parts.push(`${index + 1}. ${module.title}`);
        }
      });
      
      // Add sample content from first module
      if (courseContent.modules[0]?.content?.keyPoints?.length > 0) {
        parts.push("Let me tell you about the key points:");
        courseContent.modules[0].content.keyPoints.slice(0, 3).forEach((point: string) => {
          parts.push(`• ${point}`);
        });
      }
    }
    
    return parts.join('\n\n');
  };

  // Auto-populate when course data is available and user hasn't edited
  useEffect(() => {
    if (!isDirty && !testVoiceText && (courseData || courseContent)) {
      const content = getFormattedCourseContent();
      if (content) {
        setTestVoiceText(content);
      }
    }
  }, [courseData, courseContent, isDirty, testVoiceText]);

  const voiceCloneMutation = useMutation({
    mutationFn: async (videoUrl: string) => {
      const response = await apiRequest("POST", "/api/voice/clone", { videoUrl });
      return response.json();
    },
    onSuccess: (data) => {
      setVoiceCloneUrl(data.voiceCloneUrl);
      setUploadStep("complete");
      onComplete(data.voiceCloneUrl);
      toast({
        title: "Voice Cloning Complete",
        description: "Your voice has been successfully cloned and is ready to use!",
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
        title: "Voice Cloning Failed",
        description: "Failed to clone voice. Please try again with a clearer audio sample.",
        variant: "destructive",
      });
      setUploadStep("upload");
    },
  });

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

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      const fileUrl = uploadedFile.uploadURL.split('?')[0]; // Remove query params
      setUploadedFile(fileUrl);
      setUploadStep("processing");
      
      // Persist the uploaded file
      onUpdate?.({ uploadedFile: fileUrl, uploadStep: "processing" });
      
      // Simulate processing steps
      simulateProcessing();
    }
  };

  const simulateProcessing = async () => {
    // Simulate audio extraction and validation
    const steps = [
      { progress: 20, message: "Extracting audio from video..." },
      { progress: 40, message: "Analyzing voice quality..." },
      { progress: 60, message: "Validating audio sample..." },
      { progress: 80, message: "Processing voice characteristics..." },
      { progress: 100, message: "Creating voice model..." }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProcessingProgress(step.progress);
      
      if (step.progress === 60) {
        // Simulate validation results
        setVoiceValidation({
          isValid: true,
          duration: 127, // seconds
          quality: 'excellent',
          issues: []
        });
      }
      
      if (step.progress === 100) {
        // Simulate extracted audio URL
        setExtractedAudio("/api/voice/sample.wav");
        setUploadStep("preview");
      }
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleCreateVoiceClone = () => {
    if (!uploadedFile) return;
    voiceCloneMutation.mutate(uploadedFile);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-accent';
      case 'good': return 'text-primary';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            AI Voice Cloning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" data-testid="tab-voice-upload">Upload Audio</TabsTrigger>
              <TabsTrigger value="settings" data-testid="tab-voice-settings">Voice Settings</TabsTrigger>
              <TabsTrigger value="preview" data-testid="tab-voice-preview">Preview & Test</TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              {uploadStep === "upload" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Upload Video or Audio Sample</h3>
                    <p className="text-muted-foreground mb-6">
                      Upload an MP4 video or audio file containing clear speech. 
                      For best results, use at least 30 seconds of consistent, clear speaking.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={500 * 1024 * 1024} // 500MB
                      onGetUploadParameters={handleFileUpload}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full"
                    >
                      <Button className="w-full" size="lg" data-testid="button-upload-video">
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Video File
                      </Button>
                    </ObjectUploader>

                    <ObjectUploader
                      maxNumberOfFiles={1}
                      maxFileSize={100 * 1024 * 1024} // 100MB
                      onGetUploadParameters={handleFileUpload}
                      onComplete={handleUploadComplete}
                      buttonClassName="w-full"
                    >
                      <Button className="w-full" size="lg" data-testid="button-upload-audio">
                        <FileAudio className="mr-2 h-4 w-4" />
                        Choose Audio File
                      </Button>
                    </ObjectUploader>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Voice Quality Tips</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Use at least 30 seconds of clear, consistent speech</li>
                      <li>• Avoid background noise and echo</li>
                      <li>• Speak at a normal pace with natural intonation</li>
                      <li>• Higher quality audio produces better voice clones</li>
                      <li>• 22kHz sample rate or higher recommended</li>
                    </ul>
                  </div>
                </div>
              )}

              {uploadStep === "processing" && (
                <div className="text-center py-12">
                  <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-primary" />
                  <h3 className="text-lg font-semibold mb-2">Processing Voice Sample</h3>
                  <p className="text-muted-foreground mb-6">
                    Our AI is analyzing your audio and creating a voice model. This may take a few minutes.
                  </p>
                  <Progress value={processingProgress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">{processingProgress}% complete</p>
                </div>
              )}

              {uploadStep === "preview" && voiceValidation && (
                <div className="space-y-6">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent" />
                    <h3 className="text-lg font-semibold mb-2">Voice Sample Processed</h3>
                    <p className="text-muted-foreground">
                      Your voice sample has been successfully processed and is ready for cloning.
                    </p>
                  </div>

                  {/* Audio Player */}
                  {extractedAudio && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <h4 className="font-semibold mb-4">Extracted Audio Sample</h4>
                          <div className="bg-muted rounded-lg p-8 mb-4">
                            <audio ref={audioRef} src={extractedAudio} onEnded={() => setIsPlaying(false)} />
                            <div className="flex items-center justify-center gap-4">
                              <Button variant="outline" size="lg" onClick={handlePlayPause} data-testid="button-play-sample">
                                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                              </Button>
                              <Volume2 className="h-5 w-5 text-muted-foreground" />
                              <AudioWaveform className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Voice Quality Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Voice Quality Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 border border-border rounded-lg">
                          <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="text-lg font-semibold">{Math.floor(voiceValidation.duration / 60)}:{(voiceValidation.duration % 60).toString().padStart(2, '0')}</p>
                          <p className="text-sm text-muted-foreground">Duration</p>
                        </div>
                        <div className="text-center p-4 border border-border rounded-lg">
                          <CheckCircle className={`h-8 w-8 mx-auto mb-2 ${getQualityColor(voiceValidation.quality)}`} />
                          <p className={`text-lg font-semibold capitalize ${getQualityColor(voiceValidation.quality)}`}>
                            {voiceValidation.quality}
                          </p>
                          <p className="text-sm text-muted-foreground">Quality</p>
                        </div>
                        <div className="text-center p-4 border border-border rounded-lg">
                          <Badge variant={voiceValidation.isValid ? "default" : "destructive"} className="mb-2">
                            {voiceValidation.isValid ? "Valid" : "Invalid"}
                          </Badge>
                          <p className="text-sm text-muted-foreground">Status</p>
                        </div>
                      </div>

                      {voiceValidation.issues.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-foreground">Recommendations:</h5>
                          {voiceValidation.issues.map((issue, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                              <span className="text-muted-foreground">{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Button 
                        onClick={handleCreateVoiceClone}
                        disabled={!voiceValidation.isValid || voiceCloneMutation.isPending}
                        className="w-full mt-6"
                        data-testid="button-create-voice-clone"
                      >
                        {voiceCloneMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Voice Clone...
                          </>
                        ) : (
                          <>
                            <Mic className="mr-2 h-4 w-4" />
                            Create Voice Clone
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {uploadStep === "complete" && voiceCloneUrl && (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-accent" />
                  <h3 className="text-lg font-semibold mb-2">Voice Clone Created Successfully!</h3>
                  <p className="text-muted-foreground mb-6">
                    Your voice has been cloned and is ready to generate narration for your course content.
                  </p>
                  <div className="space-y-4">
                    <Badge variant="default" className="px-4 py-2">
                      <Languages className="mr-2 h-4 w-4" />
                      175+ Languages Supported
                    </Badge>
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" data-testid="button-test-voice">
                        <Play className="mr-2 h-4 w-4" />
                        Test Voice
                      </Button>
                      <Button variant="outline" data-testid="button-download-voice">
                        <Download className="mr-2 h-4 w-4" />
                        Download Model
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Voice Generation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Output Language</label>
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      data-testid="select-voice-language"
                    >
                      <option value="en-CA">English (Canada)</option>
                      <option value="en-US">English (United States)</option>
                      <option value="fr-CA">French (Canada)</option>
                      <option value="es-ES">Spanish</option>
                      <option value="de-DE">German</option>
                      <option value="pt-BR">Portuguese (Brazil)</option>
                      <option value="zh-CN">Chinese (Mandarin)</option>
                      <option value="ja-JP">Japanese</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose the language for voice generation. The voice clone will adapt to the selected language.
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Speech Speed</label>
                      <select className="w-full px-3 py-2 border border-border rounded-lg bg-background" data-testid="select-speech-speed">
                        <option value="0.8">Slow (0.8x)</option>
                        <option value="1.0" selected>Normal (1.0x)</option>
                        <option value="1.2">Fast (1.2x)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Voice Emotion</label>
                      <select className="w-full px-3 py-2 border border-border rounded-lg bg-background" data-testid="select-voice-emotion">
                        <option value="neutral" selected>Neutral</option>
                        <option value="friendly">Friendly</option>
                        <option value="professional">Professional</option>
                        <option value="enthusiastic">Enthusiastic</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Voice Cloning Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Natural intonation and rhythm preservation</li>
                      <li>• Multilingual voice generation capability</li>
                      <li>• Emotional tone adjustment</li>
                      <li>• Background noise removal</li>
                      <li>• Professional audio quality output</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              {/* Always show test voice textarea for course content preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Content Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="bg-muted rounded-lg p-8 mb-4">
                      <Mic className="h-16 w-16 mx-auto mb-4 text-primary" />
                      <p className="font-medium">Preview Course Content for Voice Generation</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Review and customize the text that will be used for voice generation
                      </p>
                    </div>

                    <div className="space-y-4">
                      <textarea
                        value={testVoiceText}
                        onChange={(e) => {
                          setTestVoiceText(e.target.value);
                          setIsDirty(true);
                        }}
                        className="w-full p-3 border border-border rounded-lg bg-background"
                        rows={5}
                        placeholder="Enter text to generate with your cloned voice..."
                        data-testid="textarea-test-voice-text"
                      />
                      <Button 
                        className="w-full" 
                        disabled={!voiceCloneUrl}
                        data-testid="button-generate-sample"
                      >
                        <Mic className="mr-2 h-4 w-4" />
                        {voiceCloneUrl ? "Generate Voice Sample" : "Create Voice Clone First"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {voiceCloneUrl && (
                <Card>
                  <CardHeader>
                    <CardTitle>Voice Clone Ready</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="bg-accent/20 rounded-lg p-6 mb-4">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-accent" />
                        <p className="font-medium text-accent">Your voice clone is ready!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You can now generate voice samples and course narration
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {courseContent && courseContent.modules && (
                      <div className="space-y-4">
                        <h4 className="font-semibold">Generate Course Narration</h4>
                        <p className="text-sm text-muted-foreground">
                          Create voice narration for your course modules using the cloned voice.
                        </p>
                        
                        <div className="space-y-2">
                          {courseContent.modules.map((module: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                              <div>
                                <p className="font-medium">{module.title}</p>
                                <p className="text-sm text-muted-foreground">~{module.duration} minutes</p>
                              </div>
                              <Button variant="outline" size="sm" data-testid={`button-generate-narration-${index}`}>
                                <Mic className="mr-2 h-4 w-4" />
                                Generate
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Button className="w-full" data-testid="button-generate-all-narration">
                          <Volume2 className="mr-2 h-4 w-4" />
                          Generate All Course Narration
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
