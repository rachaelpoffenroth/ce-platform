import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Plus } from 'lucide-react';

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

type Slide = TitleSlide | ContentSlide | ImageSlide | QuizSlide | VideoSlide;

interface SlidePreviewProps {
  slide: Slide;
  updateSlide: (updates: Partial<Slide>) => void;
  theme?: string;
}

export function SlidePreview({ slide, updateSlide, theme = 'professional' }: SlidePreviewProps) {
  const [activeTab, setActiveTab] = useState('edit');

  // Handle file uploads for images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Create object URL for the image file
    const imageUrl = URL.createObjectURL(file);
    updateSlide({ imageUrl });
  };

  // Add quiz option
  const addQuizOption = () => {
    if (slide.type === 'quiz') {
      updateSlide({
        options: [...slide.options, `Option ${slide.options.length + 1}`],
      });
    }
  };

  // Remove quiz option
  const removeQuizOption = (index: number) => {
    if (slide.type === 'quiz') {
      const newOptions = [...slide.options];
      newOptions.splice(index, 1);
      
      // Adjust correct answer index if needed
      let newCorrectAnswer = slide.correctAnswer;
      if (index === slide.correctAnswer) {
        newCorrectAnswer = 0;
      } else if (index < slide.correctAnswer) {
        newCorrectAnswer--;
      }
      
      updateSlide({
        options: newOptions,
        correctAnswer: newCorrectAnswer,
      });
    }
  };

  // Update quiz option text
  const updateQuizOption = (index: number, value: string) => {
    if (slide.type === 'quiz') {
      const newOptions = [...slide.options];
      newOptions[index] = value;
      updateSlide({ options: newOptions });
    }
  };

  // Set correct answer
  const setCorrectAnswer = (index: number) => {
    if (slide.type === 'quiz') {
      updateSlide({ correctAnswer: index });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Slide Editor</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit">
          {slide.type === 'title' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={slide.title}
                  onChange={(e) => updateSlide({ title: e.target.value })}
                  placeholder="Enter slide title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={slide.subtitle}
                  onChange={(e) => updateSlide({ subtitle: e.target.value })}
                  placeholder="Enter slide subtitle"
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          {slide.type === 'content' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="content-title">Title</Label>
                <Input
                  id="content-title"
                  value={slide.title}
                  onChange={(e) => updateSlide({ title: e.target.value })}
                  placeholder="Enter slide title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={slide.content}
                  onChange={(e) => updateSlide({ content: e.target.value })}
                  placeholder="Enter slide content"
                  rows={8}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          {slide.type === 'image' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-title">Title</Label>
                <Input
                  id="image-title"
                  value={slide.title}
                  onChange={(e) => updateSlide({ title: e.target.value })}
                  placeholder="Enter slide title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Image</Label>
                <div className="mt-1 flex items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {slide.imageUrl ? 'Change Image' : 'Upload Image'}
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                
                {slide.imageUrl && (
                  <div className="mt-2 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-white bg-opacity-70 rounded-full"
                      onClick={() => updateSlide({ imageUrl: '' })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <img
                      src={slide.imageUrl}
                      alt="Preview"
                      className="mt-2 max-h-[200px] object-contain rounded-md"
                    />
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="caption">Caption</Label>
                <Input
                  id="caption"
                  value={slide.caption}
                  onChange={(e) => updateSlide({ caption: e.target.value })}
                  placeholder="Enter image caption"
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          {slide.type === 'quiz' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={slide.question}
                  onChange={(e) => updateSlide({ question: e.target.value })}
                  placeholder="Enter quiz question"
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Options</Label>
                <div className="space-y-2 mt-1">
                  {slide.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant={slide.correctAnswer === index ? "default" : "outline"}
                            size="sm"
                            className="mr-2 w-8 h-8 p-0"
                            onClick={() => setCorrectAnswer(index)}
                          >
                            {index + 1}
                          </Button>
                          <Input
                            value={option}
                            onChange={(e) => updateQuizOption(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="ml-2 h-8 w-8 p-0"
                            onClick={() => removeQuizOption(index)}
                            disabled={slide.options.length <= 2}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addQuizOption}
                  disabled={slide.options.length >= 6}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
          
          {slide.type === 'video' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-title">Title</Label>
                <Input
                  id="video-title"
                  value={slide.title}
                  onChange={(e) => updateSlide({ title: e.target.value })}
                  placeholder="Enter slide title"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  value={slide.videoUrl}
                  onChange={(e) => updateSlide({ videoUrl: e.target.value })}
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="video-caption">Caption</Label>
                <Input
                  id="video-caption"
                  value={slide.caption}
                  onChange={(e) => updateSlide({ caption: e.target.value })}
                  placeholder="Enter video caption"
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="aspect-video bg-white border rounded-lg flex items-center justify-center p-8">
            {slide.type === 'title' && (
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">{slide.title || 'Title'}</h2>
                <p className="text-xl text-gray-600">{slide.subtitle || 'Subtitle'}</p>
              </div>
            )}
            
            {slide.type === 'content' && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">{slide.title || 'Content Title'}</h2>
                <div className="text-lg whitespace-pre-wrap">
                  {slide.content || 'Content text goes here...'}
                </div>
              </div>
            )}
            
            {slide.type === 'image' && (
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-2xl font-semibold mb-4">{slide.title || 'Image Title'}</h3>
                {slide.imageUrl ? (
                  <img 
                    src={slide.imageUrl} 
                    alt={slide.caption} 
                    className="max-h-[300px] mx-auto mb-2"
                  />
                ) : (
                  <div className="bg-gray-200 h-[200px] flex items-center justify-center mb-2">
                    <p className="text-gray-500">No image selected</p>
                  </div>
                )}
                <p className="text-gray-600">{slide.caption || 'Image caption'}</p>
              </div>
            )}
            
            {slide.type === 'quiz' && (
              <div className="w-full max-w-3xl mx-auto">
                <h3 className="text-2xl font-semibold mb-4">Quiz Question</h3>
                <p className="text-xl mb-6">{slide.question || 'Question text'}</p>
                <div className="space-y-3">
                  {slide.options.map((option, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 border rounded-md ${
                        idx === slide.correctAnswer ? 'border-green-500 bg-green-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          {idx + 1}
                        </div>
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {slide.type === 'video' && (
              <div className="text-center max-w-3xl mx-auto">
                <h3 className="text-2xl font-semibold mb-4">{slide.title || 'Video Title'}</h3>
                {slide.videoUrl ? (
                  <div className="aspect-video bg-black mb-2">
                    <div className="w-full h-full flex items-center justify-center text-white">
                      Video player: {slide.videoUrl}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-200 aspect-video flex items-center justify-center mb-2">
                    <p className="text-gray-500">No video URL provided</p>
                  </div>
                )}
                <p className="text-gray-600">{slide.caption || 'Video caption'}</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}