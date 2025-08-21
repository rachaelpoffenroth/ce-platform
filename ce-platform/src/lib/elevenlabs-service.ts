// ElevenLabs Service for voice synthesis and cloning
export interface ElevenLabsConfig {
  apiKey: string;
  baseUrl: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: VoiceSettings;
}

export interface GenerationOptions {
  voice_id: string;
  text: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
  output_format?: string;
}

export class ElevenLabsService {
  private config: ElevenLabsConfig;

  constructor(config: ElevenLabsConfig) {
    this.config = config;
  }

  async getVoices(): Promise<Voice[]> {
    // Mock implementation - replace with actual ElevenLabs API call
    const mockVoices: Voice[] = [
      {
        voice_id: 'rachel_voice_id',
        name: 'Rachel',
        category: 'Professional',
        labels: { accent: 'American', age: 'Young Adult', gender: 'Female' },
        description: 'Professional, clear speaking voice ideal for presentations',
        preview_url: '',
        available_for_tiers: ['free', 'starter', 'creator'],
        settings: {
          stability: 0.75,
          similarity_boost: 0.8,
          style: 0.3,
          use_speaker_boost: true
        }
      },
      {
        voice_id: 'adam_voice_id',
        name: 'Adam',
        category: 'Professional',
        labels: { accent: 'American', age: 'Middle Aged', gender: 'Male' },
        description: 'Authoritative male voice perfect for business presentations',
        preview_url: '',
        available_for_tiers: ['free', 'starter', 'creator'],
        settings: {
          stability: 0.8,
          similarity_boost: 0.75,
          style: 0.2,
          use_speaker_boost: true
        }
      },
      {
        voice_id: 'domi_voice_id',
        name: 'Domi',
        category: 'Conversational',
        labels: { accent: 'American', age: 'Young Adult', gender: 'Female' },
        description: 'Energetic and engaging voice for dynamic presentations',
        preview_url: '',
        available_for_tiers: ['starter', 'creator'],
        settings: {
          stability: 0.7,
          similarity_boost: 0.85,
          style: 0.5,
          use_speaker_boost: true
        }
      }
    ];

    return mockVoices;
  }

  async generateSpeech(options: GenerationOptions): Promise<ArrayBuffer> {
    // Mock implementation - replace with actual ElevenLabs API call
    const mockAudioData = new ArrayBuffer(1024); // Mock audio data
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockAudioData;
  }

  async cloneVoice(audioFile: File, voiceName: string, description: string): Promise<Voice> {
    // Mock implementation - replace with actual voice cloning API call
    const mockClonedVoice: Voice = {
      voice_id: `cloned_${Date.now()}`,
      name: voiceName,
      category: 'Cloned',
      labels: { type: 'Custom', source: 'Cloned' },
      description,
      preview_url: '',
      available_for_tiers: ['creator'],
      settings: {
        stability: 0.75,
        similarity_boost: 0.9,
        style: 0.4,
        use_speaker_boost: true
      }
    };

    // Simulate cloning process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return mockClonedVoice;
  }

  async generatePresentationNarration(slides: Array<{
    title: string;
    content: string[];
    speakerNotes: string;
  }>, voiceId: string, voiceSettings?: VoiceSettings): Promise<Record<string, string>> {
    const audioFiles: Record<string, string> = {};

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const narrationText = this.createNarrationScript(slide, i === 0, i === slides.length - 1);
      
      try {
        const audioBuffer = await this.generateSpeech({
          voice_id: voiceId,
          text: narrationText,
          voice_settings: voiceSettings
        });

        // Convert ArrayBuffer to base64 data URL (mock)
        const base64Audio = this.arrayBufferToBase64(audioBuffer);
        audioFiles[`slide_${i}`] = `data:audio/mp3;base64,${base64Audio}`;
        
      } catch (error) {
        console.error(`Failed to generate audio for slide ${i}:`, error);
        // Create silent audio as fallback
        audioFiles[`slide_${i}`] = this.createSilentAudio(5000); // 5 seconds of silence
      }
    }

    return audioFiles;
  }

  private createNarrationScript(slide: { title: string; content: string[]; speakerNotes: string }, isFirst: boolean, isLast: boolean): string {
    let script = '';
    
    if (isFirst) {
      script += 'Welcome to this presentation. ';
    }
    
    script += `${slide.title}. `;
    
    if (slide.content.length > 0) {
      script += slide.content.join('. ') + '. ';
    }
    
    if (slide.speakerNotes) {
      script += slide.speakerNotes + '. ';
    }
    
    if (isLast) {
      script += 'Thank you for your attention.';
    }
    
    return script;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    // Mock base64 conversion
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  private createSilentAudio(durationMs: number): string {
    // Create a mock silent audio data URL
    return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTuR2OzKdCIBJnjE7OCCNggXZbnw5LdPFgwAZSS2z8lkHQY3ldNxy3EiAyZzye7ZbSMCIIHA9dV/OApRpuLq1mwcBy+CwOe8WAI5k9wXJVUbwQYMJGi44YqRPQoUZbXrxZNvAAYkWLnrlZ6ZNQoKI1OzuWV7HAYvgsDn1JhLdSLq"; // Mock WAV header
  }

  // Audio utility methods
  async createAudioFromBase64(base64Data: string): Promise<HTMLAudioElement> {
    const audio = new Audio(base64Data);
    return audio;
  }

  async playAudio(audioData: string): Promise<void> {
    const audio = await this.createAudioFromBase64(audioData);
    return audio.play();
  }
}

// Export configured instance (will be configured when API keys are available)
export const elevenLabsService = new ElevenLabsService({
  apiKey: process.env.REACT_APP_ELEVENLABS_API_KEY || 'demo-key',
  baseUrl: 'https://api.elevenlabs.io/v1'
});