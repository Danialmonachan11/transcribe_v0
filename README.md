# 🎬 Screen Docs - Zero-Install Documentation Platform

> **Record. Transcribe. Share. All from your browser. No installation required.**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://demo.screendocs.app)
[![Web APIs](https://img.shields.io/badge/MediaRecorder-native-blue)](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## 🚀 The Guidde Killer

We're building the **first zero-install screen documentation platform** that works directly in your browser—no Chrome extension required.

### Record Instantly 🎥
Click "Start Recording" → Select screen → Done. No downloads, no permissions pop-ups, no extension store visits.

### Works Everywhere 🌍
Chrome • Firefox • Safari • Edge • Any modern browser

### AI-Powered Documentation 🤖
Automatic transcription → Step detection → Voice narration → Multi-format export

---

## 🎯 Vision

The first **web-native screen documentation platform**—no installation required. We're building the next generation of documentation tools that eliminates friction, works across all browsers, and produces both video guides AND written SOPs simultaneously.

## 🌟 Why We're Different (vs. Guidde)

### 1. **Web-Based Recording (No Extension Required)** 🎯
Unlike Guidde which requires a Chrome extension, we use the **MediaStream Recording API** and **getDisplayMedia** to enable instant recording directly from your web app.

**Advantages:**
- ✅ **Zero installation**—works in any modern browser
- ✅ **Cross-browser support** (Chrome, Edge, Firefox, Safari)
- ✅ **Lower friction** = higher conversion rates
- ✅ **No permission fears**—users trust web apps more than extensions
- ✅ **Mobile-ready foundation** (extension = desktop only)
- ✅ **SEO-friendly**—web app is indexable, extensions aren't

**Technical Implementation:**
```javascript
// Web-native screen capture
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: { cursor: 'always', width: 1920, height: 1080 },
  audio: { echoCancellation: true, noiseSuppression: true }
});

const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 2500000
});
```

### 2. **Optional Browser Extension for Power Users**
For advanced users who want system-audio capture and background recording, we *also* offer an extension—but it's **optional**, not required.

### 3. **Action-Based Timeline Editing**
Edit steps without re-recording. We capture *user actions* (clicks, inputs, navigations) not just pixels, allowing evergreen updates.

### 4. **Dual Output: Video + Written Documentation**
Simultaneously generates narrated video AND editable SOPs (Markdown/PDF/Word/Confluence).

### 5. **Superior AI Voices**
100+ studio-grade voices with emotion control and voice cloning—no more robotic Guidde narration.

### 6. **Collaborative Workflows**
Multiplayer editing, approval pipelines, version control, and Slack/Teams integrations.

### 7. **Interactive Elements**
In-video quizzes, branching scenarios, and in-app walkthroughs for higher engagement.

### 8. **Privacy & Compliance**
Auto-PII detection, GDPR/HIPAA compliance, data encryption at rest and in transit.

---

## 📊 Feature Comparison

| Feature | Guidde | Screen Docs (Ours) |
|---------|--------|-------------------|
| **Recording Method** | Chrome extension only 🔴 | Web app (zero-install) ✅ |
| **Browser Support** | Chrome/Edge only | Chrome, Firefox, Safari, Edge ✅ |
| **Installation Required** | Yes (extension) 🔴 | No ✅ |
| **Voice Quality** | Basic AI (monotonous) 🔴 | Studio-grade 100+ voices ✅ |
| **Edit Without Re-recording** | No 🔴 | Yes (action-based timeline) ✅ |
| **Written Documentation** | Video only 🔴 | Video + auto-generated SOP ✅ |
| **Collaboration** | Single creator 🔴 | Multiplayer editing ✅ |
| **Analytics** | Basic 🔴 | Heatmaps, completion tracking ✅ |
| **Interactive Features** | None 🔴 | Quizzes, branching, in-app overlays ✅ |
| **Mobile Recording** | No 🔴 | Roadmap ⏳ |

---

## ✨ Core Features

### Recording Engine
- **Web-based capture** using MediaStream API (screen + webcam + mic)
- **Optional extension** for power users (system audio, background recording)
- **Real-time compression** with WebAssembly
- **Chunked upload** for large files
- **Action tracking** for evergreen editing

### AI-Powered Processing
- **Smart Transcription**: OpenAI Whisper for 100+ languages
- **AI Step Detection**: GPT-4 automatically identifies logical steps
- **Voice Narration**: ElevenLabs/Azure TTS with emotion controls
- **PII Detection**: Computer vision for privacy protection

### Multi-Format Export
- **Video**: MP4 with professional narration
- **Documents**: PDF, Word, Markdown
- **Knowledge Bases**: Confluence, Notion
- **LMS**: SCORM packages for training platforms
- **Interactive**: HTML with embedded quizzes

### Collaboration & Analytics
- **Multiplayer editing** with real-time sync
- **Approval workflows** for compliance
- **Engagement analytics**: Views, completion rates, heatmaps
- **Version control**: Track changes and rollback

## 🏗️ Architecture

### Tech Stack

**Recording Engine (Web-First)**

**Primary: Web App Recording**
- **MediaStream API** (`getDisplayMedia`) for screen capture
- **MediaRecorder API** for video encoding
- **WebRTC** for real-time streaming and processing
- **WebAssembly** for client-side video compression
- Support for: Screen + Webcam + Mic + System Audio (where available)

**Optional: Browser Extension** (for power users)
- Chrome Extension (Manifest V3) for enhanced features:
  - System audio capture (all apps)
  - Background recording
  - Desktop app integration
  - Advanced keyboard shortcuts

**Frontend:**
- React 18 + TypeScript
- TailwindCSS for styling
- Zustand for state management
- Vite for build tooling
- WebWorkers for background processing

**Backend:**
- Node.js + Express / FastAPI (Python)
- PostgreSQL for data persistence
- Redis for caching and job queues
- AWS S3/CloudFront for video storage and delivery
- Bull for job processing

**AI/ML Services:**
- OpenAI Whisper for transcription
- ElevenLabs/Azure TTS for narration
- GPT-4 for step generation and script writing
- Computer vision for PII detection

**Infrastructure:**
- Docker + Kubernetes for containerization
- AWS/GCP for cloud hosting
- GitHub Actions for CI/CD
- DataDog/New Relic for monitoring

### System Design

```
┌─────────────────────────────────────────┐
│     Web App (React + TypeScript)        │
│  ┌───────────────────────────────────┐  │
│  │  MediaRecorder API                 │  │
│  │  - getDisplayMedia() for screen    │  │
│  │  - getUserMedia() for camera/mic   │  │
│  │  - MediaStream merging             │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  WebAssembly Video Processor       │  │
│  │  - Real-time compression           │  │
│  │  - Frame extraction for steps      │  │
│  │  - Click detection                 │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  Upload Pipeline                   │  │
│  │  - Chunked upload to S3            │  │
│  │  - Background processing queue     │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│         Backend Processing              │
├─────────────────────────────────────────┤
│  [Video Processor] → [Transcription]    │
│         ↓                                │
│  [AI Step Generator] → [Narration]      │
│         ↓                                │
│  [Export Engine] → [CDN] → [Users]      │
└─────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- API Keys: OpenAI, ElevenLabs/Azure, Replicate
- Modern browser (Chrome, Firefox, Safari, or Edge)

### Quick Start (Web App - No Extension)
```bash
# Clone repository
git clone https://github.com/yourusername/screen-docs-web-recorder.git
cd screen-docs-web-recorder

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development servers
docker-compose up -d
npm run dev:web-app

# Open browser
# Navigate to http://localhost:3001
# Click "Start Recording" - no extension needed!
```

### Optional: Chrome Extension Setup (Power Users)
```bash
# Build extension
npm run build:extension

# Load Chrome extension
# 1. Open chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select ./chrome-extension/dist folder
```

## 📂 Project Structure
```
/
├── web-app/                   # PRIMARY: Zero-install web recorder
│   ├── src/
│   │   ├── components/
│   │   │   ├── RecordingControls.tsx    # Start/stop/pause UI
│   │   │   ├── StreamPreview.tsx        # Live preview
│   │   │   ├── PermissionHandler.tsx    # Screen access flow
│   │   │   └── UploadManager.tsx        # Chunked upload
│   │   ├── hooks/
│   │   │   ├── useScreenRecorder.ts     # MediaRecorder logic
│   │   │   ├── useMediaStream.ts        # getDisplayMedia wrapper
│   │   │   └── useActionDetector.ts     # Click tracking
│   │   ├── services/
│   │   │   ├── recorder.service.ts      # Recording engine
│   │   │   ├── upload.service.ts        # S3 chunked upload
│   │   │   └── compression.service.ts   # Client-side processing
│   │   └── workers/
│   │       ├── video.worker.ts          # WebWorker for encoding
│   │       └── compression.worker.ts    # Background compression
│   └── public/
│       └── wasm/                        # WebAssembly modules
│
├── chrome-extension/          # OPTIONAL: For power users
│   ├── manifest.json          # Manifest V3
│   ├── background/            # Service worker
│   ├── content-scripts/       # Page interaction
│   └── popup/                 # Extension UI
│
├── frontend/                  # Main web application UI
│   ├── src/                   # React components
│   └── public/                # Static assets
│
├── backend/                   # API & processing
│   ├── routes/
│   │   ├── recording.routes.ts    # Upload endpoints
│   │   ├── processing.routes.ts   # Job status
│   │   └── export.routes.ts       # Download/share
│   ├── services/
│   │   ├── transcription/         # Whisper integration
│   │   ├── narration/             # TTS services
│   │   ├── step-detection/        # AI step generator
│   │   └── pii-detection/         # Privacy protection
│   └── workers/
│       ├── video-processor.ts     # FFmpeg processing
│       ├── ai-pipeline.ts         # ML orchestration
│       └── export-generator.ts    # Multi-format export
│
├── shared/                    # Shared types & utilities
│   ├── types/
│   └── utils/
│
├── docs/
│   ├── WEB_RECORDING.md       # Web API implementation guide
│   ├── EXTENSION.md           # Optional extension docs
│   ├── BROWSER_COMPATIBILITY.md
│   ├── API.md                 # API documentation
│   ├── ARCHITECTURE.md        # System architecture
│   └── DEPLOYMENT.md          # Deployment guide
│
└── tests/                     # Test suites
```

## 🎯 Product Roadmap

### Phase 1: MVP (Months 1-3) - Web-First Foundation
- [ ] **Web-based recording** (MediaStream API - no extension required) 🎯 **PRIMARY DIFFERENTIATOR**
- [ ] Screen + webcam + microphone capture
- [ ] Basic transcription with Whisper
- [ ] AI step detection with GPT-4
- [ ] Single voice narration (ElevenLabs)
- [ ] PDF/MP4 export
- [ ] Hosted sharing pages
- [ ] User authentication & basic dashboard

### Phase 2: Differentiation (Months 4-6) - Beat Guidde Features
- [ ] **Optional Chrome extension** for power users (system audio)
- [ ] Voice cloning & emotion controls (100+ voices)
- [ ] Action-based timeline editing (edit without re-recording)
- [ ] Dual video + written SOP output (Markdown/PDF/Word/Confluence)
- [ ] Cross-browser support (Firefox, Safari, Edge)
- [ ] Basic analytics dashboard (views, completion rates)
- [ ] Team collaboration features (shared workspaces)

### Phase 3: Scale (Months 7-12) - Enterprise Ready
- [ ] Multiplayer editing with real-time sync
- [ ] Interactive quizzes/branching scenarios
- [ ] Advanced analytics & heatmaps
- [ ] SCORM/LMS export for training platforms
- [ ] SSO & enterprise security (SAML, OAuth)
- [ ] API for integrations (Slack, Teams, Zendesk, Jira)
- [ ] Mobile recording foundation (iOS/Android web apps)
- [ ] White-label solutions for enterprise

## 💰 Business Model

**Freemium Pricing:**
- Free: 5 videos/month, watermark, basic features
- Pro ($29/mo): Unlimited videos, all AI voices, exports
- Team ($79/creator/mo): Collaboration, analytics, integrations
- Enterprise: Custom pricing, compliance, white-label

**Target Market:**
- SaaS companies (onboarding, support, training)
- L&D departments
- Customer success teams
- IT documentation
- Compliance training

## 🧪 Development

### Running Tests
```bash
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:integration  # Integration tests
```

### Code Quality
```bash
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript
```

## 📊 Key Metrics (North Star)
- Time to First Shareable Guide: <10 minutes
- Weekly Active Users (WAU)
- Free-to-Paid Conversion: Target 10-15%
- Monthly Churn: <5%
- NPS Score: >50
- LTV:CAC Ratio: >3:1

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

Inspired by the need for faster, smarter documentation tools. Built with ❤️ for teams who value clear communication.

## 📞 Support

- Documentation: [docs.yourapp.com](https://docs.yourapp.com)
- Discord Community: [Join here](https://discord.gg/yourapp)
- Email: support@yourapp.com
- Twitter: [@yourapp](https://twitter.com/yourapp)

---

**Made for teams who document workflows, train users, and share knowledge.**
