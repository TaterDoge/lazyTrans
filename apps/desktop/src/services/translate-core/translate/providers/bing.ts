/**
 * Bing 翻译 Provider
 * 使用 Edge 浏览器的免费翻译接口
 */

import type { IProvider, ServiceCapability } from "../../core";
import type {
  TranslateConfig,
  TranslateOptions,
  TranslateResult,
} from "../types";

// Bing 翻译语言代码映射
export const BING_LANGUAGES: Record<string, string> = {
  auto: "",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
  yue: "yue",
  en: "en",
  ja: "ja",
  ko: "ko",
  fr: "fr",
  es: "es",
  ru: "ru",
  de: "de",
  it: "it",
  tr: "tr",
  "pt-PT": "pt-pt",
  "pt-BR": "pt",
  vi: "vi",
  id: "id",
  th: "th",
  ms: "ms",
  ar: "ar",
  hi: "hi",
  no: "nb",
  sv: "sv",
  pl: "pl",
  nl: "nl",
  uk: "uk",
  he: "he",
};

export class BingTranslateProvider
  implements IProvider<TranslateConfig, TranslateOptions, TranslateResult>
{
  readonly name = "bing";
  readonly type = "translate" as const;

  // Token 获取 URL
  private readonly tokenUrl = "https://edge.microsoft.com/translate/auth";
  // 翻译 API URL
  private readonly apiUrl =
    "https://api-edge.cognitive.microsofttranslator.com/translate";

  // 模拟 Edge 浏览器的 User-Agent
  private readonly userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.42";

  validateConfig(_config: TranslateConfig): Promise<boolean> {
    // Bing 翻译不需要 API Key
    return Promise.resolve(true);
  }

  async execute(
    _config: TranslateConfig,
    options: TranslateOptions
  ): Promise<TranslateResult> {
    const { text, sourceLang = "auto", targetLang = "zh-CN" } = options;

    // Step 1: 获取 Token
    const token = await this.getToken();

    // Step 2: 调用翻译 API
    const result = await this.translate(token, text, sourceLang, targetLang);

    return result;
  }

  private async getToken(): Promise<string> {
    const response = await fetch(this.tokenUrl, {
      method: "GET",
      headers: {
        "User-Agent": this.userAgent,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get Bing token: ${response.status}`);
    }

    return response.text();
  }

  private async translate(
    token: string,
    text: string,
    from: string,
    to: string
  ): Promise<TranslateResult> {
    const fromLang = BING_LANGUAGES[from] ?? from;
    const toLang = BING_LANGUAGES[to] ?? to;

    const params = new URLSearchParams({
      from: fromLang,
      to: toLang,
      "api-version": "3.0",
      includeSentenceLength: "true",
    });

    const response = await fetch(`${this.apiUrl}?${params.toString()}`, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Accept-Language":
          "zh-TW,zh;q=0.9,ja;q=0.8,zh-CN;q=0.7,en-US;q=0.6,en;q=0.5",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
        "Content-Type": "application/json",
        Pragma: "no-cache",
        "Sec-Ch-Ua":
          '"Microsoft Edge";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        Referer: "https://appsumo.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "User-Agent": this.userAgent,
      },
      body: JSON.stringify([{ Text: text }]),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(
        `Bing Translate API error: ${response.status} - ${error}`
      );
    }

    const result = (await response.json()) as Array<{
      translations: Array<{ text: string }>;
      detectedLanguage?: { language: string };
    }>;

    if (!result[0]?.translations?.[0]?.text) {
      throw new Error(`Invalid Bing response: ${JSON.stringify(result)}`);
    }

    return {
      text: result[0].translations[0].text.trim(),
      detectedLang: result[0].detectedLanguage?.language,
      finished: true,
    };
  }

  getCapabilities(): ServiceCapability {
    return {
      streaming: false,
      languages: Object.keys(BING_LANGUAGES),
    };
  }
}
