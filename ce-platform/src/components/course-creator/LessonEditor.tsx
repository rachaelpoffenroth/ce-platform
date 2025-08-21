import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  SaveIcon,
  EyeIcon,
  UploadIcon,
  ImageIcon,
  VideoIcon,
  MicIcon,
  FileTextIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  LinkIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  CodeIcon,
  PublishIcon,
  DraftIcon,
  LockIcon,
  UnlockIcon,
  CalendarIcon,
  BarChart3Icon,
  BookmarkIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react';

interface LessonData {
  title: string;
  author: string;
  learningObjective: string;
  content: string;
  lessonType: string;
  points: number;
  thumbnailUrl: string;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  isDraft: boolean;
  requiresUnlock: boolean;
  releaseDay: number;
  embedCode: string;
}

interface LessonEditorProps {
  lesson: Partial<LessonData>;
  onSave: (lesson: LessonData) => void;
  onPublish: (lesson: LessonData) => void;
  onPreview: () => void;
  courseTitle?: string;
}

interface LessonStats {
  views: number;
  bookmarks: number;
  completionRate: number;
}

export default function LessonEditor({ 
  lesson, 
  onSave, 
  onPublish, 
  onPreview,
  courseTitle = "Course" 
}: LessonEditorProps) {
  const [lessonData, setLessonData] = useState({
    title: lesson?.title || 'New Lesson',
    author: lesson?.author || 'Instructor',
    learningObjective: lesson?.learningObjective || '',
    content: lesson?.content || '',
    lessonType: lesson?.lessonType || 'text',
    points: lesson?.points || 10,
    thumbnailUrl: lesson?.thumbnailUrl || '',
    attachments: lesson?.attachments || [],
    isDraft: lesson?.isDraft !== false,
    requiresUnlock: lesson?.requiresUnlock || false,
    releaseDay: lesson?.releaseDay || 0,
    embedCode: lesson?.embedCode || '',
    ...lesson
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Mock lesson stats - in real app would come from backend
  const [stats] = useState<LessonStats>({
    views: Math.floor(Math.random() * 100) + 10,
    bookmarks: Math.floor(Math.random() * 20) + 2,
    completionRate: Math.floor(Math.random() * 40) + 60
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setCursorPosition(e.target.selectionStart);
    setLessonData(prev => ({ ...prev, content: newContent }));
  };

  const handleTextSelection = () => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart;
      const end = contentRef.current.selectionEnd;
      const selected = contentRef.current.value.substring(start, end);
      setSelectedText(selected);
      setCursorPosition(start);
    }
  };

  const insertText = (textToInsert: string, wrapSelected: boolean = false) => {
    if (!contentRef.current) return;

    const textarea = contentRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentContent = lessonData.content;
    
    let newContent;
    if (wrapSelected && start !== end) {
      // Wrap selected text
      const beforeSelection = currentContent.substring(0, start);
      const selection = currentContent.substring(start, end);
      const afterSelection = currentContent.substring(end);
      newContent = beforeSelection + textToInsert.replace('{}', selection) + afterSelection;
    } else {
      // Insert at cursor position
      const beforeCursor = currentContent.substring(0, start);
      const afterCursor = currentContent.substring(end);
      newContent = beforeCursor + textToInsert + afterCursor;
    }

    setLessonData(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after inserted text
    setTimeout(() => {
      const newPosition = start + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 0);
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        insertText('**{}**', true);
        break;
      case 'italic':
        insertText('*{}*', true);
        break;
      case 'underline':
        insertText('<u>{}</u>', true);
        break;
      case 'h1':
        insertText('\n# ', false);
        break;
      case 'h2':
        insertText('\n## ', false);
        break;
      case 'h3':
        insertText('\n### ', false);
        break;
      case 'list':
        insertText('\n- ', false);
        break;
      case 'link':
        insertText('[Link Text](https://example.com)', false);
        break;
      case 'code':
        insertText('`{}`', true);
        break;
    }
  };

  const insertImage = (url: string, alt: string = 'Image') => {
    insertText(`![${alt}](${url})\n`, false);
    setIsImageModalOpen(false);
  };

  const insertEmbed = (embedCode: string) => {
    insertText(`\n<div class="embed-container">\n${embedCode}\n</div>\n`, false);
    setIsEmbedModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'attachment' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // In a real app, you'd upload to your server/cloud storage
    const fileUrl = URL.createObjectURL(file);
    
    if (type === 'attachment') {
      setLessonData(prev => ({
        ...prev,
        attachments: [...prev.attachments, {
          id: Date.now().toString(),
          name: file.name,
          type: file.type,
          url: fileUrl,
          size: file.size
        }]
      }));
    } else {
      setLessonData(prev => ({ ...prev, thumbnailUrl: fileUrl }));
    }
  };

  const removeAttachment = (id: string) => {
    setLessonData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== id)
    }));
  };

  const handleSave = () => {
    onSave(lessonData);
  };

  const handlePublish = () => {
    const publishedLesson = { ...lessonData, isDraft: false };
    setLessonData(publishedLesson);
    onPublish(publishedLesson);
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering for preview
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Lesson Editor
            {lessonData.isDraft ? (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                <DraftIcon size={12} className="mr-1" />
                Draft
              </Badge>
            ) : (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <PublishIcon size={12} className="mr-1" />
                Published
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-600">
            {courseTitle} → {lessonData.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPreview}>
            <EyeIcon className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
            <EyeIcon className="mr-2 h-4 w-4" />
            Student View
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Lesson Title</Label>
                <Input
                  id="title"
                  value={lessonData.title}
                  onChange={(e) => setLessonData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <Label htmlFor="author">Author Display</Label>
                <Input
                  id="author"
                  value={lessonData.author}
                  onChange={(e) => setLessonData(prev => ({ ...prev, author: e.target.value }))}
                  placeholder="Instructor name"
                />
              </div>

              <div>
                <Label htmlFor="objective">Learning Objective</Label>
                <Textarea
                  id="objective"
                  value={lessonData.learningObjective}
                  onChange={(e) => setLessonData(prev => ({ ...prev, learningObjective: e.target.value }))}
                  placeholder="Summary appearing at the top of your lesson and on course detail pages"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* WYSIWYG Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
              <div className="flex flex-wrap gap-1">
                {/* Formatting Toolbar */}
                <Button variant="ghost" size="sm" onClick={() => formatText('bold')}>
                  <BoldIcon size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => formatText('italic')}>
                  <ItalicIcon size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => formatText('underline')}>
                  <UnderlineIcon size={16} />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => formatText('h1')}>
                  H1
                </Button>
                <Button variant="ghost" size="sm" onClick={() => formatText('h2')}>
                  H2
                </Button>
                <Button variant="ghost" size="sm" onClick={() => formatText('h3')}>
                  H3
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => formatText('list')}>
                  <ListIcon size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => formatText('link')}>
                  <LinkIcon size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => formatText('code')}>
                  <CodeIcon size={16} />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" onClick={() => setIsImageModalOpen(true)}>
                  <ImageIcon size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEmbedModalOpen(true)}>
                  <CodeIcon size={16} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={contentRef}
                value={lessonData.content}
                onChange={handleContentChange}
                onSelect={handleTextSelection}
                placeholder="Enter your lesson content here. Use the formatting buttons above to style your text."
                rows={15}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Lesson Type & Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Lesson Type & Attachments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lesson Type</Label>
                  <Select
                    value={lessonData.lessonType}
                    onValueChange={(value) => setLessonData(prev => ({ ...prev, lessonType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">
                        <div className="flex items-center gap-2">
                          <FileTextIcon size={16} />
                          Text Lesson
                        </div>
                      </SelectItem>
                      <SelectItem value="video">
                        <div className="flex items-center gap-2">
                          <VideoIcon size={16} />
                          Video Lesson
                        </div>
                      </SelectItem>
                      <SelectItem value="audio">
                        <div className="flex items-center gap-2">
                          <MicIcon size={16} />
                          Audio Lesson
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Points on Completion</Label>
                  <Input
                    type="number"
                    value={lessonData.points}
                    onChange={(e) => setLessonData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    min="0"
                  />
                </div>
              </div>

              {/* File Attachments */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Attachments</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Add File
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'attachment')}
                />
                
                {lessonData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {lessonData.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{attachment.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <XCircleIcon size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Thumbnail Image</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => thumbnailInputRef.current?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Choose Thumbnail
                  </Button>
                </div>
                <input
                  ref={thumbnailInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'thumbnail')}
                />
                {lessonData.thumbnailUrl && (
                  <img 
                    src={lessonData.thumbnailUrl} 
                    alt="Thumbnail" 
                    className="w-32 h-20 object-cover rounded border"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Lesson Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3Icon size={18} />
                Lesson Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <EyeIcon size={16} />
                  Views
                </span>
                <span className="font-medium">{stats.views}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <BookmarkIcon size={16} />
                  Bookmarks
                </span>
                <span className="font-medium">{stats.bookmarks}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <CheckCircleIcon size={16} />
                  Completion
                </span>
                <span className="font-medium">{stats.completionRate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Release Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Release Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <LockIcon size={16} />
                    Requires Unlock
                  </Label>
                  <p className="text-xs text-gray-600">
                    Students must complete previous lesson first
                  </p>
                </div>
                <Switch
                  checked={lessonData.requiresUnlock}
                  onCheckedChange={(checked) => setLessonData(prev => ({ ...prev, requiresUnlock: checked }))}
                />
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <CalendarIcon size={16} />
                  Release Day
                </Label>
                <Input
                  type="number"
                  value={lessonData.releaseDay}
                  onChange={(e) => setLessonData(prev => ({ ...prev, releaseDay: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  min="0"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Days after enrollment to release this lesson
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Publish Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button onClick={handleSave} variant="outline" className="w-full">
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                
                {lessonData.isDraft ? (
                  <Button onClick={handlePublish} className="w-full bg-green-600 hover:bg-green-700">
                    <PublishIcon className="mr-2 h-4 w-4" />
                    Publish Lesson
                  </Button>
                ) : (
                  <Button onClick={handleSave} className="w-full">
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Update Published Lesson
                  </Button>
                )}
              </div>
              
              <div className="text-xs text-gray-600 space-y-1">
                {lessonData.isDraft ? (
                  <p>📝 This lesson is in draft mode and only visible to admins.</p>
                ) : (
                  <p>✅ This lesson is published and visible to students.</p>
                )}
                <p>💡 Remember to click "Save" and "Publish" to make changes live for students.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insert Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
            <DialogDescription>
              Add an image to your lesson content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Image URL</Label>
              <Input placeholder="/images/photo1755620493.jpg" id="imageUrl" />
            </div>
            <div>
              <Label>Alt Text</Label>
              <Input placeholder="Description of the image" id="imageAlt" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const url = (document.getElementById('imageUrl') as HTMLInputElement)?.value;
                const alt = (document.getElementById('imageAlt') as HTMLInputElement)?.value;
                if (url) insertImage(url, alt);
              }}>
                Insert Image
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Embed Modal */}
      <Dialog open={isEmbedModalOpen} onOpenChange={setIsEmbedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Embed Content</DialogTitle>
            <DialogDescription>
              Paste embed code for videos, forms, or other multimedia content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Embed Code</Label>
              <Textarea
                placeholder="<iframe src='...' width='...' height='...'></iframe>"
                rows={4}
                id="embedCode"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEmbedModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const code = (document.getElementById('embedCode') as HTMLTextAreaElement)?.value;
                if (code) insertEmbed(code);
              }}>
                Insert Embed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Student Preview Modal */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student View Preview</DialogTitle>
            <DialogDescription>
              This is exactly what students will see
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Learning Objective */}
            {lessonData.learningObjective && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Learning Objective</h4>
                <p className="text-blue-800">{lessonData.learningObjective}</p>
              </div>
            )}

            {/* Lesson Content */}
            <div className="prose max-w-none">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: renderContent(lessonData.content) 
                }} 
              />
            </div>

            {/* Attachments */}
            {lessonData.attachments.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Lesson Resources</h4>
                <div className="space-y-2">
                  {lessonData.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                      <FileTextIcon size={16} />
                      {attachment.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion */}
            <div className="border-t pt-4 text-center">
              <Button className="bg-green-600 hover:bg-green-700">
                <CheckCircleIcon className="mr-2 h-4 w-4" />
                Mark as Complete (+{lessonData.points} points)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}