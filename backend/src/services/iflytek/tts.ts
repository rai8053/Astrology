import WebSocket from 'ws';
import { logger } from '../../lib/logger.js';
import { generateAuthUrl } from './auth.js';
import type { IFlyTekConfig, TTSResponse, IFlyTekMessage } from './types.js';

const TTS_HOST = 'tts-api.xfyun.cn';
const TTS_PATH = '/v2/tts';

function getConfig(): IFlyTekConfig {
  const appId = process.env.XF_APPID;
  const apiKey = process.env.XF_API_KEY;
  const apiSecret = process.env.XF_API_SECRET;
  if (!appId || !apiKey || !apiSecret) {
    throw new Error('iFLYTEK credentials not configured (XF_APPID, XF_API_KEY, XF_API_SECRET)');
  }
  return { appId, apiKey, apiSecret };
}

export async function textToSpeech(
  text: string,
  options: { speed?: number; volume?: number; pitch?: number } = {},
): Promise<TTSResponse> {
  const config = getConfig();
  const speed = options.speed ?? 50;
  const volume = options.volume ?? 50;
  const pitch = options.pitch ?? 50;

  if (!text || text.length > 2000) {
    throw new Error('Text must be 1-2000 characters');
  }

  const { url } = generateAuthUrl({
    host: TTS_HOST,
    path: TTS_PATH,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
  });

  return new Promise((resolve, reject) => {
    const audioChunks: Buffer[] = [];
    let hasError = false;
    const timeout = setTimeout(() => {
      if (!hasError) {
        hasError = true;
        ws.close();
        reject(new Error('iFLYTEK TTS timed out'));
      }
    }, 30000);

    const ws = new WebSocket(url);

    ws.on('open', () => {
      logger.info({ textLength: text.length }, 'iFLYTEK TTS WebSocket connected');

      const business = {
        aue: 'lame',
        sfl: 1,
        auf: 'audio/L16;rate=16000',
        vcn: 'xiaoyan',
        speed,
        volume,
        pitch,
        tte: 'UTF-8',
      };

      const frame: IFlyTekMessage = {
        common: { app_id: config.appId },
        business,
        data: {
          status: 2,
          text: Buffer.from(text).toString('base64'),
          encoding: 'utf-8',
        },
      };

      ws.send(JSON.stringify(frame));
    });

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.code !== 0) {
          hasError = true;
          clearTimeout(timeout);
          ws.close();
          reject(new Error(`iFLYTEK TTS error ${msg.code}: ${msg.message}`));
          return;
        }

        if (msg.data?.audio) {
          audioChunks.push(Buffer.from(msg.data.audio, 'base64'));
        }

        if (msg.data?.status === 2) {
          clearTimeout(timeout);
          ws.close();
          const fullAudio = Buffer.concat(audioChunks);
          resolve({
            code: 0,
            message: 'success',
            audio: fullAudio.toString('base64'),
            audioType: 'audio/mpeg',
          });
        }
      } catch (err) {
        logger.error({ err }, 'iFLYTEK TTS message parse error');
      }
    });

    ws.on('error', (err) => {
      hasError = true;
      clearTimeout(timeout);
      reject(new Error(`iFLYTEK TTS WebSocket error: ${err.message}`));
    });

    ws.on('close', (code, reason) => {
      if (!hasError && audioChunks.length > 0) {
        clearTimeout(timeout);
        const fullAudio = Buffer.concat(audioChunks);
        resolve({
          code: 0,
          message: 'success',
          audio: fullAudio.toString('base64'),
          audioType: 'audio/mpeg',
        });
      }
    });
  });
}
