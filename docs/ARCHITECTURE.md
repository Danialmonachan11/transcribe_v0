# System Architecture

## Overview

The **Screen Docs** platform is built as a modern, scalable web-first architecture with **zero-install screen recording** as its core differentiator. The system uses browser-native MediaStream APIs for capture, microservices for AI processing, and multi-format export generation.

## Key Architectural Principle

**Web-First, Extension-Optional**: Unlike competitors (Guidde), we prioritize web-based recording using native browser APIs, with the Chrome extension serving as an optional enhancement for power users.

## High-Level Architecture

```
┌─────────────────────────────────────────┐
│     Web App (PRIMARY RECORDER)          │
│  ┌───────────────────────────────────┐  │
│  │  MediaRecorder API                 │  │
│  │  • getDisplayMedia() [screen]      │  │
│  │  • getUserMedia() [camera/mic]     │  │
│  │  • Canvas API [PiP overlay]        │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  WebAssembly Processor             │  │
│  │  • Real-time compression           │  │
│  │  • Frame extraction                │  │
│  │  • Action detection                │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  Chunked Upload Pipeline           │  │
│  │  • S3 direct upload                │  │
│  │  • Progress tracking               │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓ HTTPS
┌─────────────────────────────────────────┐
│  Chrome Extension (OPTIONAL)            │ ◄─── Power users only
│  • System audio (all apps)              │
│  • Background recording                 │
│  • Desktop shortcuts                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│     Load Balancer (Nginx/ALB)           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         API Gateway                      │
│     • Rate Limiting                      │
│     • Authentication (JWT)               │
│     • CORS handling                      │
└─────────────────────────────────────────┘
              ↓
    ┌─────────┴─────────┬─────────┬───────────┐
    ▼                   ▼         ▼           ▼
┌──────────┐  ┌──────────────┐  ┌────────┐ ┌────────┐
│   API    │  │   Video      │  │ Export │ │Worker  │
│  Server  │  │  Processor   │  │Service │ │ Queue  │
└──────────┘  └──────────────┘  └────────┘ └────────┘
    │              │                │          │
    └──────────────┴────────────────┴──────────┘
                   ↓
    ┌──────────────┴──────────────┐
    ▼                             ▼
┌──────────┐               ┌──────────┐
│PostgreSQL│               │  Redis   │
│ Database │               │  Cache   │
└──────────┘               └──────────┘

┌─────────────────────────────────────────┐
│     AI/ML Services (External APIs)      │
├─────────────────────────────────────────┤
│ • OpenAI Whisper (Transcription)        │
│ • GPT-4 (Step Detection & Titles)       │
│ • ElevenLabs/Azure (AI Narration)       │
│ • Computer Vision (PII Detection)       │
└─────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│    Cloud Storage (S3/GCS) + CDN         │
│  • Original recordings                  │
│  • Processed videos                     │
│  • Exports (PDF/Word/HTML)              │
│  • Assets (thumbnails, frames)          │
└─────────────────────────────────────────┘
```

## Core Components

### 1. Frontend Applications

#### Web App (PRIMARY - Zero-Install Recorder) 🎯

**Our #1 Competitive Advantage**: No installation required, works directly in browser.

- **Technology**: React 18 + TypeScript + TailwindCSS
- **State Management**: Zustand
- **Build Tool**: Vite
- **WebWorkers**: Background video processing
- **WebAssembly**: Client-side compression

**Recording Engine**:
```
User clicks "Record" →
  getDisplayMedia() prompts screen selection →
    MediaRecorder captures stream →
      WebAssembly compresses chunks →
        Chunked upload to S3 →
          Backend processing queue
```

**Key Features**:
- ✅ **Zero-install screen recording** (MediaStream API)
- ✅ Screen + webcam + microphone capture
- ✅ Real-time preview and controls
- ✅ Canvas-based picture-in-picture overlay
- ✅ Client-side compression (WASM)
- ✅ Chunked upload for large files
- ✅ Action tracking for timeline editing
- ✅ Video library and management
- ✅ Timeline editor for steps
- ✅ Export configuration
- ✅ Analytics dashboard

**Browser Support**:
- Chrome 72+
- Firefox 66+
- Safari 13+
- Edge 79+

