# Browser Compatibility Guide

## Overview

Our web-based recording platform works across all modern browsers without requiring any extensions. This document outlines feature support, fallbacks, and browser-specific implementation details.

---

## Core API Support

### getDisplayMedia (Screen Capture)

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 72+ | ✅ Full | Best support, system audio available |
| **Edge** | 79+ | ✅ Full | Chromium-based, same as Chrome |
| **Firefox** | 66+ | ✅ Good | No system audio capture |
| **Safari** | 13+ | ✅ Limited | Requires user interaction, limited options |
| **Opera** | 60+ | ✅ Full | Chromium-based |
| **Brave** | 1.20+ | ✅ Full | Chromium-based |

### MediaRecorder (Video Encoding)

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 47+ | ✅ Full | VP9, VP8, H.264 |
| **Edge** | 79+ | ✅ Full | VP9, VP8, H.264 |
| **Firefox** | 25+ | ✅ Good | VP9, VP8 |
| **Safari** | 14.1+ | ⚠️ Partial | H.264 only, limited options |
| **Opera** | 36+ | ✅ Full | VP9, VP8, H.264 |
| **Brave** | 1.20+ | ✅ Full | VP9, VP8, H.264 |

### getUserMedia (Webcam/Mic)

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 53+ | ✅ Full | - |
| **Edge** | 79+ | ✅ Full | - |
| **Firefox** | 36+ | ✅ Full | - |
| **Safari** | 11+ | ✅ Full | Requires HTTPS |
| **Opera** | 40+ | ✅ Full | - |
| **Brave** | 1.20+ | ✅ Full | - |

---

## Advanced Features

### System Audio Capture

Ability to capture audio from other applications/tabs.

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 94+ | ✅ Yes | Requires explicit user permission |
| **Edge** | 94+ | ✅ Yes | Requires explicit user permission |
| **Firefox** | - | ❌ No | Not supported yet |
| **Safari** | - | ❌ No | Not supported |
| **Opera** | 80+ | ✅ Yes | Chromium-based |
| **Brave** | 1.30+ | ✅ Yes | Chromium-based |

**Fallback Strategy:**
```typescript
const captureAudio = async () => {
  try {
    // Try system audio first
    const stream = await navigator.mediaDevices.getDisplayMedia({
      audio: true
    });

    if (stream.getAudioTracks().length > 0) {
      return { stream, source: 'system' };
    }
  } catch (error) {
    console.log('System audio not available, falling back to microphone');
  }

  // Fallback to microphone
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return { stream: micStream, source: 'microphone' };
};
```

### Video Codecs

| Codec | Chrome | Edge | Firefox | Safari | Notes |
|-------|--------|------|---------|--------|-------|
| **VP9** | ✅ | ✅ | ✅ | ❌ | Best quality/compression |
| **VP8** | ✅ | ✅ | ✅ | ⚠️ | Good fallback |
| **H.264** | ✅ | ✅ | ✅ | ✅ | Safari requires this |
| **AV1** | ⚠️ | ⚠️ | ⚠️ | ❌ | Future-ready |

**Auto-detection:**
```typescript
const getSupportedMimeType = (): string => {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/mp4;codecs=h264,aac' // Safari
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'video/webm'; // Default fallback
};
```

### WebAssembly (WASM)

For client-side video processing.

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 57+ | ✅ Full | - |
| **Edge** | 16+ | ✅ Full | - |
| **Firefox** | 52+ | ✅ Full | - |
| **Safari** | 11+ | ✅ Full | - |
| **Opera** | 44+ | ✅ Full | - |

### WebRTC

For real-time streaming.

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| **Chrome** | 56+ | ✅ Full | - |
| **Edge** | 79+ | ✅ Full | - |
| **Firefox** | 44+ | ✅ Full | - |
| **Safari** | 11+ | ✅ Full | Requires HTTPS |
| **Opera** | 43+ | ✅ Full | - |

---

## Mobile Support

### iOS Safari

| Feature | Version | Support | Notes |
|---------|---------|---------|-------|
| **getDisplayMedia** | - | ❌ No | iOS doesn't support screen capture in browsers |
| **getUserMedia** | 11+ | ✅ Yes | Camera/mic only |
| **MediaRecorder** | 14.3+ | ✅ Yes | Limited codec support |

**Mobile Strategy:**
- Phase 1: Desktop only (web app)
- Phase 2: iOS/Android native apps for mobile screen recording
- Phase 3: Web-based mobile recording when browser support improves

### Android Chrome

| Feature | Version | Support | Notes |
|---------|---------|---------|-------|
| **getDisplayMedia** | - | ❌ No | Not supported in mobile browsers yet |
| **getUserMedia** | 53+ | ✅ Yes | Camera/mic only |
| **MediaRecorder** | 47+ | ✅ Yes | Works well |

---

## Feature Detection

Always check for feature support before using APIs:

```typescript
const checkBrowserSupport = () => {
  const support = {
    screenCapture: false,
    mediaRecorder: false,
    systemAudio: false,
    webrtc: false,
    webassembly: false
  };

  // Check getDisplayMedia
  if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
    support.screenCapture = true;
  }

  // Check MediaRecorder
  if (window.MediaRecorder) {
    support.mediaRecorder = true;
  }

  // Check system audio (Chrome 94+)
  if (navigator.userAgent.includes('Chrome/')) {
    const version = parseInt(navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || '0');
    support.systemAudio = version >= 94;
  }

  // Check WebRTC
  if (window.RTCPeerConnection) {
    support.webrtc = true;
  }

  // Check WebAssembly
  if (typeof WebAssembly === 'object') {
    support.webassembly = true;
  }

  return support;
};
```

