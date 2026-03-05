/**
 * OpenAI 翻译 Provider
 */

import type { IProvider, ServiceCapability } from "../../core";
import type {
  TranslateConfig,
  TranslateOptions,
  TranslateResult,
} from "../types";

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

function parseSSELine(
  line: string,
  accumulatedText: string,
  onChunk: (chunk: TranslateResult) => void
): { done: boolean; text: string } {
  if (!line.startsWith("data: ")) {
    return { done: false, text: accumulatedText };
  }

  const data = line.slice(6);
  if (data === "[DONE]") {
    onChunk({ text: accumulatedText, finished: true });
    return { done: true, text: accumulatedText };
  }

  try {
    const parsed = JSON.parse(data) as {
      choices: Array<{ delta: { content?: string } }>;
    };
    const content = parsed.choices[0]?.delta?.content || "";
    const newText = accumulatedText + content;
    onChunk({ text: newText, finished: false });
    return { done: false, text: newText };
  } catch {
    return { done: false, text: accumulatedText };
  }
}

export class OpenAITranslateProvider
  implements IProvider<TranslateConfig, TranslateOptions, TranslateResult>
{
  readonly name = "openai";
  readonly type = "translate" as const;

  validateConfig(config: TranslateConfig): Promise<boolean> {
    return Promise.resolve(!!(config.apiKey && config.apiEndpoint));
  }

  async execute(
    config: TranslateConfig,
    options: TranslateOptions
  ): Promise<TranslateResult> {
    const { text, sourceLang, targetLang } = options;
    const {
      apiKey,
      apiEndpoint,
      model,
      sourceLang: configSourceLang,
      targetLang: configTargetLang,
      promptTemplate,
      temperature,
      maxTokens,
    } = config;

    const finalSourceLang = sourceLang || configSourceLang;
    const finalTargetLang = targetLang || configTargetLang;

    const systemPrompt = buildSystemPrompt(
      finalSourceLang,
      finalTargetLang,
      promptTemplate
    );
    const response = await fetch(`${apiEndpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return {
      text: data.choices[0]?.message?.content || "",
      finished: true,
    };
  }

  async executeStream?(
    config: TranslateConfig,
    options: TranslateOptions,
    onChunk: (chunk: TranslateResult) => void
  ): Promise<void> {
    const { text, sourceLang, targetLang } = options;
    const {
      apiKey,
      apiEndpoint,
      model,
      sourceLang: configSourceLang,
      targetLang: configTargetLang,
      promptTemplate,
      temperature,
      maxTokens,
    } = config;

    const finalSourceLang = sourceLang || configSourceLang;
    const finalTargetLang = targetLang || configTargetLang;

    const systemPrompt = buildSystemPrompt(
      finalSourceLang,
      finalTargetLang,
      promptTemplate
    );
    const response = await fetch(`${apiEndpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body");
    }

    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        const result = parseSSELine(line, accumulatedText, onChunk);
        accumulatedText = result.text;
        if (result.done) {
          return;
        }
      }
    }

    onChunk({ text: accumulatedText, finished: true });
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
      models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    };
  }
}
