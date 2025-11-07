import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';

export interface NarrationOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * Generate AI narration using ElevenLabs
 */
export async function generateNarration(
  text: string,
  options: NarrationOptions = {}
): Promise<string> {
  try {
    console.log('🎙️  Generating narration...');

    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('⚠️  ElevenLabs API key not configured. Using mock narration.');
      return getMockNarrationPath();
    }

    const voiceId = options.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah)
    const modelId = options.modelId || 'eleven_monolingual_v1';

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: modelId,
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    // Save audio file
    const uploadsDir = path.join(process.cwd(), 'uploads', 'narrations');
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `narration_${Date.now()}.mp3`;
    const filepath = path.join(uploadsDir, filename);

    await fs.writeFile(filepath, response.data);

    console.log(`✅ Narration generated: ${filename}`);
    return filepath;
  } catch (error) {
    console.error('❌ Narration generation failed:', error);
    return getMockNarrationPath();
  }
}

/**
 * Get available voices from ElevenLabs
 */
export async function getAvailableVoices(): Promise<any[]> {
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return getMockVoices();
    }

    const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
    });

    return response.data.voices || [];
  } catch (error) {
    console.error('Failed to fetch voices:', error);
    return getMockVoices();
  }
}

/**
 * Mock narration path for demo
 */
function getMockNarrationPath(): string {
  return 'mock_narration.mp3';
}

/**
 * Mock voices for demo
 */
function getMockVoices() {
  return [
    {
      voice_id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Sarah (Demo)',
      category: 'premade',
      description: 'Professional female voice',
    },
    {
      voice_id: 'TxGEqnHWrfWFTfGW9XjX',
      name: 'Josh (Demo)',
      category: 'premade',
      description: 'Professional male voice',
    },
  ];
}
