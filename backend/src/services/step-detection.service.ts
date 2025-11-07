import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface Step {
  id: string;
  position: number;
  title: string;
  description: string;
  timestamp: number;
  duration: number;
  actions: string[];
}

/**
 * Detect steps from transcription using GPT-4
 */
export async function detectSteps(
  transcription: string,
  duration: number
): Promise<Step[]> {
  try {
    console.log('🔍 Detecting steps from transcription...');

    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  Using mock steps (no API key)');
      return getMockSteps(duration);
    }

    const prompt = `
You are an expert at analyzing screen recording transcripts and breaking them down into clear, actionable steps.

Analyze this transcript from a screen recording and identify distinct steps the user took:

Transcript:
"${transcription}"

Video Duration: ${duration} seconds

For each step, provide:
1. A clear, concise title (5-8 words)
2. A brief description of what the user did
3. Estimated timestamp (in seconds from start)
4. Estimated duration (in seconds)
5. Actions performed (e.g., "click", "type", "navigate", "select")

Return the steps as a JSON array with this structure:
[
  {
    "position": 1,
    "title": "Open the application",
    "description": "User navigates to the app and opens the main interface",
    "timestamp": 0,
    "duration": 5,
    "actions": ["navigate", "click"]
  },
  ...
]

Important:
- Create 3-7 logical steps
- Timestamps should not exceed ${duration} seconds
- Each step should have a clear purpose
- Actions should be one of: click, type, navigate, select, scroll, drag, upload, download
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            'You are an AI that analyzes screen recordings and creates step-by-step guides. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '{"steps": []}';
    const parsed = JSON.parse(content);
    const steps = parsed.steps || parsed;

    // Add unique IDs
    const stepsWithIds: Step[] = (Array.isArray(steps) ? steps : [steps]).map(
      (step: any, index: number) => ({
        id: `step_${index + 1}`,
        position: step.position || index + 1,
        title: step.title,
        description: step.description,
        timestamp: step.timestamp || 0,
        duration: step.duration || 5,
        actions: step.actions || ['click'],
      })
    );

    console.log(`✅ Detected ${stepsWithIds.length} steps`);
    return stepsWithIds;
  } catch (error) {
    console.error('❌ Step detection failed:', error);
    return getMockSteps(duration);
  }
}

/**
 * Mock steps for demo purposes
 */
function getMockSteps(duration: number): Step[] {
  return [
    {
      id: 'step_1',
      position: 1,
      title: 'Open the Screen Recording',
      description: 'User starts the screen recording application and selects the recording area',
      timestamp: 0,
      duration: Math.min(5, duration / 3),
      actions: ['navigate', 'click'],
    },
    {
      id: 'step_2',
      position: 2,
      title: 'Perform Main Task',
      description: 'User demonstrates the key workflow or process being documented',
      timestamp: Math.min(5, duration / 3),
      duration: Math.min(10, duration / 3),
      actions: ['click', 'type', 'navigate'],
    },
    {
      id: 'step_3',
      position: 3,
      title: 'Complete Recording',
      description: 'User finishes the demonstration and stops the recording',
      timestamp: Math.min(15, (duration * 2) / 3),
      duration: Math.min(5, duration / 3),
      actions: ['click'],
    },
  ];
}
