import { Router, Request, Response } from 'express';
import { speechToText } from '../services/iflytek/asr.js';
import { textToSpeech } from '../services/iflytek/tts.js';
import { logger } from '../lib/logger.js';

const router = Router();

router.post('/asr', async (req: Request, res: Response) => {
  try {
    const { audio, format, language } = req.body;

    if (!audio) {
      res.status(400).json({ success: false, error: 'audio is required' });
      return;
    }

    if (Buffer.byteLength(audio, 'base64') > 10 * 1024 * 1024) {
      res.status(400).json({ success: false, error: 'audio too large (max 10MB)' });
      return;
    }

    const result = await speechToText(audio, { language: language || 'en_us' });
    res.json({ success: true, data: { text: result.text } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err: msg }, 'ASR route error');
    res.status(500).json({ success: false, error: msg });
  }
});

router.post('/tts', async (req: Request, res: Response) => {
  try {
    const { text, speed, volume, pitch } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ success: false, error: 'text is required' });
      return;
    }

    if (text.length > 2000) {
      res.status(400).json({ success: false, error: 'text too long (max 2000 chars)' });
      return;
    }

    const result = await textToSpeech(text, { speed, volume, pitch });
    res.json({
      success: true,
      data: { audio: result.audio, audioType: result.audioType },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ err: msg }, 'TTS route error');
    res.status(500).json({ success: false, error: msg });
  }
});

router.get('/config', (_req: Request, res: Response) => {
  const hasCredentials = !!(process.env.XF_APPID && process.env.XF_API_KEY && process.env.XF_API_SECRET);
  res.json({ success: true, data: { available: hasCredentials } });
});

export const voiceRouter = router;
