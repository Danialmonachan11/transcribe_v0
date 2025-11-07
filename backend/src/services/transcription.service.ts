import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptionSegment {
  id: number;
  text: string;
  start: number;
  end: number;
  confidence?: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  segments: TranscriptionSegment[];
  duration: number;
}

/**
 * Transcribe audio from video using OpenAI Whisper
 */
export async function transcribeVideo(
  videoPath: string
): Promise<TranscriptionResult> {
  try {
    console.log('🎤 Starting transcription for:', videoPath);

    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured. Add it to backend/.env');
    }

    // Create read stream from video file
    const fileStream = fs.createReadStream(videoPath);

    // Call Whisper API with timestamp granularities
    const response = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    // Process segments
    const segments: TranscriptionSegment[] = (response.segments || []).map(
      (seg: any, index: number) => ({
        id: index,
        text: seg.text.trim(),
        start: seg.start,
        end: seg.end,
        confidence: seg.confidence || 0.95,
      })
    );

    const result: TranscriptionResult = {
      text: response.text,
      language: response.language || 'en',
      segments,
      duration: response.duration || 0,
    };

    console.log(
      `✅ Transcription complete: ${segments.length} segments, ${response.language}`
    );

    return result;
  } catch (error) {
    console.error('❌ Transcription failed:', error);

    if (error instanceof Error && error.message.includes('API key')) {
      // Return mock data if no API key (for demo)
      console.log('⚠️  Using mock transcription data (no API key)');
      return getMockTranscription();
    }

    throw error;
  }
}

/**
 * Mock transcription for demo purposes (when no API key)
 */
function getMockTranscription(): TranscriptionResult {
  return {
    text: 'This is a demo transcription. To enable real transcription, add your OPENAI_API_KEY to backend/.env file.',
    language: 'en',
    segments: [
      {
        id: 0,
        text: 'This is a demo transcription.',
        start: 0,
        end: 2.5,
        confidence: 0.95,
      },
      {
        id: 1,
        text: 'To enable real transcription, add your OPENAI_API_KEY to backend/.env file.',
        start: 2.5,
        end: 6.0,
        confidence: 0.95,
      },
    ],
    duration: 6.0,
  };
}
