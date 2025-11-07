export interface NarrationOptions {
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * Generate narration metadata (no actual audio generated, no API calls)
 */
export async function generateNarration(
  text: string,
  options: NarrationOptions = {}
): Promise<string> {
  console.log('🎙️  Generating narration metadata...');

  // Return mock narration path (no actual file created)
  const mockPath = `narration_${Date.now()}.mp3`;

  console.log(`✅ Narration metadata generated: ${mockPath}`);
  return mockPath;
}

/**
 * Get available voices (mock data, no API calls)
 */
export async function getAvailableVoices(): Promise<any[]> {
  return [
    {
      voice_id: 'EXAVITQu4vr4xnSDxMaL',
      name: 'Sarah (Professional)',
      category: 'premade',
      description: 'Professional female voice',
    },
    {
      voice_id: 'TxGEqnHWrfWFTfGW9XjX',
      name: 'Josh (Professional)',
      category: 'premade',
      description: 'Professional male voice',
    },
  ];
}
