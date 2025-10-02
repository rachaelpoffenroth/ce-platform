import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { ObjectStorageService } from '../objectStorage';

interface VoiceCloneRequest {
  audioBuffer: Buffer;
  outputFormat?: string;
}

interface VoiceCloneResponse {
  voiceCloneUrl: string;
  duration: number;
  sampleRate: number;
}

export async function extractAndCloneVoice(videoUrl: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const tempDir = '/tmp';
      const videoFileName = `video_${Date.now()}.mp4`;
      const audioFileName = `audio_${Date.now()}.wav`;
      const videoPath = path.join(tempDir, videoFileName);
      const audioPath = path.join(tempDir, audioFileName);

      // Download video if it's a URL
      if (videoUrl.startsWith('http')) {
        // For object storage URLs, we need to handle authentication
        const objectStorageService = new ObjectStorageService();
        
        // Download the video file
        const response = await fetch(videoUrl);
        if (!response.ok) {
          throw new Error(`Failed to download video: ${response.statusText}`);
        }
        
        const videoBuffer = await response.arrayBuffer();
        fs.writeFileSync(videoPath, Buffer.from(videoBuffer));
      } else {
        // Local file path
        if (!fs.existsSync(videoUrl)) {
          throw new Error(`Video file not found: ${videoUrl}`);
        }
        fs.copyFileSync(videoUrl, videoPath);
      }

      // Extract audio from video using ffmpeg
      ffmpeg(videoPath)
        .audioCodec('pcm_s16le')
        .audioFrequency(22050)
        .audioChannels(1)
        .format('wav')
        .output(audioPath)
        .on('end', async () => {
          try {
            // Read the extracted audio
            const audioBuffer = fs.readFileSync(audioPath);
            
            // Process the audio for voice cloning
            const voiceCloneResult = await processVoiceCloning({
              audioBuffer,
              outputFormat: 'wav'
            });

            // Upload the processed voice clone to object storage
            const objectStorageService = new ObjectStorageService();
            const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
            
            // Upload the voice clone file
            const uploadResponse = await fetch(uploadUrl, {
              method: 'PUT',
              body: voiceCloneResult.audioBuffer,
              headers: {
                'Content-Type': 'audio/wav'
              }
            });

            if (!uploadResponse.ok) {
              throw new Error('Failed to upload voice clone');
            }

            // Clean up temporary files
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

            resolve(uploadUrl.split('?')[0]); // Return URL without query params
          } catch (error) {
            console.error('Error in voice cloning post-processing:', error);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('FFmpeg error:', error);
          // Clean up on error
          if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
          if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
          reject(new Error(`Audio extraction failed: ${error.message}`));
        })
        .run();

    } catch (error) {
      console.error('Error in extractAndCloneVoice:', error);
      reject(error);
    }
  });
}

