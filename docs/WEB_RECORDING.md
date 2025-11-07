# Web-Based Recording Implementation

## Overview
We use modern browser APIs to enable zero-install screen recording. No extensions required.

This is our **#1 competitive advantage** over Guidde and similar tools that require Chrome extension installation.

---

## Core APIs

### 1. Screen Capture (getDisplayMedia)

The `getDisplayMedia` API allows web apps to capture screen content without requiring browser extensions.

```typescript
const captureScreen = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: 'always',           // Show cursor in recording
        displaySurface: 'monitor',  // Options: 'monitor', 'window', 'browser'
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 30 }
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    });

    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.error('User denied screen sharing permission');
    } else if (error.name === 'NotFoundError') {
      console.error('No screen sharing source available');
    }
    throw error;
  }
};
```

**Browser Support:**
- Chrome 72+
- Firefox 66+
- Safari 13+
- Edge 79+

---

### 2. Webcam + Mic Capture (getUserMedia)

For picture-in-picture webcam overlay and audio narration.

```typescript
const captureWebcam = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: 'user'
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });

    return stream;
  } catch (error) {
    console.error('Webcam access failed:', error);
    throw error;
  }
};
```

---

### 3. Stream Merging (Screen + Webcam + Audio)

Combine multiple media streams into one recordable stream.

```typescript
const mergeStreams = async () => {
  const screenStream = await captureScreen();
  const webcamStream = await captureWebcam();

  // Get all audio tracks from both sources
  const audioTracks = [
    ...screenStream.getAudioTracks(),
    ...webcamStream.getAudioTracks()
  ];

  // Merge video tracks (webcam overlay handled via canvas - see below)
  const videoTracks = screenStream.getVideoTracks();

  // Create merged stream
  const mergedStream = new MediaStream([
    ...videoTracks,
    ...audioTracks
  ]);

  return { mergedStream, screenStream, webcamStream };
};
```

**Advanced: Picture-in-Picture with Canvas**

For webcam overlay on screen recording:

```typescript
const createPictureInPicture = (
  screenStream: MediaStream,
  webcamStream: MediaStream
): MediaStream => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = 1920;
  canvas.height = 1080;

  const screenVideo = document.createElement('video');
  const webcamVideo = document.createElement('video');

  screenVideo.srcObject = screenStream;
  webcamVideo.srcObject = webcamStream;

  screenVideo.play();
  webcamVideo.play();

  // Render loop
  const render = () => {
    // Draw screen capture (full canvas)
    ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

    // Draw webcam overlay (bottom-right corner)
    const webcamWidth = 320;
    const webcamHeight = 240;
    const padding = 20;

    ctx.drawImage(
      webcamVideo,
      canvas.width - webcamWidth - padding,
      canvas.height - webcamHeight - padding,
      webcamWidth,
      webcamHeight
    );

    requestAnimationFrame(render);
  };

  render();

  // Return canvas stream
  return canvas.captureStream(30); // 30 FPS
};
```

---

### 4. Recording with MediaRecorder

Encode and save the captured stream.

```typescript
class ScreenRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording() {
    this.stream = await mergeStreams();

    // Check supported mime types
    const mimeType = this.getSupportedMimeType();

    this.recorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: 2500000 // 2.5 Mbps
    });

    // Handle data chunks
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
        // Optional: Upload chunk immediately for large recordings
        this.uploadChunk(event.data);
      }
    };

    // Handle stop event
    this.recorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: mimeType });
      this.processRecording(blob);
    };

    // Start recording with 1-second chunks
    this.recorder.start(1000);
  }

  stopRecording() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }

    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  pauseRecording() {
    if (this.recorder && this.recorder.state === 'recording') {
      this.recorder.pause();
    }
  }

  resumeRecording() {
    if (this.recorder && this.recorder.state === 'paused') {
      this.recorder.resume();
    }
  }

  private getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
      'video/mp4' // Safari
    ];

    return types.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
  }

  private async uploadChunk(chunk: Blob) {
    // Upload to S3 or your backend
    const formData = new FormData();
    formData.append('chunk', chunk);

    await fetch('/api/upload-chunk', {
      method: 'POST',
      body: formData
    });
  }

  private async processRecording(blob: Blob) {
    // Upload final video
    const formData = new FormData();
    formData.append('video', blob, 'recording.webm');

    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('Upload complete:', data);
  }
}
```

---

## React Hook Implementation

