import type { JSX } from "solid-js";
import { toast } from "solid-sonner";
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
  const isProviderEnabled = () => currentProviderConfig()?.enabled !== false;

  const canCreateCustomProvider = () =>
    typeof props.definition.createCustomProviderId === "function";

  const updateProviderConfig = async (
    updates: Partial<ProviderConfig<TProvider>>
  ) => {
    const providers = props.config.providers.map((provider) =>
      provider.provider === selectedProvider()
        ? { ...provider, ...updates }
        : provider
    );

    await props.actions.update({ providers });
  };

  const addCustomProviderConfig = () => {
    const providerId = props.definition.createCustomProviderId?.();
    if (!providerId) {
      return;
    }

    const providers = [
      ...props.config.providers,
      {
        ...props.definition.getDefaultProviderConfig(providerId),
        enabled: true,
      },
    ];
    const providerOrder = [...props.config.providerOrder, providerId];

    props.actions.update({
      activeProvider: providerId,
      providers,
      providerOrder,
    });

    toast.success(t("global.operationSuccess"));
  };

  const deleteProviderConfig = () => {
    const deletingProvider = selectedProvider();
    const providers = props.config.providers.filter(
      (provider) => provider.provider !== deletingProvider
    );

    // Switch active provider to the first remaining one, or keep current if none left
    const nextActive =
      providers[0]?.provider ?? props.definition.defaultProvider;
    // Remove from provider order too
    const providerOrder = props.config.providerOrder.filter(
      (id) => id !== deletingProvider
    );

    props.actions.update({
      providers,
      activeProvider: nextActive,
      providerOrder,
    });
  };

  return (
    <div class="flex h-full min-h-0 overflow-hidden">
      <ProviderSidebar
        actions={props.actions}
        canAddCustomProvider={canCreateCustomProvider()}
        config={props.config}
        getDefaultProviderConfig={props.definition.getDefaultProviderConfig}
        getProviderMeta={props.definition.getProviderMeta}
        onAddCustomProvider={addCustomProviderConfig}
        serviceTabs={props.serviceTabs}
      />
      <ProviderConfigPanel
        deleteProviderConfig={deleteProviderConfig}
        isCustomProvider={
          props.definition.isCustomProvider?.(selectedProvider()) ?? false
        }
        isEnabled={isProviderEnabled()}
        meta={providerMeta()}
        providerConfig={currentProviderConfig()}
        updateProviderConfig={updateProviderConfig}
      />
    </div>
  );
};
