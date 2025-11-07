# API Documentation

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.yourapp.com/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Get Authentication Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

## Videos

### Upload Video
Upload a new video for processing.

```http
POST /videos/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <video_file>,
  "title": "My Tutorial Video",
  "description": "A guide on how to...",
  "options": {
    "language": "en",
    "autoDetectSteps": true,
    "generateNarration": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "video_abc123",
    "status": "processing",
    "title": "My Tutorial Video",
    "uploadedAt": "2025-01-15T10:30:00Z",
    "processingEstimate": "5-10 minutes"
  }
}
```

### Get Video Status
Check the processing status of a video.

```http
GET /videos/:videoId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "video_abc123",
    "status": "completed",
    "title": "My Tutorial Video",
    "duration": 180,
    "steps": [
      {
        "id": "step_1",
        "title": "Open the application",
        "timestamp": 0,
        "duration": 15,
        "actions": ["click", "type"],
        "transcript": "First, we'll open the application..."
      }
    ],
    "transcription": {
      "text": "Full transcription...",
      "language": "en",
      "confidence": 0.95
    },
    "urls": {
      "original": "https://cdn.yourapp.com/videos/original/abc123.mp4",
      "processed": "https://cdn.yourapp.com/videos/processed/abc123.mp4"
    }
  }
}
```

### List Videos
Get all videos for the authenticated user.

```http
GET /videos?page=1&limit=20&status=completed
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `status` (optional): Filter by status (processing, completed, failed)
- `sort` (optional): Sort field (created_at, title, duration)
- `order` (optional): Sort order (asc, desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Delete Video
Delete a video and all associated data.

```http
DELETE /videos/:videoId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Video deleted successfully"
}
```

---

## Transcription

### Get Transcription
Retrieve the transcription for a video.

```http
GET /videos/:videoId/transcription
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "video_abc123",
    "text": "Full transcription text...",
    "language": "en",
    "confidence": 0.95,
    "segments": [
      {
        "id": "seg_1",
        "text": "First, we'll open the application",
        "start": 0,
        "end": 3.5,
        "confidence": 0.97
      }
    ]
  }
}
```

### Update Transcription
Manually edit transcription text.

```http
PATCH /videos/:videoId/transcription
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Updated transcription text...",
  "segments": [...]
}
```

---

## Narration

### Generate Narration
Generate AI narration for a video.

```http
POST /videos/:videoId/narration
Authorization: Bearer <token>
Content-Type: application/json

{
  "voiceId": "elevenlabs_rachel",
  "language": "en",
  "speed": 1.0,
  "pitch": 0,
  "emotionPreset": "professional"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "narration_xyz789",
    "status": "generating",
    "estimatedTime": "2-3 minutes"
  }
}
```

### List Available Voices
Get all available AI voices.

```http
GET /narration/voices
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "voices": [
      {
        "id": "elevenlabs_rachel",
        "name": "Rachel",
        "provider": "elevenlabs",
        "language": "en",
        "gender": "female",
        "previewUrl": "https://..."
      }
    ]
  }
}
```

---

## Steps

### Update Steps
Edit the automatically detected steps.

```http
PATCH /videos/:videoId/steps
Authorization: Bearer <token>
Content-Type: application/json

{
  "steps": [
    {
      "id": "step_1",
      "title": "Open application",
      "timestamp": 0,
      "duration": 15,
      "description": "Click the app icon to launch"
    }
  ]
}
```

### Add Step
Add a new step to a video.

```http
POST /videos/:videoId/steps
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New step",
  "timestamp": 45,
  "duration": 10,
  "description": "Step description"
}
```

### Delete Step
Remove a step from a video.

```http
DELETE /videos/:videoId/steps/:stepId
Authorization: Bearer <token>
```

---

## Export

### Export Video
Export a video in various formats.

```http
POST /videos/:videoId/export
Authorization: Bearer <token>
Content-Type: application/json

{
  "format": "pdf",
  "options": {
    "includeScreenshots": true,
    "includeTranscript": true,
    "template": "modern"
  }
}
```

**Supported Formats:**
- `mp4` - Video with narration
- `pdf` - PDF document
- `markdown` - Markdown file
- `docx` - Word document
- `html` - HTML page
- `confluence` - Confluence format
- `scorm` - SCORM package

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "export_123",
    "status": "processing",
    "format": "pdf",
    "downloadUrl": null,
    "estimatedTime": "1-2 minutes"
  }
}
```

### Get Export Status
Check export status.

```http
GET /exports/:exportId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "export_123",
    "status": "completed",
    "format": "pdf",
    "downloadUrl": "https://cdn.yourapp.com/exports/export_123.pdf",
    "expiresAt": "2025-01-16T10:30:00Z"
  }
}
```

---

## Analytics

### Get Video Analytics
Retrieve analytics for a specific video.

```http
GET /videos/:videoId/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "video_abc123",
    "views": 150,
    "uniqueViewers": 120,
    "averageWatchTime": 145,
    "completionRate": 0.75,
    "engagementScore": 8.5,
    "heatmap": [
      { "timestamp": 0, "views": 150 },
      { "timestamp": 10, "views": 145 }
    ]
  }
}
```

---

## Webhooks

### Create Webhook
Set up a webhook for event notifications.

```http
POST /webhooks
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-server.com/webhook",
  "events": ["video.completed", "export.completed"],
  "secret": "your_webhook_secret"
}
```

**Events:**
- `video.uploaded` - Video uploaded
- `video.processing` - Processing started
- `video.completed` - Processing completed
- `video.failed` - Processing failed
- `export.completed` - Export ready
- `narration.completed` - Narration generated

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` - 401: Invalid or missing token
- `FORBIDDEN` - 403: Insufficient permissions
- `NOT_FOUND` - 404: Resource not found
- `VALIDATION_ERROR` - 400: Invalid input
- `RATE_LIMIT_EXCEEDED` - 429: Too many requests
- `INTERNAL_ERROR` - 500: Server error

---

## Rate Limiting

API requests are rate-limited by plan:

- **Free**: 100 requests/hour
- **Pro**: 1,000 requests/hour
- **Team**: 10,000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1642265400
```