```typescript
// hooks/useScreenRecorder.ts
import { useState, useRef, useCallback } from 'react';

interface UseScreenRecorderOptions {
  onRecordingComplete?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}

export const useScreenRecorder = (options: UseScreenRecorderOptions = {}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always', width: 1920, height: 1080 },
        audio: true
      });

      streamRef.current = stream;

      // Detect when user stops sharing via browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      // Create recorder
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        options.onRecordingComplete?.(blob);
        chunksRef.current = [];
      };

      recorderRef.current = recorder;
      recorder.start(1000); // 1-second chunks

      setIsRecording(true);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      options.onError?.(error as Error);
    }
  }, [options]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }

    // Stop all tracks
    streamRef.current?.getTracks().forEach(track => track.stop());

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
  }, []);

  const pauseRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.pause();
      setIsPaused(true);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (recorderRef.current?.state === 'paused') {
      recorderRef.current.resume();
      setIsPaused(false);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused,
    recordingTime
  };
};

const getSupportedMimeType = (): string => {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ];

  return types.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
};
```

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge | Notes |
|---------|--------|---------|--------|------|-------|
| **getDisplayMedia** | ✅ 72+ | ✅ 66+ | ✅ 13+ | ✅ 79+ | Core screen capture |
| **MediaRecorder** | ✅ 47+ | ✅ 25+ | ✅ 14.1+ | ✅ 79+ | Video encoding |
| **System Audio** | ✅ 94+ | ❌ | ❌ | ✅ 94+ | Screen audio capture |
| **VP9 codec** | ✅ | ✅ | ❌ | ✅ | Use H.264 for Safari |
| **getUserMedia** | ✅ 53+ | ✅ 36+ | ✅ 11+ | ✅ 79+ | Webcam/mic |
| **Canvas.captureStream** | ✅ 51+ | ✅ 43+ | ✅ 11+ | ✅ 79+ | For PiP overlay |

---

## Progressive Enhancement Strategy

### Level 1: Core Experience (All Browsers)
- Screen capture
- Microphone audio
- Basic recording controls

### Level 2: Enhanced (Chrome/Edge 94+)
- + System audio capture
- + Higher quality encoding options

### Level 3: Pro (Optional Extension)
- + Background recording
- + Global shortcuts
- + Advanced capture settings

---

## Advantages Over Extension-Only Approach

✅ **Instant Access**: No installation friction
✅ **Higher Trust**: Users trust web apps more than extensions
✅ **Cross-Platform**: Works on ChromeOS, Linux, Windows, Mac
✅ **Cross-Browser**: Firefox, Safari support
✅ **Mobile-Ready**: Foundation for future mobile support
✅ **Lower CAC**: Higher conversion without install step
✅ **SEO-Friendly**: Web app is indexable, extensions aren't
✅ **Easier Updates**: No extension store approval delays

---

## Common Issues & Solutions

### Issue: "NotAllowedError" when calling getDisplayMedia()

**Cause**: User denied permission or API called without user gesture.

**Solution**:
```typescript
// Must be called in response to user action (click, tap)
button.addEventListener('click', async () => {
  await startRecording(); // ✅ Works
});

// DON'T call on page load
window.addEventListener('load', async () => {
  await startRecording(); // ❌ Fails
});
```

### Issue: No system audio in Firefox/Safari

**Cause**: Only Chrome/Edge 94+ support system audio capture.

**Solution**: Use microphone audio as fallback, or prompt users to install optional extension.

```typescript
const captureWithFallback = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true // Try system audio
    });

    if (stream.getAudioTracks().length === 0) {
      // No system audio, add microphone
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.addTrack(micStream.getAudioTracks()[0]);
    }

    return stream;
  } catch (error) {
    console.error('Capture failed:', error);
  }
};
```

### Issue: Large file sizes

**Solution**: Use chunked upload and server-side compression.

```typescript
recorder.ondataavailable = async (event) => {
  if (event.data.size > 0) {
    // Upload each chunk immediately
    await uploadChunk(event.data);
  }
};

// Server processes and compresses chunks
```

---

## Performance Optimization

### 1. Use WebWorkers for Processing

Offload video processing to background threads:

```typescript
// video.worker.ts
self.addEventListener('message', async (event) => {
  const { chunk } = event.data;

  // Compress chunk
  const compressed = await compressChunk(chunk);

  self.postMessage({ compressed });
});
```

### 2. Limit Frame Rate for Performance

```typescript
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    frameRate: { ideal: 30, max: 60 } // Limit to 30 FPS
  }
});
```

### 3. Use Adaptive Bitrate

Adjust quality based on network conditions:

```typescript
const recorder = new MediaRecorder(stream, {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: navigator.connection?.downlink > 5
    ? 2500000  // High quality for fast connection
    : 1000000  // Lower quality for slow connection
});
```

---

## Security Considerations

1. **HTTPS Required**: `getDisplayMedia` only works on HTTPS
2. **User Gesture Required**: Must be triggered by user action
3. **Permission Indicators**: Browser shows recording indicator
4. **No Silent Recording**: User always knows when recording
5. **Automatic Stop**: User can stop via browser UI anytime

---

## Testing

```typescript
describe('ScreenRecorder', () => {
  it('should request screen capture permission', async () => {
    const mockStream = new MediaStream();
    global.navigator.mediaDevices.getDisplayMedia = jest.fn()
      .mockResolvedValue(mockStream);

    const recorder = new ScreenRecorder();
    await recorder.startRecording();

    expect(navigator.mediaDevices.getDisplayMedia).toHaveBeenCalled();
  });

  it('should handle permission denial gracefully', async () => {
    global.navigator.mediaDevices.getDisplayMedia = jest.fn()
      .mockRejectedValue(new Error('NotAllowedError'));

    const recorder = new ScreenRecorder();

    await expect(recorder.startRecording()).rejects.toThrow();
  });
});
```

---

## Next Steps

1. Implement the `useScreenRecorder` hook
2. Build UI components for recording controls
3. Add chunked upload to backend
4. Implement video processing pipeline
5. Add browser compatibility warnings
6. Build optional extension for power users

See also:
- [BROWSER_COMPATIBILITY.md](./BROWSER_COMPATIBILITY.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
