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
 * Generate mock transcription for video (no API calls)
 */
export async function transcribeVideo(
  videoPath: string
): Promise<TranscriptionResult> {
  console.log('🎤 Generating transcription for:', videoPath);

  // Generate realistic mock transcription
  const mockSegments = [
    { text: 'Welcome to this tutorial.', start: 0, end: 2.3 },
    { text: 'Today I\'m going to show you how to use this application.', start: 2.3, end: 5.8 },
    { text: 'First, let\'s start by opening the main interface.', start: 5.8, end: 8.9 },
    { text: 'As you can see here, we have several options available.', start: 8.9, end: 12.1 },
    { text: 'Click on the settings button to configure your preferences.', start: 12.1, end: 15.6 },
    { text: 'Next, we\'ll explore the key features of this platform.', start: 15.6, end: 19.2 },
    { text: 'This makes it easy to create professional documentation quickly.', start: 19.2, end: 22.8 },
    { text: 'And that\'s it! Thanks for watching this guide.', start: 22.8, end: 25.5 },
  ];

  const segments: TranscriptionSegment[] = mockSegments.map((seg, index) => ({
    id: index,
    text: seg.text,
    start: seg.start,
    end: seg.end,
    confidence: 0.95,
  }));

  const result: TranscriptionResult = {
    text: mockSegments.map(s => s.text).join(' '),
    language: 'en',
    segments,
    duration: mockSegments[mockSegments.length - 1].end,
  };

  console.log(`✅ Transcription generated: ${segments.length} segments`);

  return result;
}
