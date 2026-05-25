import type { JSX } from "solid-js";
import { useI18n } from "@/i18n";
import type {
  ProviderConfig,
  ServiceConfig,
  ServiceDefinition,
} from "@/services/service-config/types";
import { ProviderConfigPanel } from "./provider-config-panel";
import { ProviderSidebar } from "./provider-sidebar";

interface ServiceProviderSettingsProps<
  TProvider extends string,
  TConfig extends ServiceConfig<TProvider>,
> {
  actions: {
    update: (partial: Partial<ServiceConfig<TProvider>>) => unknown;
  };
  config: TConfig;
  definition: ServiceDefinition<TProvider>;
  serviceTabs?: JSX.Element;
}

export const ServiceProviderSettings = <
  TProvider extends string,
  TConfig extends ServiceConfig<TProvider>,
>(
  props: ServiceProviderSettingsProps<TProvider, TConfig>
) => {
  const { t } = useI18n();

  const selectedProvider = () => props.config.activeProvider;
  const providerMeta = () =>
    props.definition.getProviderMeta(selectedProvider());
  const currentProviderConfig = (): ProviderConfig<TProvider> | undefined =>
    props.config.providers.find(
      (provider) => provider.provider === selectedProvider()
    );

  const updateProviderConfig = (
    updates: Partial<ProviderConfig<TProvider>>
  ) => {
    const providers = props.config.providers.map((provider) =>
      provider.provider === selectedProvider()
        ? { ...provider, ...updates }
        : provider
    );

    props.actions.update({ providers });
  };

  return (
    <div class="flex h-full min-h-0 overflow-hidden">
      <ProviderSidebar
        actions={props.actions}
        config={props.config}
        getDefaultProviderConfig={props.definition.getDefaultProviderConfig}
        getProviderMeta={props.definition.getProviderMeta}
        searchPlaceholder={t("settings.service.providerSearchPlaceholder")}
        serviceTabs={props.serviceTabs}
      />
      <ProviderConfigPanel
        labels={{
          apiConfig: t("settings.service.providerConfig.apiConfig"),
          apiKey: t("settings.service.providerConfig.apiKey"),
          apiEndpoint: t("settings.service.providerConfig.apiEndpoint"),
          model: t("settings.service.providerConfig.model"),
          advancedConfig: t("settings.service.providerConfig.advancedConfig"),
          promptTemplate: t("settings.service.providerConfig.promptTemplate"),
          promptTemplatePlaceholder: t(
            "settings.service.providerConfig.promptTemplatePlaceholder"
          ),
          promptTemplateDesc: t(
            "settings.service.providerConfig.promptTemplateDesc"
          ),
          temperature: t("settings.service.providerConfig.temperature"),
          temperatureDesc: t("settings.service.providerConfig.temperatureDesc"),
        }}
        meta={providerMeta()}
        providerConfig={currentProviderConfig()}
        updateProviderConfig={updateProviderConfig}
      />
    </div>
  );
};
