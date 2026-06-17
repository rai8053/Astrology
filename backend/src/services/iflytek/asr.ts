import WebSocket, { type Data } from 'ws';
import { logger } from '../../lib/logger.js';
import { generateAuthUrl } from './auth.js';
import type { IFlyTekConfig, ASRResponse, IFlyTekMessage } from './types.js';

const ASR_HOST = 'iat-api.xfyun.cn';
const ASR_PATH = '/v2/iat';

function getConfig(): IFlyTekConfig {
  const appId = process.env.XF_APPID;
  const apiKey = process.env.XF_API_KEY;
  const apiSecret = process.env.XF_API_SECRET;
  if (!appId || !apiKey || !apiSecret) {
    throw new Error('iFLYTEK credentials not configured (XF_APPID, XF_API_KEY, XF_API_SECRET)');
  }
  return { appId, apiKey, apiSecret };
}

export async function speechToText(
  audioBase64: string,
  options: { language?: string; rate?: number } = {},
): Promise<ASRResponse> {
  const config = getConfig();
  const lang = options.language || 'en_us';
  const rate = options.rate || 16000;

  const { url } = generateAuthUrl({
    host: ASR_HOST,
    path: ASR_PATH,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret,
  });

  return new Promise((resolve, reject) => {
    let finalText = '';
    let hasError = false;
    const timeout = setTimeout(() => {
      if (!hasError) {
        hasError = true;
        ws.close();
        reject(new Error('iFLYTEK ASR timed out'));
      }
    }, 30000);

    const ws = new WebSocket(url);

    ws.on('open', () => {
      logger.info('iFLYTEK ASR WebSocket connected');

      const common = { app_id: config.appId };
      const business = {
        domain: 'iat',
        language: lang,
        accent: lang,
        vad_eos: 2000,
        dwa: 'wpgs',
        ptt: 1,
      };

      const frame: IFlyTekMessage = {
        common,
        business,
        data: {
          status: 0,
          format: `audio/L16;rate=${rate}`,
          encoding: 'raw',
          audio: audioBase64,
        },
      };

      ws.send(JSON.stringify(frame));
      logger.info({ audioLength: audioBase64.length }, 'iFLYTEK ASR frame sent');

      const endFrame: IFlyTekMessage = {
        common: { app_id: config.appId },
        business: { domain: 'iat', language: lang, accent: lang },
        data: { status: 2 },
      };
      ws.send(JSON.stringify(endFrame));
    });

    ws.on('message', (raw: Data) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.code !== 0) {
          hasError = true;
          clearTimeout(timeout);
          ws.close();
          reject(new Error(`iFLYTEK ASR error ${msg.code}: ${msg.message}`));
          return;
        }

        if (msg.data?.result?.ws) {
          const words = msg.data.result.ws
            .map((w: { cw: { w: string }[] }) => w.cw.map((c: { w: string }) => c.w).join(''))
            .join('');
          finalText += words;
        }

        if (msg.data?.status === 2) {
          clearTimeout(timeout);
          ws.close();
          if (finalText) {
            resolve({ code: 0, message: 'success', text: finalText.trim() });
          } else {
            resolve({ code: 0, message: 'no speech detected', text: '' });
          }
        }
      } catch (err) {
        logger.error({ err }, 'iFLYTEK ASR message parse error');
      }
    });

    ws.on('error', (err: Error) => {
      hasError = true;
      clearTimeout(timeout);
      reject(new Error(`iFLYTEK ASR WebSocket error: ${err.message}`));
    });

    ws.on('close', (code: number, reason: Buffer) => {
      if (!hasError) {
        clearTimeout(timeout);
        if (finalText) {
          resolve({ code: 0, message: 'success', text: finalText.trim() });
        } else {
          resolve({ code: 0, message: 'connection closed', text: '' });
        }
      }
    });
  });
}
