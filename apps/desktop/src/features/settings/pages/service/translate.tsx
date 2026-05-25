import type { JSX, VoidComponent } from "solid-js";
import { translateServiceDefinition } from "@/services/service-config";
import { translateActions, translateConfig } from "@/stores/settings/services";
import { ServiceProviderSettings } from "./components/service-provider-settings";

interface TranslateSettingsProps {
  serviceTabs?: JSX.Element;
}

export const TranslateSettings: VoidComponent<TranslateSettingsProps> = (
  props
) => (
  <ServiceProviderSettings
    actions={translateActions}
    config={translateConfig}
    definition={translateServiceDefinition}
    serviceTabs={props.serviceTabs}
  />
);
