import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Image as ImageIcon, Type, Square, Circle, Triangle, 
  ChevronDown, Palette
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import DraggableElement from './DraggableElement';

// Slide interfaces
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

// Canvas element interface
interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'shape';
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  textAlign?: 'left' | 'center' | 'right';
}

interface CanvasEditorProps {
  slide: Slide;
  updateSlide: (updates: Partial<Slide>) => void;
  theme?: string;
}

export default function CanvasEditor({ slide, updateSlide, theme = 'professional' }: CanvasEditorProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [userPreferences, setUserPreferences] = useState({
    fontFamily: 'Inter',
    defaultColor: '#000000',
    defaultBackgroundColor: 'transparent',
    defaultTextAlign: 'left' as const,
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Theme styling based on provided theme prop
  const allThemeStyles = {
    professional: {
      titleBg: 'bg-blue-700',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-blue-500',
      bgColor: '#1d4ed8',
      textColor: '#ffffff',
      accentColor: '#3b82f6'
    },
    modern: {
      titleBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-purple-400',
      bgColor: 'linear-gradient(to right, #8b5cf6, #ec4899)',
      textColor: '#ffffff',
      accentColor: '#a78bfa'
    },
    minimal: {
      titleBg: 'bg-gray-100',
      titleText: 'text-gray-900',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-gray-400',
      bgColor: '#f3f4f6',
      textColor: '#111827',
      accentColor: '#9ca3af'
    },
    corporate: {
      titleBg: 'bg-gray-800',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-gray-700',
      bgColor: '#1f2937',
      textColor: '#ffffff',
      accentColor: '#4b5563'
    },
    vibrant: {
      titleBg: 'bg-gradient-to-r from-green-400 to-blue-500',
      titleText: 'text-white',
      contentBg: 'bg-white',
      contentText: 'text-gray-800',
      accent: 'border-green-400',
      bgColor: 'linear-gradient(to right, #4ade80, #3b82f6)',
      textColor: '#ffffff',
      accentColor: '#34d399'
    }
  };
  
  const themeStyles = allThemeStyles[theme as keyof typeof allThemeStyles] || allThemeStyles.professional;

  // Load AI learning data from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('easyceUserPreferences');
    if (savedPreferences) {
      try {
        setUserPreferences(JSON.parse(savedPreferences));
      } catch (e) {
        console.error('Error loading user preferences:', e);
      }
    }
  }, []);

  // Save AI learning data to localStorage
  const saveUserPreferences = (newPrefs: typeof userPreferences) => {
    setUserPreferences(newPrefs);
    localStorage.setItem('easyceUserPreferences', JSON.stringify(newPrefs));
  };

  // Initialize canvas with slide content on first load or when slide changes
  useEffect(() => {
    initializeCanvasFromSlide();
  }, [slide.id, theme]);

  // Create canvas elements from slide content
  const initializeCanvasFromSlide = () => {
    const newElements: CanvasElement[] = [];
    const textColor = themeStyles.titleText === 'text-white' ? '#ffffff' : '#000000';

    if (slide.type === 'title') {
      // Add title
      newElements.push({
        id: `title-${Date.now()}`,
        type: 'text',
        x: 50,
        y: 50,
        width: 700,
        height: 100,
        content: slide.title,
        fontSize: 48,
        fontFamily: userPreferences.fontFamily,
        fontWeight: 'bold',
        color: textColor,
        backgroundColor: 'transparent',
        textAlign: 'center'
      });

      // Add subtitle
      newElements.push({
        id: `subtitle-${Date.now() + 1}`,
        type: 'text',
        x: 50,
        y: 160,
        width: 700,
        height: 60,
        content: slide.subtitle,
        fontSize: 32,
        fontFamily: userPreferences.fontFamily,
        color: textColor,
        backgroundColor: 'transparent',
        textAlign: 'center'
      });
    } else if (slide.type === 'content') {
      // Add title
      newElements.push({
        id: `content-title-${Date.now()}`,
        type: 'text',
        x: 50,
        y: 50,
        width: 700,
        height: 60,
        content: slide.title,
        fontSize: 36,
        fontFamily: userPreferences.fontFamily,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: 'transparent',
        textAlign: 'left'
      });

      // Add content
      newElements.push({
        id: `content-body-${Date.now() + 1}`,
        type: 'text',
        x: 50,
        y: 120,
        width: 700,
        height: 300,
        content: slide.content,
        fontSize: 24,
        fontFamily: userPreferences.fontFamily,
        color: '#000000',
        backgroundColor: 'transparent',
        textAlign: 'left'
      });
    } else if (slide.type === 'image') {
      // Add title
      newElements.push({
        id: `image-title-${Date.now()}`,
        type: 'text',
        x: 50,
        y: 50,
        width: 700,
        height: 60,
        content: slide.title,
        fontSize: 36,
        fontFamily: userPreferences.fontFamily,
        fontWeight: 'bold',
        color: '#000000',
        backgroundColor: 'transparent',
        textAlign: 'center'
      });

      // Add image if available
      if (slide.imageUrl) {
        newElements.push({
          id: `image-${Date.now() + 1}`,
          type: 'image',
          x: 200,
          y: 120,
          width: 400,
          height: 250,
          src: slide.imageUrl
        });
      }

      // Add caption
      newElements.push({
        id: `caption-${Date.now() + 2}`,
        type: 'text',
        x: 50,
        y: 380,
        width: 700,
        height: 40,
        content: slide.caption,
        fontSize: 20,
        fontFamily: userPreferences.fontFamily,
        color: '#666666',
        backgroundColor: 'transparent',
        textAlign: 'center'
      });
    }

    setElements(newElements);
  };

  // Update the slide based on canvas elements
  const updateSlideFromCanvas = () => {
    if (slide.type === 'title') {
      const titleElement = elements.find(el => el.id.startsWith('title-'));
      const subtitleElement = elements.find(el => el.id.startsWith('subtitle-'));
      
      updateSlide({
        title: titleElement?.content || slide.title,
        subtitle: subtitleElement?.content || slide.subtitle
      });
    } else if (slide.type === 'content') {
      const titleElement = elements.find(el => el.id.startsWith('content-title-'));
      const contentElement = elements.find(el => el.id.startsWith('content-body-'));
      
      updateSlide({
        title: titleElement?.content || slide.title,
        content: contentElement?.content || slide.content
      });
    } else if (slide.type === 'image') {
      const titleElement = elements.find(el => el.id.startsWith('image-title-'));
      const imageElement = elements.find(el => el.type === 'image');
      const captionElement = elements.find(el => el.id.startsWith('caption-'));
      
      updateSlide({
        title: titleElement?.content || slide.title,
        imageUrl: imageElement?.src || slide.imageUrl,
        caption: captionElement?.content || slide.caption
      });
    }
  };

  // Effect to update slide when elements change
  useEffect(() => {
    if (elements.length > 0) {
      updateSlideFromCanvas();
    }
  }, [elements]);

  // Add a new text element
  const addTextElement = () => {
    const newId = `text-${Date.now()}`;
    const newElement: CanvasElement = {
      id: newId,
      type: 'text',
      x: 50,
      y: 50,
      width: 300,
      height: 60,
      content: 'New text element',
      fontSize: 24,
      fontFamily: userPreferences.fontFamily,
      color: userPreferences.defaultColor,
      backgroundColor: userPreferences.defaultBackgroundColor,
      textAlign: userPreferences.defaultTextAlign
    };
    
    setElements([...elements, newElement]);
    setActiveElementId(newId);

    // Learn preference
    saveUserPreferences({
      ...userPreferences,
      fontFamily: userPreferences.fontFamily,
    });
  };

  // Add a shape element
  const addShapeElement = (shapeType: 'rectangle' | 'circle' | 'triangle' = 'rectangle') => {
    const newId = `shape-${Date.now()}`;
    const newElement: CanvasElement = {
      id: newId,
      type: 'shape',
      shapeType: shapeType,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      backgroundColor: '#e0e0e0',
      borderColor: '#000000',
      borderWidth: 0
    };
    
    setElements([...elements, newElement]);
    setActiveElementId(newId);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const imageUrl = URL.createObjectURL(file);
    const newId = `image-${Date.now()}`;
    
    const newElement: CanvasElement = {
      id: newId,
      type: 'image',
      x: 100,
      y: 100,
      width: 300,
      height: 200,
      src: imageUrl
    };
    
    setElements([...elements, newElement]);
    setActiveElementId(newId);
  };

  // Update element properties
  const updateElementProperty = (id: string, property: keyof CanvasElement, value: unknown) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, [property]: value } : el
    ));
    
    // Learn preference if it's a font family change
    if (property === 'fontFamily') {
      saveUserPreferences({
        ...userPreferences,
        fontFamily: value
      });
    } else if (property === 'color') {
      saveUserPreferences({
        ...userPreferences,
        defaultColor: value
      });
    } else if (property === 'textAlign') {
      saveUserPreferences({
        ...userPreferences,
        defaultTextAlign: value as 'left' | 'center' | 'right'
      });
    }
  };

  // Delete an element
  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (activeElementId === id) {
      setActiveElementId(null);
    }
  };

  // Duplicate an element
  const duplicateElement = (id: string) => {
    const elementToDuplicate = elements.find(el => el.id === id);
    if (!elementToDuplicate) return;
    
    const newId = `${elementToDuplicate.type}-${Date.now()}`;
    const newElement = {
      ...elementToDuplicate,
      id: newId,
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20
    };
    
    setElements([...elements, newElement]);
    setActiveElementId(newId);
  };

  // Handle element movement
  const moveElement = (id: string, newX: number, newY: number) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) } : el
    ));
  };

  // Handle element content update
  const updateElementContent = (id: string, content: string) => {
    updateElementProperty(id, 'content', content);
  };

  // Get active element
  const activeElement = elements.find(el => el.id === activeElementId);

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full mb-4">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="h-full flex flex-col">
          <div className="flex space-x-2 mb-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={addTextElement}
            >
              <Type className="h-4 w-4 mr-1" /> 
              Add Text
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Square className="h-4 w-4 mr-1" /> 
                  Add Shape
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => addShapeElement('rectangle')}>
                    <Square className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addShapeElement('circle')}>
                    <Circle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => addShapeElement('triangle')}>
                    <Triangle className="h-4 w-4" />
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-1" /> 
              Add Image
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <Palette className="h-4 w-4 mr-1" /> 
                  Theme Colors
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="grid grid-cols-5 gap-2">
                  {Object.keys(allThemeStyles).map((themeName) => {
                    const theme = allThemeStyles[themeName as keyof typeof allThemeStyles];
                    return (
                      <div 
                        key={themeName}
                        className="cursor-pointer text-center"
                        onClick={() => updateElementProperty(
                          activeElementId || '', 
                          'backgroundColor', 
                          theme.bgColor
                        )}
                      >
                        <div 
                          className="h-8 rounded mb-1"
                          style={{ background: theme.bgColor }}
                        ></div>
                        <span className="text-xs capitalize">{themeName}</span>
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div 
            className={`relative flex-grow border rounded-lg ${
              slide.type === 'title' ? themeStyles.titleBg : 'bg-white'
            } overflow-hidden`} 
            style={{ minHeight: '400px' }}
            onClick={() => setActiveElementId(null)}
          >
            <div 
              ref={canvasRef} 
              className="w-full h-full relative"
            >
              {elements.map((element) => (
                <DraggableElement
                  key={element.id}
                  id={element.id}
                  type={element.type}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  content={element.content}
                  src={element.src}
                  fontSize={element.fontSize}
                  fontFamily={element.fontFamily}
                  fontWeight={element.fontWeight}
                  color={element.color}
                  backgroundColor={element.backgroundColor}
                  textAlign={element.textAlign}
                  isActive={element.id === activeElementId}
                  onSelect={setActiveElementId}
                  onDelete={deleteElement}
                  onDuplicate={duplicateElement}
                  onMove={moveElement}
                  onUpdate={updateElementContent}
                />
              ))}
            </div>
          </div>

          {activeElement && (
            <div className="mt-4 border p-4 rounded-lg">
              <h3 className="font-medium mb-3">Element Properties</h3>

              <div className="space-y-3">
                {activeElement.type === 'text' && (
                  <>
                    <div>
                      <Label htmlFor="text-content">Text</Label>
                      <Textarea
                        id="text-content"
                        value={activeElement.content || ''}
                        onChange={(e) => updateElementProperty(activeElement.id, 'content', e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2 items-center">
                      <div className="w-1/2">
                        <Label>Font Size</Label>
                        <Input
                          type="number"
                          value={activeElement.fontSize || 16}
                          onChange={(e) => updateElementProperty(activeElement.id, 'fontSize', Number(e.target.value))}
                          min={8}
                          max={72}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="w-1/2">
                        <Label>Font Family</Label>
                        <select
                          value={activeElement.fontFamily}
                          onChange={(e) => updateElementProperty(activeElement.id, 'fontFamily', e.target.value)}
                          className="w-full mt-1 rounded-md border border-gray-300 py-1 px-2"
                        >
                          <option value="Inter">Inter</option>
                          <option value="Arial">Arial</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Courier New">Courier New</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Verdana">Verdana</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div>
                        <Label>Color</Label>
                        <input
                          type="color"
                          value={activeElement.color || '#000000'}
                          onChange={(e) => updateElementProperty(activeElement.id, 'color', e.target.value)}
                          className="w-full h-8 mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Background</Label>
                        <input
                          type="color"
                          value={activeElement.backgroundColor === 'transparent' ? '#ffffff' : activeElement.backgroundColor || '#ffffff'}
                          onChange={(e) => updateElementProperty(activeElement.id, 'backgroundColor', e.target.value)}
                          className="w-full h-8 mt-1"
                        />
                      </div>

                      <div>
                        <Label>Clear BG</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateElementProperty(activeElement.id, 'backgroundColor', 'transparent')}
                          className="mt-1"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      <Button
                        variant={activeElement.fontWeight === 'bold' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'fontWeight', activeElement.fontWeight === 'bold' ? 'normal' : 'bold')}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeElement.fontStyle === 'italic' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'fontStyle', activeElement.fontStyle === 'italic' ? 'normal' : 'italic')}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeElement.textDecoration === 'underline' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'textDecoration', activeElement.textDecoration === 'underline' ? 'none' : 'underline')}
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeElement.textAlign === 'left' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'textAlign', 'left')}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeElement.textAlign === 'center' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'textAlign', 'center')}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeElement.textAlign === 'right' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'textAlign', 'right')}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}

                {activeElement.type === 'shape' && (
                  <>
                    <div className="flex space-x-2 mb-3">
                      <Button
                        variant={activeElement.shapeType === 'rectangle' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'shapeType', 'rectangle')}
                      >
                        <Square className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeElement.shapeType === 'circle' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'shapeType', 'circle')}
                      >
                        <Circle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={activeElement.shapeType === 'triangle' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => updateElementProperty(activeElement.id, 'shapeType', 'triangle')}
                      >
                        <Triangle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <div className="w-1/2">
                        <Label>Fill Color</Label>
                        <input
                          type="color"
                          value={activeElement.backgroundColor || '#e0e0e0'}
                          onChange={(e) => updateElementProperty(activeElement.id, 'backgroundColor', e.target.value)}
                          className="w-full h-8 mt-1"
                        />
                      </div>
                      
                      <div className="w-1/2">
                        <Label>Border Color</Label>
                        <input
                          type="color"
                          value={activeElement.borderColor || '#000000'}
                          onChange={(e) => updateElementProperty(activeElement.id, 'borderColor', e.target.value)}
                          className="w-full h-8 mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <Label>Border Width</Label>
                      <Input
                        type="number"
                        value={activeElement.borderWidth || 0}
                        onChange={(e) => updateElementProperty(activeElement.id, 'borderWidth', Number(e.target.value))}
                        min={0}
                        max={20}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex space-x-2 mt-2">
                      <div className="w-1/2">
                        <Label>Width</Label>
                        <Input
                          type="number"
                          value={activeElement.width}
                          onChange={(e) => updateElementProperty(activeElement.id, 'width', Number(e.target.value))}
                          min={10}
                          max={800}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>Height</Label>
                        <Input
                          type="number"
                          value={activeElement.height}
                          onChange={(e) => updateElementProperty(activeElement.id, 'height', Number(e.target.value))}
                          min={10}
                          max={600}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeElement.type === 'image' && (
                  <>
                    <div>
                      <Label>Replace Image</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full mt-1"
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        Change Image
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-1/2">
                        <Label>Width</Label>
                        <Input
                          type="number"
                          value={activeElement.width}
                          onChange={(e) => updateElementProperty(activeElement.id, 'width', Number(e.target.value))}
                          min={50}
                          max={800}
                          className="mt-1"
                        />
                      </div>
                      <div className="w-1/2">
                        <Label>Height</Label>
                        <Input
                          type="number"
                          value={activeElement.height}
                          onChange={(e) => updateElementProperty(activeElement.id, 'height', Number(e.target.value))}
                          min={50}
                          max={600}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex space-x-2">
                  <div className="w-1/2">
                    <Label>Position X</Label>
                    <Input
                      type="number"
                      value={activeElement.x}
                      onChange={(e) => updateElementProperty(activeElement.id, 'x', Number(e.target.value))}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                  <div className="w-1/2">
                    <Label>Position Y</Label>
                    <Input
                      type="number"
                      value={activeElement.y}
                      onChange={(e) => updateElementProperty(activeElement.id, 'y', Number(e.target.value))}
                      min={0}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview" className="h-full">
          <div 
            className={`relative w-full h-full border rounded-lg ${
              slide.type === 'title' ? themeStyles.titleBg : 'bg-white'
            } overflow-hidden`}
            style={{ minHeight: '450px' }}
          >
            {elements.map((element) => (
              <div
                key={element.id}
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  fontSize: `${element.fontSize}px`,
                  fontFamily: element.fontFamily,
                  fontWeight: element.fontWeight,
                  color: element.color,
                  backgroundColor: element.backgroundColor === 'transparent' ? 'transparent' : element.backgroundColor,
                  textAlign: element.textAlign || 'left',
                }}
              >
                {element.type === 'text' && (
                  <div>{element.content}</div>
                )}

                {element.type === 'image' && element.src && (
                  <img
                    src={element.src}
                    alt="Slide element"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                )}

                {element.type === 'shape' && (
                  <>
                    {element.shapeType === 'rectangle' && (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: element.backgroundColor || '#e0e0e0',
                        border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                      }} />
                    )}
                    {element.shapeType === 'circle' && (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: element.backgroundColor || '#e0e0e0',
                        borderRadius: '50%',
                        border: element.borderWidth ? `${element.borderWidth}px solid ${element.borderColor}` : 'none'
                      }} />
                    )}
                    {element.shapeType === 'triangle' && (
                      <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundColor: 'transparent',
                        borderLeft: `${element.width / 2}px solid transparent`,
                        borderRight: `${element.width / 2}px solid transparent`,
                        borderBottom: `${element.height}px solid ${element.backgroundColor || '#e0e0e0'}`,
                      }} />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}