**Technical Stack**:
```typescript
// Core recording hook
import { useScreenRecorder } from '@/hooks/useScreenRecorder';

// WebWorker for compression
import VideoWorker from '@/workers/video.worker?worker';

// WASM compression module
import { compressVideo } from '@/wasm/compressor';
```

See [docs/WEB_RECORDING.md](./WEB_RECORDING.md) for implementation details.

---

#### Chrome Extension (OPTIONAL - Power Users Only)

**Purpose**: Optional enhancement for advanced users who need features beyond web capabilities.

- **Manifest**: V3
- **Permissions**: `desktopCapture`, `tabs`, `storage`
- **Usage**: Only for users who need system audio capture or background recording

**Enhanced Features** (vs. Web App):
- ✨ System audio capture from ALL applications
- ✨ Background recording without browser tab
- ✨ Global keyboard shortcuts
- ✨ Advanced capture settings
- ✨ Desktop app integration

**Install Base**: Target <5% of users (power users only)

**Why Optional**:
- Web app handles 95% of use cases
- No installation friction for majority
- Cross-browser web app vs. Chrome-only extension
- Easier onboarding without extension store

### 2. Backend Services

#### API Server (Node.js + Express)
**Responsibilities:**
- User authentication & authorization
- Video metadata management
- API request routing
- WebSocket connections for real-time updates

**Tech Stack:**
- Node.js 18+
- Express.js
- TypeScript
- Passport.js (authentication)
- Socket.io (WebSockets)

**Key Routes:**
```
/api/v1/auth/*         - Authentication
/api/v1/videos/*       - Video management
/api/v1/transcription/*- Transcription endpoints
/api/v1/narration/*    - Narration generation
/api/v1/export/*       - Export operations
/api/v1/analytics/*    - Analytics data
/api/v1/webhooks/*     - Webhook management
```

#### Video Processing Service
**Responsibilities:**
- Video upload handling
- Format validation and conversion
- Frame extraction
- Audio extraction
- Video compression

**Tech Stack:**
- FFmpeg for video processing
- Sharp for image manipulation
- Bull for job queuing
- AWS S3 SDK / Google Cloud Storage

**Processing Pipeline:**
```
Upload → Validate → Extract Audio → Extract Frames →
Compress → Store → Trigger Transcription
```

#### Worker Queue System
**Technology**: Bull (Redis-based)

**Job Types:**
1. **Video Processing Jobs**
   - Video conversion
   - Frame extraction
   - Thumbnail generation

2. **Transcription Jobs**
   - Audio-to-text conversion
   - Language detection
   - Timestamp alignment

3. **AI Processing Jobs**
   - Step detection
   - Action recognition
   - PII detection

4. **Narration Jobs**
   - Script generation
   - Voice synthesis
   - Audio mixing

5. **Export Jobs**
   - PDF generation
   - Video rendering
   - Document formatting

### 3. AI/ML Services

#### Transcription Service
**Provider**: OpenAI Whisper
**Features**:
- Multi-language support (100+ languages)
- Speaker diarization
- Timestamp accuracy
- Confidence scoring

**Implementation:**
```typescript
async function transcribeAudio(audioPath: string) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(audioPath));
  formData.append('model', 'whisper-1');

  const response = await openai.audio.transcriptions.create(formData);
  return response;
}
```

#### Step Detection Service
**Provider**: GPT-4
**Features**:
- Automatic step identification
- Action classification (click, type, navigate)
- Title generation
- Description writing

**Prompt Strategy:**
```typescript
const prompt = `
Analyze this screen recording transcript and frame data.
Identify distinct steps a user takes to complete the task.
For each step, provide:
1. Title (5-8 words)
2. Start timestamp
3. Actions performed (click, type, navigate, etc.)
4. Brief description

Transcript: ${transcript}
Frame actions: ${frameActions}
`;
```

#### Narration Generation Service
**Providers**: ElevenLabs (primary), Azure Neural TTS (fallback)

**ElevenLabs Integration:**
```typescript
async function generateNarration(text: string, voiceId: string) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  return response.blob();
}
```

#### PII Detection Service
**Technology**: Custom CV model + Regex
**Detects**:
- Email addresses
- Phone numbers
- Credit card numbers
- SSN/IDs
- Faces (blur option)

### 4. Database Layer

#### PostgreSQL Schema

