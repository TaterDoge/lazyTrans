import type { JSX, VoidComponent } from "solid-js";
import { ocrServiceDefinition } from "@/services/service-config";
import { ocrActions, ocrConfig } from "@/stores/settings/services";
import { ServiceProviderSettings } from "./components/service-provider-settings";

interface OCRSettingsProps {
  serviceTabs?: JSX.Element;
}

export const OCRSettings: VoidComponent<OCRSettingsProps> = (props) => (
  <ServiceProviderSettings
    actions={ocrActions}
    config={ocrConfig}
    definition={ocrServiceDefinition}
    serviceTabs={props.serviceTabs}
  />
);
