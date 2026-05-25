import type { ProviderMeta } from "@/services/translate-core";
import { createDefaultProviderConfig, type ServiceDefinition } from "./types";

export type TTSProvider = "openai" | "edge" | "elevenlabs";

export const TTS_PROVIDERS: Partial<Record<TTSProvider, ProviderMeta>> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    icon: "icon-[simple-icons--openai]",
    description: "OpenAI 语音合成服务",
    requiresApiKey: true,
    defaultEndpoint: "https://api.openai.com/v1",
    supportedModels: ["gpt-4o-mini-tts", "tts-1", "tts-1-hd"],
  },
  edge: {
    id: "edge",
    name: "Edge TTS",
    icon: "icon-[simple-icons--microsoftedge]",
    description: "Microsoft Edge 在线语音合成",
    requiresApiKey: false,
    defaultEndpoint: "",
    supportedModels: ["edge-tts"],
  },
  elevenlabs: {
    id: "elevenlabs",
    name: "ElevenLabs",
    icon: "icon-[simple-icons--elevenlabs]",
    description: "ElevenLabs 高质量语音合成",
    requiresApiKey: true,
    defaultEndpoint: "https://api.elevenlabs.io/v1",
    supportedModels: ["eleven_multilingual_v2", "eleven_turbo_v2_5"],
  },
};

export function getTTSProviderMeta(
  provider: TTSProvider
): ProviderMeta | undefined {
  return TTS_PROVIDERS[provider];
}

export const ttsServiceDefinition: ServiceDefinition<TTSProvider> = {
  service: "tts",
  defaultProvider: "edge",
  providers: TTS_PROVIDERS,
  getProviderMeta: getTTSProviderMeta,
  getDefaultProviderConfig: (provider) =>
    createDefaultProviderConfig(provider, getTTSProviderMeta(provider)),
};
