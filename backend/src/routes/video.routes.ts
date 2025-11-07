import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import { transcribeVideo } from '../services/transcription.service.js';
import { detectSteps } from '../services/step-detection.service.js';
import { generateNarration, getAvailableVoices } from '../services/narration.service.js';
import { exportVideo } from '../services/export.service.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/webm', 'video/mp4', 'video/x-matroska'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed: ${allowedMimes.join(', ')}`));
    }
  },
});

// In-memory storage for demo (use database in production)
interface Video {
  id: string;
  title: string;
  filename: string;
  filepath: string;
  size: number;
  duration: number;
  uploadedAt: string;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  transcription?: {
    text: string;
    language: string;
    segments: any[];
  };
  steps?: any[];
  narrationPath?: string;
  exports?: { [format: string]: string };
}

const videos: Video[] = [];

/**
 * POST /api/videos/upload
 * Upload a new video recording
 */
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const videoId = uuidv4();
    const video: Video = {
      id: videoId,
      title: req.body.title || 'Untitled Recording',
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      duration: parseInt(req.body.duration) || 0,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
    };

    videos.push(video);

    console.log('✅ Video uploaded:', video.id, video.filename);

    // Send immediate response
    res.status(201).json({
      success: true,
      data: {
        id: video.id,
        title: video.title,
        size: video.size,
        duration: video.duration,
        uploadedAt: video.uploadedAt,
        status: video.status,
      },
    });

    // Process video in background
    processVideo(videoId).catch((err) => {
      console.error(`Failed to process video ${videoId}:`, err);
      const vid = videos.find((v) => v.id === videoId);
      if (vid) vid.status = 'failed';
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Background processing function
 */
async function processVideo(videoId: string) {
  const video = videos.find((v) => v.id === videoId);
  if (!video) return;

  console.log(`🔄 Processing video: ${videoId}`);

  try {
    // Step 1: Transcribe the video
    console.log('Step 1/3: Transcribing...');
    const transcription = await transcribeVideo(video.filepath);
    video.transcription = transcription;

    // Step 2: Detect steps
    console.log('Step 2/3: Detecting steps...');
    const steps = await detectSteps(transcription.text, video.duration);
    video.steps = steps;

    // Step 3: Generate narration (optional, can be done on-demand)
    console.log('Step 3/3: Generating narration...');
    const narrationText = generateNarrationScript(video.title, steps);
    const narrationPath = await generateNarration(narrationText);
    video.narrationPath = narrationPath;

    video.status = 'completed';
    console.log(`✅ Video processed successfully: ${videoId}`);
  } catch (error) {
    console.error(`❌ Processing failed for ${videoId}:`, error);
    video.status = 'failed';
  }
}

/**
 * Generate narration script from steps
 */
function generateNarrationScript(title: string, steps: any[]): string {
  let script = `Welcome to this guide on ${title}. `;
  script += `I'll walk you through ${steps.length} simple steps. `;

  steps.forEach((step, index) => {
    script += `Step ${index + 1}: ${step.title}. ${step.description}. `;
  });

  script += `That's it! You've completed the guide. `;
  return script;
}

/**
 * GET /api/videos
 * List all uploaded videos
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: videos.map((v) => ({
      id: v.id,
      title: v.title,
      size: v.size,
      duration: v.duration,
      uploadedAt: v.uploadedAt,
      status: v.status,
      hasTranscription: !!v.transcription,
      hasSteps: !!v.steps,
      hasNarration: !!v.narrationPath,
    })),
    count: videos.length,
  });
});

/**
 * GET /api/videos/:id
 * Get a specific video by ID
 */
router.get('/:id', (req, res) => {
  const video = videos.find((v) => v.id === req.params.id);

  if (!video) {
    return res.status(404).json({ error: 'Video not found' });
  }

  res.json({
    success: true,
    data: {
      id: video.id,
      title: video.title,
      size: video.size,
      duration: video.duration,
      uploadedAt: video.uploadedAt,
      status: video.status,
      transcription: video.transcription,
      steps: video.steps,
      narrationPath: video.narrationPath,
    },
  });
});

/**
 * POST /api/videos/:id/export
 * Export video to various formats
 */
router.post('/:id/export', async (req, res) => {
  try {
    const video = videos.find((v) => v.id === req.params.id);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (!video.transcription || !video.steps) {
      return res.status(400).json({
        error: 'Video not yet processed. Please wait for processing to complete.',
      });
    }

    const format = req.body.format || 'markdown';

    const exportPath = await exportVideo(
      {
        title: video.title,
        transcription: video.transcription.text,
        steps: video.steps,
        duration: video.duration,
      },
      {
        format,
        includeTimestamps: req.body.includeTimestamps !== false,
        includeSteps: req.body.includeSteps !== false,
      }
    );

    if (!video.exports) video.exports = {};
    video.exports[format] = exportPath;

    res.json({
      success: true,
      data: {
        format,
        downloadUrl: `/api/videos/${video.id}/download/${format}`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/videos/:id/download/:format
 * Download exported file
 */
router.get('/:id/download/:format', async (req, res) => {
  try {
    const video = videos.find((v) => v.id === req.params.id);
    if (!video || !video.exports || !video.exports[req.params.format]) {
      return res.status(404).json({ error: 'Export not found' });
    }

    const filePath = video.exports[req.params.format];
    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

/**
 * GET /api/voices
 * Get available AI voices
 */
router.get('/narration/voices', async (req, res) => {
  try {
    const voices = await getAvailableVoices();
    res.json({ success: true, data: voices });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

/**
 * DELETE /api/videos/:id
 * Delete a video
 */
router.delete('/:id', async (req, res) => {
  const videoIndex = videos.findIndex((v) => v.id === req.params.id);

  if (videoIndex === -1) {
    return res.status(404).json({ error: 'Video not found' });
  }

  const video = videos[videoIndex];

  try {
    // Delete file from disk
    await fs.unlink(video.filepath);

    // Delete exports if any
    if (video.exports) {
      for (const exportPath of Object.values(video.exports)) {
        await fs.unlink(exportPath).catch(() => {});
      }
    }

    // Remove from array
    videos.splice(videoIndex, 1);

    console.log('🗑️  Video deleted:', video.id);

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      error: 'Failed to delete video',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as videoRoutes };
