# 🚀 Quick Start Guide

Get Screen Docs running on your local machine in 5 minutes!

## Prerequisites

- **Node.js 18+** (check with `node --version`)
- **npm** (comes with Node.js)

Optional for full functionality:
- PostgreSQL 14+ (for database features)
- Redis (for job queues)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/screen-docs-web-recorder.git
cd screen-docs-web-recorder
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, web-app, and backend)
npm run install:all
```

Or install manually:

```bash
# Install root dependencies
npm install

# Install web-app dependencies
cd web-app
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables (Optional)

```bash
# Backend environment
cd backend
cp .env.example .env
# Edit .env if needed (default values work for local development)
cd ..
```

### 4. Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend (web-app)**: http://localhost:3001
- **Backend API**: http://localhost:3000

## 🎥 Start Recording!

1. Open your browser and navigate to http://localhost:3001
2. Click **"Start Recording"**
3. Select which screen/window to share
4. Click **Start Sharing** in the browser popup
5. Record your screen!
6. Click **Stop** when done
7. **Download** your recording or **Upload** to the server

## 📂 Project Structure

```
screen-docs-web-recorder/
├── web-app/                 # React frontend (port 3001)
│   ├── src/
│   │   ├── components/     # Recording UI
│   │   ├── hooks/          # useScreenRecorder hook
│   │   └── App.tsx
│   └── package.json
│
├── backend/                 # Express API (port 3000)
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   └── index.ts
│   └── package.json
│
└── package.json            # Root scripts
```

## 🛠️ Available Scripts

### Development

```bash
# Run both frontend and backend
npm run dev

# Run frontend only
npm run dev:web-app

# Run backend only
npm run dev:backend
```

### Build for Production

```bash
# Build both projects
npm run build

# Build frontend only
npm run build:web-app

# Build backend only
npm run build:backend
```

## 🌐 API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Upload Video
```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -F "video=@recording.webm" \
  -F "title=My Recording"
```

### List Videos
```bash
curl http://localhost:3000/api/videos
```

## 🧪 Testing the Web Recorder

1. **Open the app**: http://localhost:3001
2. **Click "Start Recording"**
3. **Browser will prompt**: "localhost wants to share your screen"
4. **Select** a screen/window/tab to share
5. **Record** for a few seconds
6. **Click "Stop"**
7. **Download** or **Upload** your recording

## 📊 Uploaded Videos

Uploaded videos are stored in:
```
backend/uploads/
```

View uploaded videos via API:
```bash
curl http://localhost:3000/api/videos
```

## 🔧 Troubleshooting

### Port Already in Use

If port 3001 or 3000 is already in use:

```bash
# Change web-app port in web-app/vite.config.ts
server: {
  port: 3002,  // Change this
}

# Change backend port in backend/.env
PORT=3001  # Change this
```

### Browser Doesn't Support Screen Recording

Make sure you're using:
- Chrome 72+
- Firefox 66+
- Safari 13+
- Edge 79+

### HTTPS Required Error (Deployment)

Screen recording requires HTTPS in production. For local development, `localhost` works without HTTPS.

### Upload Fails

Check that:
1. Backend is running (http://localhost:3000/health should return OK)
2. File size is under 500MB
3. Check browser console and backend logs for errors

## 🎯 What's Working

✅ **Web-based screen recording** (no extension required!)
✅ **Screen + audio capture**
✅ **Start/stop/pause controls**
✅ **Download recordings locally**
✅ **Upload to backend server**
✅ **List uploaded videos via API**

## 🚧 Coming Next

- [ ] AI transcription with Whisper
- [ ] Step detection with GPT-4
- [ ] Voice narration with ElevenLabs
- [ ] PDF/Word export
- [ ] User authentication
- [ ] Database integration
- [ ] Real-time processing status

## 📚 Learn More

- [Web Recording API Documentation](./docs/WEB_RECORDING.md)
- [Browser Compatibility Guide](./docs/BROWSER_COMPATIBILITY.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)

## 💡 Key Features

- **Zero Installation**: Works directly in browser
- **Cross-Browser**: Chrome, Firefox, Safari, Edge
- **No Extension Required**: Unlike Guidde
- **Download or Upload**: Your choice
- **Simple API**: Easy to integrate

## 🆘 Need Help?

1. Check the logs in your terminal
2. Check browser console (F12)
3. Review documentation in `/docs`
4. Open an issue on GitHub

---

**You're all set!** Start recording at http://localhost:3001 🎬
