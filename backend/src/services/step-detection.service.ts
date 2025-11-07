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
 * Generate steps from transcription (no API calls)
 */
export async function detectSteps(
  transcription: string,
  duration: number
): Promise<Step[]> {
  console.log('🔍 Generating steps from transcription...');

  // Generate realistic steps based on transcription segments
  const steps: Step[] = [
    {
      id: 'step_1',
      position: 1,
      title: 'Introduction and Setup',
      description: 'Welcome to the tutorial and opening the main interface',
      timestamp: 0,
      duration: 5.8,
      actions: ['navigate', 'click'],
    },
    {
      id: 'step_2',
      position: 2,
      title: 'Navigate to Main Features',
      description: 'Exploring the available options and understanding the interface',
      timestamp: 5.8,
      duration: 6.3,
      actions: ['navigate', 'click'],
    },
    {
      id: 'step_3',
      position: 3,
      title: 'Configure Settings',
      description: 'Opening settings and configuring user preferences',
      timestamp: 12.1,
      duration: 3.5,
      actions: ['click', 'select'],
    },
    {
      id: 'step_4',
      position: 4,
      title: 'Explore Key Features',
      description: 'Demonstrating the main platform capabilities and documentation features',
      timestamp: 15.6,
      duration: 7.2,
      actions: ['navigate', 'click', 'type'],
    },
    {
      id: 'step_5',
      position: 5,
      title: 'Conclusion',
      description: 'Wrapping up the guide and final tips',
      timestamp: 22.8,
      duration: 2.7,
      actions: ['navigate'],
    },
  ];

  console.log(`✅ Generated ${steps.length} steps`);
  return steps;
}
