import type { JSX, VoidComponent } from "solid-js";
import { ttsServiceDefinition } from "@/services/service-config";
import { ttsActions, ttsConfig } from "@/stores/settings/services";
import { ServiceProviderSettings } from "./components/service-provider-settings";

interface TTSSettingsProps {
  serviceTabs?: JSX.Element;
}

export const TTSSettings: VoidComponent<TTSSettingsProps> = (props) => (
  <ServiceProviderSettings
    actions={ttsActions}
    config={ttsConfig}
    definition={ttsServiceDefinition}
    serviceTabs={props.serviceTabs}
  />
);
