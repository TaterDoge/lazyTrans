import { ocrServiceDefinition } from "@/services/service-config";
import { createProviderServiceStore } from "./provider-list.store";

export const { store: ocrConfig, actions: ocrActions } =
  createProviderServiceStore("ocr", ocrServiceDefinition);