---

## Browser-Specific Quirks

### Chrome/Edge

**Advantages:**
- Full system audio support (94+)
- Best codec support (VP9, VP8, H.264)
- Excellent performance
- All features work reliably

**Quirks:**
- May show "Screen recording in progress" notification
- Corporate networks may block screen capture APIs

### Firefox

**Advantages:**
- Good privacy controls
- Solid MediaRecorder implementation
- Fast performance

**Quirks:**
- No system audio capture yet
- User must explicitly allow audio in getDisplayMedia popup
- VP9 encoding may be slower than Chrome

### Safari

**Advantages:**
- Growing adoption of web standards
- Good privacy model

**Quirks:**
- Only supports H.264 codec
- Requires user interaction to start recording (can't auto-start)
- MediaRecorder support added in Safari 14.1 (2021)
- More restrictive permission model
- May have lower bitrate limits

**Safari-Specific Code:**
```typescript
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

const getRecorderOptions = () => {
  if (isSafari) {
    return {
      mimeType: 'video/mp4', // Safari requires mp4
      videoBitsPerSecond: 2000000 // Lower bitrate for Safari
    };
  }

  return {
    mimeType: 'video/webm;codecs=vp9,opus',
    videoBitsPerSecond: 2500000
  };
};
```

### Brave

**Advantages:**
- Chromium-based, same support as Chrome
- Strong privacy defaults

**Quirks:**
- May block third-party cookies by default
- May require additional permission prompts for privacy

---

## Progressive Enhancement UI

Show users appropriate UI based on their browser capabilities:

```typescript
const RecordingButton = () => {
  const [support, setSupport] = useState(checkBrowserSupport());

  if (!support.screenCapture) {
    return (
      <div>
        <p>❌ Your browser doesn't support screen recording</p>
        <p>Please use Chrome 72+, Firefox 66+, Safari 13+, or Edge 79+</p>
      </div>
    );
  }

  if (!support.systemAudio) {
    return (
      <div>
        <button onClick={startRecording}>Start Recording</button>
        <p>⚠️ System audio not available. Microphone will be used instead.</p>
        <p>For system audio, use Chrome/Edge 94+ or install our extension.</p>
      </div>
    );
  }

  return <button onClick={startRecording}>Start Recording</button>;
};
```

---

## Testing Matrix

### Minimum Testing Requirements

| Browser | Version | Test Scenarios |
|---------|---------|----------------|
| Chrome | Latest, Latest-1 | Full feature set |
| Firefox | Latest, Latest-1 | No system audio |
| Safari | Latest, Latest-1 | H.264 codec, limited features |
| Edge | Latest | Full feature set |

### Test Scenarios

1. **Basic Recording**
   - Start/stop recording
   - Screen selection
   - Download/upload video

2. **Audio Capture**
   - System audio (Chrome/Edge)
   - Microphone fallback (Firefox/Safari)
   - No audio option

3. **Webcam Overlay**
   - Picture-in-picture
   - Webcam-only mode
   - No webcam option

4. **Edge Cases**
   - User cancels screen selection
   - User stops via browser UI
   - Network interruption during upload
   - Tab/window closed during recording

---

## Browser Recommendations

### For Best Experience
**Recommended:** Chrome 94+ or Edge 94+
- Full feature support
- System audio capture
- Best codec support
- Optimal performance

### Fully Supported
**Firefox 66+, Safari 13+**
- Core features work
- Microphone audio instead of system
- Good user experience

### Not Recommended
- Internet Explorer (not supported)
- Opera Mini (no MediaRecorder)
- UC Browser (limited support)
- Mobile browsers (no screen capture)

---

## Future Browser Support

### In Development

**Firefox System Audio**
- Tracking: [Mozilla Bug 1541425](https://bugzilla.mozilla.org/show_bug.cgi?id=1541425)
- Expected: TBD

**Safari Improvements**
- Better codec support
- System audio capture
- Expected: Safari 17+

**Mobile Screen Capture**
- iOS: Not planned
- Android: Under discussion
- Expected: 2025+

---

## Polyfills & Fallbacks

### No Polyfill Needed

The MediaStream APIs cannot be polyfilled. Either the browser supports them or it doesn't.

### Graceful Degradation

```typescript
if (!navigator.mediaDevices?.getDisplayMedia) {
  // Show upgrade message
  showUnsupportedBrowserMessage();
  return;
}

// Proceed with recording
```

### Extension as Fallback

For unsupported browsers, offer the Chrome extension:

```typescript
const isUnsupportedBrowser = !navigator.mediaDevices?.getDisplayMedia;

if (isUnsupportedBrowser) {
  return (
    <div>
      <p>Web recording not supported in your browser</p>
      <a href="/extension">Install our Chrome Extension instead</a>
    </div>
  );
}
```

---

## Resources

- [MDN: MediaDevices.getDisplayMedia()](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- [MDN: MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Can I Use: getDisplayMedia](https://caniuse.com/mdn-api_mediadevices_getdisplaymedia)
- [Chrome Platform Status](https://chromestatus.com/)
- [WebKit Feature Status](https://webkit.org/status/)

---

## Summary

✅ **Chrome/Edge 94+**: Full support, best experience
✅ **Firefox 66+**: Full support except system audio
✅ **Safari 13+**: Works with limitations (H.264 only)
⚠️ **Mobile**: Camera/mic only, no screen capture
❌ **IE/Old Browsers**: Not supported

**Target Coverage:** ~95% of desktop users (as of 2025)
