# Shared Types & Utilities

Common TypeScript types, interfaces, and utility functions used across the platform.

## Structure

```
shared/
├── types/           # TypeScript type definitions
│   ├── recording.ts
│   ├── video.ts
│   ├── transcription.ts
│   └── user.ts
└── utils/           # Shared utility functions
    ├── validation.ts
    ├── formatting.ts
    └── constants.ts
```

## Usage

```typescript
import { RecordingOptions, VideoMetadata } from '@/shared/types';
import { formatDuration, validateEmail } from '@/shared/utils';
```
