import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');

    // Create uploads directory if it doesn't exist
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
const videos: Array<{
  id: string;
  title: string;
  filename: string;
  filepath: string;
  size: number;
  duration: number;
  uploadedAt: string;
  status: string;
}> = [];

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
    const video = {
      id: videoId,
      title: req.body.title || 'Untitled Recording',
      filename: req.file.filename,
      filepath: req.file.path,
      size: req.file.size,
      duration: parseInt(req.body.duration) || 0,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
    };

    videos.push(video);

    console.log('✅ Video uploaded:', video.id, video.filename);

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
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

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
    return res.status(404).json({
      error: 'Video not found',
    });
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
    },
  });
});

/**
 * DELETE /api/videos/:id
 * Delete a video
 */
router.delete('/:id', async (req, res) => {
  const videoIndex = videos.findIndex((v) => v.id === req.params.id);

  if (videoIndex === -1) {
    return res.status(404).json({
      error: 'Video not found',
    });
  }

  const video = videos[videoIndex];

  try {
    // Delete file from disk
    await fs.unlink(video.filepath);

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
