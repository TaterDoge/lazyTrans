/**
 * TTS 服务入口
 */

import type { IProvider } from "../core";
import {
  executeService,
  executeServiceStream,
  registerServiceProvider,
} from "../core";
import type { TTSConfig, TTSOptions, TTSResult } from "./types";

export * from "./types";

export function registerTTSProvider(
  name: string,
  provider: new () => IProvider<TTSConfig, TTSOptions, TTSResult>
): void {
  registerServiceProvider("tts", name, provider);
}

export function speak(
  config: TTSConfig,
  options: TTSOptions
): Promise<TTSResult> {
  return executeService<TTSConfig, TTSOptions, TTSResult>(
    "tts",
    config,
    options
  );
}

export function speakStream(
  config: TTSConfig,
  options: TTSOptions,
  onChunk: (result: TTSResult) => void
): Promise<void> {
  return executeServiceStream<TTSConfig, TTSOptions, TTSResult>(
    "tts",
    config,
    options,
    onChunk
  );
}
