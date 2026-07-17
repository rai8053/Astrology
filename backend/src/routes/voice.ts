import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { speechToText } from '../services/iflytek/asr.js';
import { textToSpeech } from '../services/iflytek/tts.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';

const router = Router();

const asrSchema = z.object({
  audio: z.string().min(1, 'audio is required'),
  format: z.string().optional(),
  language: z.string().optional(),
});

const ttsSchema = z.object({
  text: z.string().min(1, 'text is required').max(2000, 'text too long (max 2000 chars)'),
  speed: z.number().optional(),
  volume: z.number().optional(),
  pitch: z.number().optional(),
});

router.post('/asr', authenticate, validate(asrSchema), asyncHandler(async (req: Request, res: Response) => {
  const { audio, language } = req.body as z.infer<typeof asrSchema>;

  if (Buffer.byteLength(audio, 'base64') > 10 * 1024 * 1024) {
    res.status(400).json({ success: false, error: 'audio too large (max 10MB)' });
    return;
  }

  const result = await speechToText(audio, { language: language || 'en_us' });
  res.json({ success: true, data: { text: result.text } });
}));

router.post('/tts', authenticate, validate(ttsSchema), asyncHandler(async (req, res) => {
  const { text, speed, volume, pitch } = req.body as z.infer<typeof ttsSchema>;
  const result = await textToSpeech(text, { speed, volume, pitch });
  res.json({
    success: true,
    data: { audio: result.audio, audioType: result.audioType },
  });
}));

router.get('/config', authenticate, (_req: Request, res: Response) => {
  const hasCredentials = !!(process.env.XF_APPID && process.env.XF_API_KEY && process.env.XF_API_SECRET);
  res.json({ success: true, data: { available: hasCredentials } });
});

export const voiceRouter = router;
