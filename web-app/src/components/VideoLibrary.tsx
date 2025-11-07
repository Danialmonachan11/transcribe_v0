import { useState, useEffect } from 'react';

interface Video {
  id: string;
  title: string;
  duration: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  hasTranscription: boolean;
  hasSteps: boolean;
  hasNarration: boolean;
}

interface VideoDetails {
  id: string;
  title: string;
  status: string;
  transcription?: {
    text: string;
    language: string;
  };
  steps?: Array<{
    title: string;
    description: string;
    timestamp: number;
  }>;
}

export const VideoLibrary = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch videos on mount
  useEffect(() => {
    fetchVideos();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos');
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    }
  };

  const fetchVideoDetails = async (videoId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();
      if (data.success) {
        setSelectedVideo(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch video details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (videoId: string) => {
    setExportLoading(true);
    try {
      const response = await fetch(`/api/videos/${videoId}/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: exportFormat }),
      });

      const data = await response.json();

      if (data.success) {
        // Download the file
        window.location.href = data.data.downloadUrl;
        alert(`Export successful! Downloading ${exportFormat} file...`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📹 Video Library
          </h1>
          <p className="text-gray-600">
            View and manage your screen recordings with AI-powered transcription
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video List */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Videos ({videos.length})
            </h2>

            {videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No videos yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Upload your first recording to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => fetchVideoDetails(video.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition hover:shadow-md ${
                      selectedVideo?.id === video.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {video.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDuration(video.duration)} •{' '}
                          {new Date(video.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          video.status
                        )}`}
                      >
                        {video.status}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-3">
                      {video.hasTranscription && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          📝 Transcribed
                        </span>
                      )}
                      {video.hasSteps && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          📋 Steps
                        </span>
                      )}
                      {video.hasNarration && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          🎙️ Narrated
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Video Details */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Video Details
            </h2>

            {!selectedVideo ? (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Select a video to view details
                </p>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading...</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {/* Status */}
                <div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      selectedVideo.status
                    )}`}
                  >
                    {selectedVideo.status.toUpperCase()}
                  </span>
                </div>

                {/* Processing Status */}
                {selectedVideo.status === 'processing' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <div>
                        <p className="font-medium text-blue-900">
                          Processing your video...
                        </p>
                        <p className="text-sm text-blue-700">
                          AI transcription and step detection in progress
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Steps */}
                {selectedVideo.steps && selectedVideo.steps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📋 Steps ({selectedVideo.steps.length})
                    </h3>
                    <div className="space-y-3">
                      {selectedVideo.steps.map((step, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {step.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {step.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                ⏱️ {formatDuration(step.timestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Transcription */}
                {selectedVideo.transcription && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📝 Transcription
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedVideo.transcription.text}
                      </p>
                      <p className="text-xs text-gray-500 mt-3">
                        Language: {selectedVideo.transcription.language}
                      </p>
                    </div>
                  </div>
                )}

                {/* Export Options */}
                {selectedVideo.status === 'completed' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      📤 Export
                    </h3>
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Format:
                      </label>
                      <select
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                      >
                        <option value="markdown">Markdown (.md)</option>
                        <option value="html">HTML (.html)</option>
                        <option value="txt">Plain Text (.txt)</option>
                        <option value="pdf">PDF (.pdf)</option>
                      </select>
                      <button
                        onClick={() => handleExport(selectedVideo.id)}
                        disabled={exportLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition hover:scale-105 disabled:hover:scale-100"
                      >
                        {exportLoading ? '⏳ Exporting...' : '📥 Download Export'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
