export interface IFlyTekConfig {
  appId: string;
  apiKey: string;
  apiSecret: string;
}

export interface ASRRequest {
  audio: string;
  format: string;
  rate?: number;
  language?: string;
}

export interface ASRResponse {
  code: number;
  message: string;
  text: string;
}

export interface TTSRequest {
  text: string;
  speed?: number;
  volume?: number;
  pitch?: number;
}

export interface TTSResponse {
  code: number;
  message: string;
  audio: string;
  audioType: string;
}

export interface IFlyTekMessage {
  common?: { app_id: string };
  business: Record<string, unknown>;
  data: {
    status: number;
    format?: string;
    encoding?: string;
    audio?: string;
    text?: string;
  };
}
