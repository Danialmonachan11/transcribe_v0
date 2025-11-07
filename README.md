# Video Transcription & Documentation Platform

> Transform screen recordings into beautiful, AI-narrated documentation in minutes

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

## 🎯 Vision

The fastest, most intelligent way to create video documentation and written SOPs from screen recordings—no editing skills required. We're building the next generation of documentation tools for SaaS teams, training departments, and knowledge management.

## ✨ Key Features

### Core Functionality
- **One-Click Recording**: Browser extension for instant screen/webcam/mic capture
- **AI Step Detection**: Automatically splits recordings into logical steps with titles and callouts
- **Dual Output**: Generates both narrated video AND editable written documentation simultaneously
- **Action-Based Editing**: Edit steps without re-recording—timeline replays your clicks
- **Studio-Grade AI Voices**: 100+ languages with voice cloning and emotion controls
- **Smart Transcription**: Converts screen actions into clear, readable instructions

### Differentiation (vs. Guidde)
- ⚡ Superior voice quality with ElevenLabs/Azure Neural TTS integration
- 🎬 Evergreen editing—add/delete steps without re-shooting
- 📝 Automatic SOP generation (Markdown/PDF/Word/Confluence)
- 👥 Multiplayer editing with approval workflows
- 📊 Advanced analytics: heatmaps, completion rates, engagement tracking
- 🎮 Interactive elements: quizzes, branching, in-app walkthroughs
- 🔒 Auto-PII detection and GDPR/HIPAA compliance
- 🔗 Native integrations: Slack, Notion, Zendesk, Jira, LMS (SCORM)

## 🏗️ Architecture

### Tech Stack
**Frontend:**
- React 18 + TypeScript
- TailwindCSS for styling
- Zustand for state management
- Chrome Extension (Manifest V3)

**Backend:**
- Node.js + Express / FastAPI (Python)
- PostgreSQL for data persistence
- Redis for caching and job queues
- AWS S3/CloudFront for video storage and delivery

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
[Chrome Extension] → [Upload API] → [Processing Queue]
                                           ↓
                    [Video Processor] → [Transcription Service]
                                           ↓
                    [AI Step Generator] → [Narration Engine]
                                           ↓
                    [Export Engine] → [CDN] → [Hosted Guides]
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- API Keys: OpenAI, ElevenLabs/Azure, Replicate

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/video-transcription-docs-platform.git
cd video-transcription-docs-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Start development servers
docker-compose up -d
npm run dev

# Load Chrome extension
# 1. Open chrome://extensions/
# 2. Enable Developer Mode
# 3. Click "Load unpacked"
# 4. Select ./chrome-extension/dist folder
```

## 📂 Project Structure
```
/
├── chrome-extension/       # Browser extension for recording
├── frontend/              # React web application
├── backend/               # API server
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── workers/          # Background jobs
│   └── models/           # Database schemas
├── ai-services/          # AI/ML microservices
│   ├── transcription/    # Whisper integration
│   ├── narration/        # TTS services
│   ├── step-detection/   # AI step generator
│   └── pii-detection/    # Privacy protection
├── docs/                 # Documentation
└── tests/                # Test suites
```

## 🎯 Product Roadmap

### Phase 1: MVP (Months 1-3)
- [x] Chrome extension capture
- [x] Basic transcription with Whisper
- [x] AI step detection
- [x] Single voice narration
- [ ] PDF/MP4 export
- [ ] Hosted sharing pages
- [ ] User authentication

### Phase 2: Differentiation (Months 4-6)
- [ ] Voice cloning & emotion controls
- [ ] Action-based timeline editing
- [ ] Dual video + written SOP output
- [ ] Markdown/Confluence export
- [ ] Basic analytics dashboard
- [ ] Team collaboration features

### Phase 3: Scale (Months 7-12)
- [ ] Multiplayer editing
- [ ] Interactive quizzes/branching
- [ ] Advanced analytics & heatmaps
- [ ] SCORM/LMS export
- [ ] SSO & enterprise security
- [ ] Mobile capture (iOS/Android)
- [ ] API for integrations

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
