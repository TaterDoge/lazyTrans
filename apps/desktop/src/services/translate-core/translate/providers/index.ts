import { registerServiceProvider, serviceRegistry } from "../../core";
import { BingTranslateProvider } from "./bing";
import { GoogleTranslateProvider } from "./google";
import { OpenAITranslateProvider } from "./openai";

export { BingTranslateProvider } from "./bing";
export { GoogleTranslateProvider } from "./google";
export { OpenAITranslateProvider } from "./openai";

const BUILTIN_TRANSLATE_PROVIDERS = {
  openai: OpenAITranslateProvider,
  google: GoogleTranslateProvider,
  bing: BingTranslateProvider,
} as const;

let builtinProvidersRegistered = false;

export function registerBuiltinTranslateProviders(): void {
  if (builtinProvidersRegistered) {
    return;
  }

  for (const [name, provider] of Object.entries(BUILTIN_TRANSLATE_PROVIDERS)) {
    if (!serviceRegistry.has("translate", name)) {
      registerServiceProvider("translate", name, provider);
    }
  }

  builtinProvidersRegistered = true;
}
