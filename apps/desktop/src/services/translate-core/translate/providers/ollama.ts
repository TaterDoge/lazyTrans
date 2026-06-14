import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import type { TranslateConfig } from "../types";
import { OpenAITranslateProvider } from "./openai";

interface OllamaTagsResponse {
  models?: Array<{ name?: string }>;
}

const OLLAMA_TRAILING_SLASHES_RE = /\/+$/;
const OLLAMA_V1_SUFFIX_RE = /\/v1\/?$/;

function trimTrailingSlashes(value: string): string {
  return value.replace(OLLAMA_TRAILING_SLASHES_RE, "");
}

export class OllamaTranslateProvider extends OpenAITranslateProvider {
  constructor() {
    super({
      name: "ollama",
      errorLabel: "Ollama",
      defaultEndpoint: "http://localhost:11434",
      requiresApiKey: false,
    });
  }

  async listModels(config: TranslateConfig): Promise<string[]> {
    const response = await tauriFetch(
      `${this.resolveOllamaEndpoint(config)}/api/tags`
    );

    if (!response.ok) {
      return super.listModels(config);
    }

    const data = (await response.json()) as OllamaTagsResponse;
    return (data.models ?? [])
      .map((model) => model.name)
      .filter((model): model is string => Boolean(model));
  }

  protected resolveApiEndpoint(config: TranslateConfig): string {
    return `${this.resolveOllamaEndpoint(config)}/v1`;
  }

  private resolveOllamaEndpoint(config: TranslateConfig): string {
    const endpoint = super.resolveApiEndpoint(config);
    return trimTrailingSlashes(endpoint).replace(OLLAMA_V1_SUFFIX_RE, "");
  }
}
