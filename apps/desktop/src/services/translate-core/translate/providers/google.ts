/**
 * Google 翻译 Provider
 * 基于 Google Translate 非官方 API 实现
 */

import { fetch } from "@tauri-apps/plugin-http";
import type { IProvider, ServiceCapability } from "../../core";
import type {
  TranslateConfig,
  TranslateOptions,
  TranslateResult,
} from "../types";

// Google 翻译语言代码映射
export const GOOGLE_LANGUAGES: Record<string, string> = {
  auto: "auto",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ja: "ja",
  en: "en",
  ko: "ko",
  fr: "fr",
  es: "es",
  ru: "ru",
  de: "de",
  it: "it",
  tr: "tr",
  "pt-PT": "pt",
  "pt-BR": "pt",
  vi: "vi",
  id: "id",
  th: "th",
  ms: "ms",
  ar: "ar",
  hi: "hi",
  no: "no",
  sv: "sv",
  pl: "pl",
  nl: "nl",
  uk: "uk",
  he: "he",
};

type GoogleSentence = [string | null, string | null, ...unknown[]];

type GoogleResultData = [Array<GoogleSentence | null>, unknown, string?];

interface GoogleProxyResult {
  code?: number;
  msg?: string;
  text?: string;
}

interface GoogleClientsResult {
  sentences: Array<{ trans?: string }>;
  src?: string;
}

export class GoogleTranslateProvider
  implements IProvider<TranslateConfig, TranslateOptions, TranslateResult>
{
  readonly name = "google";
  readonly type = "translate" as const;

  // 默认使用无需 token 的 Google Translate API 域名。
  private readonly defaultUrl = "https://translate.googleapis.com";
  private readonly legacyDefaultUrl = "https://translate.google.com";

  validateConfig(_config: TranslateConfig): Promise<boolean> {
    // Google 翻译不需要 API Key，只需要有效的端点
    return Promise.resolve(true);
  }

  async execute(
    config: TranslateConfig,
    options: TranslateOptions
  ): Promise<TranslateResult> {
    const { text, sourceLang = "auto", targetLang = "zh-CN" } = options;

    // 旧版本持久化的默认端点会继续走这里，避免用户需要手动重置设置。
    const baseUrl = this.resolveBaseUrl(config.apiEndpoint);
    const url = this.buildUrl(baseUrl, sourceLang, targetLang, text);

    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Google Translate API error: ${response.status} - ${error}`
      );
    }

    const result = await response.json();
    return this.parseResult(result);
  }

  private buildUrl(
    baseUrl: string,
    from: string,
    to: string,
    text: string
  ): string {
    // 确保 URL 有协议
    let url = baseUrl;
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }

    // 构建 query 参数
    const params = new URLSearchParams({
      client: "gtx",
      sl: GOOGLE_LANGUAGES[from] || from,
      tl: GOOGLE_LANGUAGES[to] || to,
      dt: "t",
      q: text,
    });

    return `${url}/translate_a/single?${params.toString()}`;
  }

  private resolveBaseUrl(apiEndpoint: string | undefined): string {
    const endpoint = apiEndpoint?.trim();
    if (!endpoint) {
      return this.defaultUrl;
    }

    const normalizedEndpoint = endpoint.endsWith("/")
      ? endpoint.slice(0, -1)
      : endpoint;

    return normalizedEndpoint === this.legacyDefaultUrl
      ? this.defaultUrl
      : endpoint;
  }

  private parseResult(result: unknown): TranslateResult {
    if (this.isProxyResult(result)) {
      if (result.code !== undefined && result.code !== 0) {
        throw new Error(
          `Google Translate proxy error: ${result.msg || "unknown"}`
        );
      }

      if (typeof result.text === "string") {
        return {
          text: result.text.trim(),
          finished: true,
        };
      }
    }

    if (this.isClientsResult(result)) {
      return {
        text: result.sentences
          .map((sentence) => sentence.trans || "")
          .join("")
          .trim(),
        detectedLang: result.src,
        finished: true,
      };
    }

    if (!Array.isArray(result)) {
      throw new Error("Google Translate API returned an invalid response");
    }

    const data = result as GoogleResultData;

    if (!Array.isArray(data[0])) {
      throw new Error(
        "Google Translate API returned an invalid translation list"
      );
    }

    let target = "";
    for (const r of data[0]) {
      if (r?.[0]) {
        target += r[0];
      }
    }

    return {
      text: target.trim(),
      detectedLang: data[2],
      finished: true,
    };
  }

  private isProxyResult(result: unknown): result is GoogleProxyResult {
    return typeof result === "object" && result !== null && "text" in result;
  }

  private isClientsResult(result: unknown): result is GoogleClientsResult {
    return (
      typeof result === "object" &&
      result !== null &&
      "sentences" in result &&
      Array.isArray((result as GoogleClientsResult).sentences)
    );
  }

  getCapabilities(): ServiceCapability {
    return {
      streaming: false,
      languages: Object.keys(GOOGLE_LANGUAGES),
    };
  }
}