**Users Table:**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Videos Table:**
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'uploading',
  duration INTEGER,
  file_size BIGINT,
  original_url TEXT,
  processed_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
```

**Transcriptions Table:**
```sql
CREATE TABLE transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  language VARCHAR(10),
  confidence DECIMAL(3,2),
  segments JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Steps Table:**
```sql
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  timestamp INTEGER,
  duration INTEGER,
  actions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_steps_video_id ON steps(video_id);
```

#### Redis Cache Strategy

**Cache Keys:**
```
user:{userId}                 - User data (TTL: 1h)
video:{videoId}               - Video metadata (TTL: 30m)
transcription:{videoId}       - Transcription data (TTL: 1h)
steps:{videoId}               - Steps data (TTL: 30m)
analytics:{videoId}:{date}    - Daily analytics (TTL: 24h)
rate_limit:{userId}:{endpoint} - Rate limiting (TTL: 1h)
```

**Cache Invalidation:**
- On video update: Clear `video:{videoId}`, `steps:{videoId}`
- On user update: Clear `user:{userId}`
- On transcription edit: Clear `transcription:{videoId}`

### 5. Storage Architecture

#### S3/GCS Bucket Structure
```
/videos/
  /original/{videoId}/video.mp4
  /processed/{videoId}/video.mp4
  /thumbnails/{videoId}/thumb.jpg
  /frames/{videoId}/{frameNumber}.jpg

/audio/
  /{videoId}/audio.mp3

/narration/
  /{videoId}/narration.mp3
  /{videoId}/final_audio.mp3

/exports/
  /{exportId}/document.{pdf|docx|html}

/uploads/
  /temp/{uploadId}/chunk_{n}
```

**CDN Configuration:**
- CloudFront/Cloud CDN for global distribution
- Signed URLs for private content
- Cache-Control headers for static assets
- Automatic compression

### 6. Security Architecture

#### Authentication Flow
```
1. User Login → JWT Generation
2. JWT stored in httpOnly cookie
3. Every request includes JWT
4. API Gateway validates JWT
5. User context attached to request
```

#### Authorization Levels
- **Free**: 5 videos/month, basic features
- **Pro**: Unlimited videos, all voices
- **Team**: Multi-user, collaboration
- **Enterprise**: Custom, SSO, compliance

#### Security Measures
- Rate limiting per user/IP
- SQL injection prevention (parameterized queries)
- XSS protection (CSP headers)
- CORS configuration
- Encryption at rest (S3)
- Encryption in transit (TLS 1.3)
- Regular security audits
- Secrets management (AWS Secrets Manager)

### 7. Monitoring & Observability

#### Metrics (DataDog/Prometheus)
- Request rate, latency, errors
- Video processing time
- Queue depth and processing rate
- Database query performance
- Cache hit/miss ratio
- Storage usage

#### Logging (ELK Stack)
- Structured JSON logs
- Log levels: DEBUG, INFO, WARN, ERROR
- Centralized log aggregation
- Searchable and filterable

#### Tracing (Jaeger)
- Distributed tracing across services
- Performance bottleneck identification
- Service dependency mapping

#### Alerting
- PagerDuty for critical alerts
- Slack for warnings
- Email for daily summaries

## Scalability Considerations

### Horizontal Scaling
- **API Servers**: Auto-scale based on CPU/memory
- **Workers**: Scale based on queue depth
- **Database**: Read replicas for queries
- **Cache**: Redis cluster for high availability

### Performance Optimization
- Video chunk upload for large files
- Progressive processing (show results as they complete)
- Lazy loading for frontend
- Database query optimization
- CDN caching for static assets

### Cost Optimization
- S3 lifecycle policies (move old videos to Glacier)
- Spot instances for workers
- Reserved instances for core services
- Compression before storage

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups, 30-day retention
- **Storage**: Cross-region replication
- **Configuration**: Version-controlled IaC (Terraform)

### Recovery Procedures
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Automated failover for critical services
- Regular disaster recovery drills

## Future Enhancements

1. **Real-time Collaboration**: Operational transform for multi-user editing
2. **Edge Computing**: Process videos closer to users
3. **AI Model Fine-tuning**: Custom models for specific industries
4. **Mobile Apps**: iOS/Android native apps
5. **GraphQL API**: For more flexible queries
6. **Kubernetes Migration**: For better orchestration
