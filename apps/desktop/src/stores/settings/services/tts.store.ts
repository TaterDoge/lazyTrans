import { ttsServiceDefinition } from "@/services/service-config";
import { createProviderServiceStore } from "./provider-list.store";

export const { store: ttsConfig, actions: ttsActions } =
  createProviderServiceStore("tts", ttsServiceDefinition);
