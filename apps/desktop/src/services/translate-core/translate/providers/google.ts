/**
 * Google 翻译 Provider
 * 基于 Google Translate 非官方 API 实现
 */

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

// Google 翻译词典结果类型（解析词典模式返回值时使用）
// 目前仅使用翻译模式，词典模式可用于未来扩展

type GoogleResultData = [
  Array<[string | null, string | null, string | null, string | null] | null>,
  [string, string, [string, string][]][] | null,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  unknown,
  [[string, number, number, number][]][] | null,
];

export class GoogleTranslateProvider
  implements IProvider<TranslateConfig, TranslateOptions, TranslateResult>
{
  readonly name = "google";
  readonly type = "translate" as const;

  // 默认 URL
  private readonly defaultUrl = "https://translate.google.com";

  validateConfig(_config: TranslateConfig): Promise<boolean> {
    // Google 翻译不需要 API Key，只需要有效的端点
    return Promise.resolve(true);
  }

  async execute(
    config: TranslateConfig,
    options: TranslateOptions
  ): Promise<TranslateResult> {
    const { text, sourceLang = "auto", targetLang = "zh-CN" } = options;

    // 获取自定义 URL 或使用默认
    const baseUrl = config.apiEndpoint || this.defaultUrl;
    const url = this.buildUrl(baseUrl, sourceLang, targetLang, text);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
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
      hl: GOOGLE_LANGUAGES[to] || to,
      ie: "UTF-8",
      oe: "UTF-8",
      otf: "1",
      ssel: "0",
      tsel: "0",
      kc: "7",
      q: text,
    });

    // dt 参数控制返回的数据类型
    const dtParams =
      "dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t";

    return `${url}/translate_a/single?${dtParams}&${params.toString()}`;
  }

  private parseResult(result: unknown): TranslateResult {
    const data = result as GoogleResultData;

    // 词典模式 (当 result[1] 存在时，表示查询单词)
    if (data[1]) {
      // 返回翻译文本
      let translatedText = "";
      if (data[0]) {
        for (const r of data[0]) {
          if (r?.[0]) {
            translatedText += r[0];
          }
        }
      }
      return {
        text: translatedText.trim(),
        finished: true,
      };
    }

    // 翻译模式
    let target = "";
    if (data[0]) {
      for (const r of data[0]) {
        if (r?.[0]) {
          target += r[0];
        }
      }
    }

    return {
      text: target.trim(),
      finished: true,
    };
  }

  getCapabilities(): ServiceCapability {
    return {
      streaming: false,
      languages: Object.keys(GOOGLE_LANGUAGES),
    };
  }
}
