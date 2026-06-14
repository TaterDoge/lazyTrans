import { chat, type StreamChunk, streamToText } from "@tanstack/ai";
import { openaiCompatibleText } from "@tanstack/ai-openai/compatible";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import type { IProvider, ServiceCapability } from "../../core";
import type {
  OpenAIApiMode,
  TranslateConfig,
  TranslateOptions,
  TranslateResult,
} from "../types";

interface OpenAITranslateProviderOptions {
  defaultEndpoint?: string;
  errorLabel: string;
  name: string;
  requiresApiKey?: boolean;
}

interface ModelListResponse {
  data?: Array<{ id?: string }>;
}

const BROWSER_API_KEY_PLACEHOLDER = "not-needed";
const DEFAULT_API_MODE: OpenAIApiMode = "chat-completions";
const TEXT_CONTENT_EVENT = "TEXT_MESSAGE_CONTENT";
const TRAILING_SLASHES_RE = /\/+$/;
const OPENAI_PATH_SUFFIX_RE = /\/(chat\/completions|responses|models)\/?$/i;

function buildSystemPrompt(
  sourceLang: string,
  targetLang: string,
  promptTemplate?: string
): string {
  return (
    promptTemplate ||
    `You are a professional translator. Translate the following text from ${sourceLang === "auto" ? "the detected language" : sourceLang} to ${targetLang}. Only output the translated text, nothing else.`
  );
}

function appendPath(baseEndpoint: string, path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizeOpenAIBaseUrl(baseEndpoint)}${normalizedPath}`;
}

function getTextDelta(chunk: StreamChunk): string {
  return chunk.type === TEXT_CONTENT_EVENT ? (chunk.delta ?? "") : "";
}

function normalizeOpenAIBaseUrl(endpoint: string): string {
  return endpoint
    .trim()
    .replace(TRAILING_SLASHES_RE, "")
    .replace(OPENAI_PATH_SUFFIX_RE, "");
}

function resolveApiMode(config: TranslateConfig): OpenAIApiMode {
  return config.apiMode ?? DEFAULT_API_MODE;
}

function toModelIds(data: ModelListResponse): string[] {
  return (data.data ?? [])
    .map((model) => model.id)
    .filter((model): model is string => Boolean(model));
}

export class OpenAITranslateProvider
  implements IProvider<TranslateConfig, TranslateOptions, TranslateResult>
{
  readonly name: string;
  readonly type = "translate" as const;

  protected readonly defaultEndpoint?: string;
  protected readonly errorLabel: string;
  protected readonly requiresApiKey: boolean;

  constructor(options?: OpenAITranslateProviderOptions) {
    this.name = options?.name ?? "openai";
    this.defaultEndpoint =
      options?.defaultEndpoint ?? "https://api.openai.com/v1";
    this.errorLabel = options?.errorLabel ?? "OpenAI";
    this.requiresApiKey = options?.requiresApiKey ?? true;
  }

  validateConfig(config: TranslateConfig): Promise<boolean> {
    return Promise.resolve(
      this.validateApiAccess(config) && Boolean(config.model)
    );
  }

  async execute(
    config: TranslateConfig,
    options: TranslateOptions
  ): Promise<TranslateResult> {
    return {
      text: await streamToText(this.createTranslateStream(config, options)),
      finished: true,
    };
  }

  async executeStream(
    config: TranslateConfig,
    options: TranslateOptions,
    onChunk: (chunk: TranslateResult) => void
  ): Promise<void> {
    let accumulatedText = "";

    for await (const chunk of this.createTranslateStream(config, options)) {
      const delta = getTextDelta(chunk);
      if (!delta) {
        continue;
      }

      accumulatedText += delta;
      onChunk({ text: accumulatedText, finished: false });
    }

    onChunk({ text: accumulatedText, finished: true });
  }

  async listModels(config: TranslateConfig): Promise<string[]> {
    if (!this.validateApiAccess(config)) {
      throw new Error(`${this.errorLabel} API endpoint or API key is missing`);
    }

    const response = await tauriFetch(this.resolveModelsUrl(config), {
      headers: this.resolveAuthHeaders(config),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `${this.errorLabel} models API error: ${response.status} - ${error}`
      );
    }

    return toModelIds((await response.json()) as ModelListResponse);
  }

  getCapabilities(): ServiceCapability {
    return {
      streaming: true,
      languages: [
        "auto",
        "zh-CN",
        "zh-TW",
        "en",
        "ja",
        "ko",
        "fr",
        "de",
        "es",
        "ru",
      ],
    };
  }

  protected resolveApiEndpoint(config: TranslateConfig): string {
    const endpoint = config.apiEndpoint || this.defaultEndpoint || "";
    return endpoint ? normalizeOpenAIBaseUrl(endpoint) : "";
  }

  protected validateApiAccess(config: TranslateConfig): boolean {
    const requiresApiKey = config.requiresApiKey ?? this.requiresApiKey;
    return Boolean(
      this.resolveApiEndpoint(config) && (!requiresApiKey || config.apiKey)
    );
  }

  private buildModelOptions(config: TranslateConfig): Record<string, unknown> {
    const apiMode = resolveApiMode(config);
    return {
      ...(typeof config.temperature === "number" && {
        temperature: config.temperature,
      }),
      ...(typeof config.maxTokens === "number" &&
        (apiMode === "responses"
          ? { max_output_tokens: config.maxTokens }
          : { max_tokens: config.maxTokens })),
    };
  }

  private createTranslateStream(
    config: TranslateConfig,
    options: TranslateOptions
  ): AsyncIterable<StreamChunk> {
    const { model } = config;
    if (!model) {
      throw new Error(`${this.errorLabel} model is required`);
    }

    const adapter = openaiCompatibleText(model, {
      name: this.name,
      api:
        resolveApiMode(config) === "responses"
          ? "responses"
          : "chat-completions",
      baseURL: this.resolveApiEndpointOrThrow(config),
      apiKey: config.apiKey || BROWSER_API_KEY_PLACEHOLDER,
      dangerouslyAllowBrowser: true,
      fetch: tauriFetch as typeof globalThis.fetch,
    });

    return chat({
      adapter,
      messages: [{ role: "user", content: options.text }],
      modelOptions: this.buildModelOptions(config),
      systemPrompts: [
        buildSystemPrompt(
          options.sourceLang || config.sourceLang,
          options.targetLang || config.targetLang,
          config.promptTemplate
        ),
      ],
    });
  }

  private resolveApiEndpointOrThrow(config: TranslateConfig): string {
    const endpoint = this.resolveApiEndpoint(config);
    if (!endpoint) {
      throw new Error(`${this.errorLabel} API endpoint is required`);
    }
    return endpoint;
  }

  private resolveAuthHeaders(config: TranslateConfig): HeadersInit {
    return config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {};
  }

  private resolveModelsUrl(config: TranslateConfig): string {
    return appendPath(this.resolveApiEndpointOrThrow(config), "/models");
  }
}
