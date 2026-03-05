/**
 * TTS 服务类型定义
 */

export interface TTSConfig {
  apiEndpoint?: string;
  apiKey?: string;
  model?: string;
  provider: string;
  voice?: string;
}

export interface TTSOptions {
  format?: string;
  language: string;
  pitch?: number;
  speed?: number;
  stream?: boolean;
  text: string;
  voice?: string;
}

export interface TTSResult {
  audio: ArrayBuffer | Uint8Array | string;
  finished: boolean;
  format?: string;
}
