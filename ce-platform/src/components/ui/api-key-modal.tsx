import { useState, forwardRef, useImperativeHandle } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKeyModalProps {
  onApiKeySubmit: (apiKey: string) => void;
  buttonText?: string;
  onContinue?: () => void;
}

// Export interface for ref access
export interface ApiKeyModalRef {
  openModal: () => void;
}

export const ApiKeyModal = forwardRef<ApiKeyModalRef, ApiKeyModalProps>(
  ({ onApiKeySubmit, buttonText = "Set OpenAI API Key", onContinue }, ref) => {
    const [apiKey, setApiKey] = useState('');
    const [open, setOpen] = useState(false);
    
    // Expose the openModal method to parent components
    useImperativeHandle(ref, () => ({
      openModal: () => setOpen(true)
    }));
    
    const handleSubmit = () => {
      if (apiKey.trim()) {
        onApiKeySubmit(apiKey.trim());
        setOpen(false);
        
        // Call the onContinue callback if provided
        if (onContinue) {
          setTimeout(onContinue, 100); // Small delay to ensure API key is set
        }
      }
    };
    
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">{buttonText}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>OpenAI API Key Required</DialogTitle>
            <DialogDescription>
              An OpenAI API key is required to generate slides and quizzes.
              Your key is stored only in your browser and is never sent to our servers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              You can get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">OpenAI's dashboard</a>
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>Save & Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);