async function processVoiceCloning(request: VoiceCloneRequest): Promise<{ audioBuffer: Buffer; metadata: any }> {
  try {
    // In a real implementation, this would integrate with services like:
    // - ElevenLabs API for high-quality voice cloning
    // - HeyGen API for video avatar generation
    // - Custom neural voice synthesis models
    
    // For now, we'll process and optimize the audio for voice synthesis
    const tempDir = '/tmp';
    const inputPath = path.join(tempDir, `input_${Date.now()}.wav`);
    const outputPath = path.join(tempDir, `processed_${Date.now()}.wav`);
    
    // Write input audio to temp file
    fs.writeFileSync(inputPath, request.audioBuffer);
    
    return new Promise((resolve, reject) => {
      // Process audio for optimal voice cloning
      ffmpeg(inputPath)
        .audioCodec('pcm_s16le')
        .audioFrequency(22050) // Optimal for voice synthesis
        .audioChannels(1) // Mono for voice cloning
        .audioFilters([
          'highpass=f=80', // Remove low-frequency noise
          'lowpass=f=8000', // Remove high-frequency noise
          'dynaudnorm', // Dynamic audio normalization
          'silenceremove=stop_periods=-1:stop_duration=0.5:stop_threshold=-50dB' // Remove silence
        ])
        .format('wav')
        .output(outputPath)
        .on('end', () => {
          try {
            const processedBuffer = fs.readFileSync(outputPath);
            
            // Clean up temp files
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            
            resolve({
              audioBuffer: processedBuffer,
              metadata: {
                sampleRate: 22050,
                channels: 1,
                format: 'wav',
                processed: true
              }
            });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (error) => {
          // Clean up on error
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          reject(error);
        })
        .run();
    });
    
  } catch (error) {
    console.error('Error in voice cloning processing:', error);
    throw new Error('Voice cloning processing failed');
  }
}

export async function generateVoiceFromText(text: string, voiceCloneUrl: string): Promise<string> {
  try {
    // In a real implementation, this would:
    // 1. Load the voice clone model from voiceCloneUrl
    // 2. Use the voice model to synthesize the text
    // 3. Return the generated audio URL
    
    // For now, we'll simulate the process and return a placeholder
    console.log(`Generating voice for text: ${text.substring(0, 50)}...`);
    console.log(`Using voice clone: ${voiceCloneUrl}`);
    
    // This would integrate with services like:
    // - ElevenLabs API: await elevenlabs.textToSpeech(text, voiceId)
    // - Azure Cognitive Services Speech API
    // - Google Cloud Text-to-Speech with custom voice
    
    // Upload the generated audio to object storage
    const objectStorageService = new ObjectStorageService();
    const uploadUrl = await objectStorageService.getObjectEntityUploadURL();
    
    // For demonstration, we'll return the upload URL
    // In production, this would be the actual generated audio
    return uploadUrl.split('?')[0];
    
  } catch (error) {
    console.error('Error generating voice from text:', error);
    throw new Error('Failed to generate voice from text');
  }
}

export async function validateAudioForVoiceCloning(audioBuffer: Buffer): Promise<{
  isValid: boolean;
  duration: number;
  quality: 'excellent' | 'good' | 'poor';
  issues: string[];
}> {
  try {
    const tempPath = path.join('/tmp', `validation_${Date.now()}.wav`);
    fs.writeFileSync(tempPath, audioBuffer);
    
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(tempPath, (err, metadata) => {
        // Clean up temp file
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        
        if (err) {
          reject(err);
          return;
        }
        
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        if (!audioStream) {
          resolve({
            isValid: false,
            duration: 0,
            quality: 'poor',
            issues: ['No audio stream found']
          });
          return;
        }
        
        const duration = parseFloat(audioStream.duration || '0');
        const sampleRate = parseInt(audioStream.sample_rate || '0');
        const bitRate = parseInt(audioStream.bit_rate || '0');
        
        const issues: string[] = [];
        let quality: 'excellent' | 'good' | 'poor' = 'excellent';
        
        // Validate duration (need at least 30 seconds for good voice cloning)
        if (duration < 30) {
          issues.push('Audio too short (minimum 30 seconds recommended)');
          quality = 'poor';
        } else if (duration < 60) {
          issues.push('Short audio (60+ seconds recommended for best results)');
          if (quality === 'excellent') quality = 'good';
        }
        
        // Validate sample rate
        if (sampleRate < 16000) {
          issues.push('Low sample rate (16kHz+ recommended)');
          quality = 'poor';
        } else if (sampleRate < 22050) {
          issues.push('Moderate sample rate (22kHz+ recommended)');
          if (quality === 'excellent') quality = 'good';
        }
        
        // Validate bit rate
        if (bitRate < 128000) {
          issues.push('Low bit rate (128kbps+ recommended)');
          if (quality === 'excellent') quality = 'good';
        }
        
        resolve({
          isValid: duration >= 10, // Minimum 10 seconds
          duration,
          quality,
          issues
        });
      });
    });
    
  } catch (error) {
    console.error('Error validating audio:', error);
    throw new Error('Failed to validate audio file');
  }
}
