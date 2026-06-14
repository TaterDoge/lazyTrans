import { OpenAITranslateProvider } from "./openai";

export class CustomOpenAITranslateProvider extends OpenAITranslateProvider {
  constructor() {
    super({
      name: "openai",
      errorLabel: "Custom OpenAI",
      requiresApiKey: false,
    });
  }
}
