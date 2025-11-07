import { useScreenRecorder } from '../hooks/useScreenRecorder';
import { useState } from 'react';

const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const RecordingControls = () => {
  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    isRecording,
    isPaused,
    recordingTime,
    error,
    videoBlob,
  } = useScreenRecorder();

  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleDownload = () => {
    if (!videoBlob) return;

    const url = URL.createObjectURL(videoBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `recording-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleUpload = async () => {
    if (!videoBlob) return;

    setUploadStatus('Uploading...');

    try {
      const formData = new FormData();
      formData.append('video', videoBlob, `recording-${Date.now()}.webm`);
      formData.append('title', 'My Screen Recording');
      formData.append('duration', recordingTime.toString());

      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadStatus(`Upload successful! Video ID: ${data.id}`);
      console.log('Upload response:', data);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎬 Screen Docs
          </h1>
          <p className="text-gray-600">
            Zero-install screen recording - No extension required!
          </p>
        </div>

        {/* Browser Check */}
        {!navigator.mediaDevices?.getDisplayMedia && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">
              ❌ Your browser doesn't support screen recording
            </p>
            <p className="text-red-600 text-sm mt-1">
              Please use Chrome 72+, Firefox 66+, Safari 13+, or Edge 79+
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Recording Status */}
        {isRecording && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="ml-3 text-gray-700 font-medium">
                    {isPaused ? 'Paused' : 'Recording'}
                  </span>
                </div>
              </div>
              <div className="text-2xl font-mono font-bold text-gray-900">
                {formatTime(recordingTime)}
              </div>
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="space-y-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={!navigator.mediaDevices?.getDisplayMedia}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transform transition hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              🎥 Start Recording
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={isPaused ? resumeRecording : pauseRecording}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105"
              >
                {isPaused ? '▶️ Resume' : '⏸️ Pause'}
              </button>
              <button
                onClick={stopRecording}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105"
              >
                ⏹️ Stop
              </button>
            </div>
          )}
        </div>

        {/* Video Preview & Actions */}
        {videoBlob && !isRecording && (
          <div className="mt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-gray-700 font-medium mb-2">
                ✅ Recording Complete!
              </p>
              <p className="text-sm text-gray-600">
                Size: {(videoBlob.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleDownload}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105"
              >
                💾 Download
              </button>
              <button
                onClick={handleUpload}
                className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transform transition hover:scale-105"
              >
                ☁️ Upload
              </button>
            </div>

            {uploadStatus && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 text-sm">{uploadStatus}</p>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            ✨ Features:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✅ Zero installation - works directly in browser</li>
            <li>✅ Screen + audio capture</li>
            <li>✅ Cross-browser support (Chrome, Firefox, Safari, Edge)</li>
            <li>✅ Download or upload your recordings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
