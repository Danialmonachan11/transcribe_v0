# Web App - Zero-Install Screen Recorder

**PRIMARY RECORDING ENGINE** - No extension required!

## Overview
This is the main web-based recording application that uses browser-native APIs to capture screen recordings without requiring any installation.

## Key Technologies
- **MediaStream API** (`getDisplayMedia`) - Screen capture
- **MediaRecorder API** - Video encoding
- **WebRTC** - Real-time streaming
- **WebAssembly** - Client-side compression
- **WebWorkers** - Background processing

## Features
- ✅ Zero installation required
- ✅ Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Screen + webcam + microphone capture
- ✅ System audio capture (Chrome/Edge 94+)
- ✅ Real-time compression
- ✅ Chunked upload for large files
- ✅ Action tracking for evergreen editing

## Development

```bash
cd web-app
npm install
npm run dev
```

Open http://localhost:3001

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| getDisplayMedia | ✅ 72+ | ✅ 66+ | ✅ 13+ | ✅ 79+ |
| MediaRecorder | ✅ 47+ | ✅ 25+ | ✅ 14.1+ | ✅ 79+ |
| System Audio | ✅ 94+ | ❌ | ❌ | ✅ 94+ |
| VP9 codec | ✅ | ✅ | ❌ (H.264) | ✅ |

## Usage Example

```typescript
import { useScreenRecorder } from './hooks/useScreenRecorder';

function RecordingPage() {
  const { startRecording, stopRecording, isRecording } = useScreenRecorder();

  return (
    <div>
      <button onClick={startRecording}>
        {isRecording ? 'Recording...' : 'Start Recording'}
      </button>
      {isRecording && (
        <button onClick={stopRecording}>Stop</button>
      )}
    </div>
  );
}
```

## Architecture

```
User clicks "Start Recording"
          ↓
getDisplayMedia() requests screen access
          ↓
MediaRecorder captures stream
          ↓
WebAssembly compresses chunks in background
          ↓
Chunked upload to S3 via API
          ↓
Backend processing queue
```

See [docs/WEB_RECORDING.md](../docs/WEB_RECORDING.md) for detailed implementation guide.
