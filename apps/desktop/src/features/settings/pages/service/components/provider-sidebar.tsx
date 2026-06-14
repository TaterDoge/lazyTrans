import { DragDropProvider } from "@dnd-kit/solid";
import { isSortable } from "@dnd-kit/solid/sortable";
import { createMemo, createSignal, For, type JSX, Show } from "solid-js";
import { useI18n } from "@/i18n";
import type {
  ProviderConfig,
  ServiceConfig,
} from "@/services/service-config/types";
import type { ProviderMeta } from "@/services/translate-core";
import {
  createProviderSearchItems,
  filterProviderSearchItems,
} from "../provider-search";
import { ProviderSearchBox } from "./provider-search-box";
import { SortableProviderItem } from "./sortable-provider-item";

interface ProviderSidebarProps<TProvider extends string> {
  actions: {
    update: (partial: Partial<ServiceConfig<TProvider>>) => unknown;
  };
  canAddCustomProvider?: boolean;
  config: ServiceConfig<TProvider>;
  emptyContent?: JSX.Element;
  getDefaultProviderConfig: (
    providerId: TProvider
  ) => ProviderConfig<TProvider>;
  getProviderMeta: (providerId: TProvider) => ProviderMeta | undefined;
  onAddCustomProvider?: () => void;
  onSearchChange?: (value: string) => void;
  serviceTabs?: JSX.Element;
}

export const ProviderSidebar = <TProvider extends string>(
  props: ProviderSidebarProps<TProvider>
) => {
  const { t } = useI18n();
  const [providerSearch, setProviderSearch] = createSignal("");

  const addCustomProviderLabel = () => t("settings.service.addCustomProvider");
  const searchPlaceholder = () =>
    t("settings.service.providerSearchPlaceholder");

  const getProviderConfig = (providerId: TProvider) =>
    props.config.providers.find((provider) => provider.provider === providerId);

  const getProviderDisplayName = (providerId: TProvider) =>
    getProviderConfig(providerId)?.displayName;

  const providerSearchItems = createMemo(() =>
    createProviderSearchItems(
      props.config.providerOrder,
      props.getProviderMeta,
      getProviderDisplayName
    )
  );

  const filteredProviderOrder = createMemo(() =>
    filterProviderSearchItems(providerSearchItems(), providerSearch())
  );

  const handleSearchChange = (value: string) => {
    setProviderSearch(value);
    props.onSearchChange?.(value);
  };

  const getProviderIndex = (providerId: TProvider) =>
    props.config.providerOrder.indexOf(providerId);

  const isEnabled = (providerId: TProvider) =>
    props.config.providers.some(
      (provider) =>
        provider.provider === providerId && provider.enabled !== false
    );

  const handleProviderClick = (providerId: TProvider) => {
    props.actions.update({ activeProvider: providerId });
  };

  const handleToggleEnabled = (providerId: TProvider) => {
    const existing = props.config.providers.find(
      (provider) => provider.provider === providerId
    );

    if (existing) {
      // Toggle the enabled field
      const providers = props.config.providers.map((provider) =>
        provider.provider === providerId
          ? { ...provider, enabled: !isEnabled(providerId) }
          : provider
      );
      const nextConfig: Partial<ServiceConfig<TProvider>> = { providers };

      // If disabling the active provider, switch to the first enabled one
      if (isEnabled(providerId) && props.config.activeProvider === providerId) {
        const nextActive = providers.find(
          (p) => p.enabled !== false && p.provider !== providerId
        );
        if (nextActive) {
          nextConfig.activeProvider = nextActive.provider;
        }
      }

      // If enabling a provider, make it the active one
      if (!isEnabled(providerId)) {
        nextConfig.activeProvider = providerId;
      }

      props.actions.update(nextConfig);
    } else {
      // Provider not in config yet — add it with enabled: true
      const providers = [
        ...props.config.providers,
        { ...props.getDefaultProviderConfig(providerId), enabled: true },
      ];
      props.actions.update({
        activeProvider: providerId,
        providers,
      });
    }
  };

  const handleProviderDragEnd = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }

    const providerOrder = [...props.config.providerOrder];
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= providerOrder.length ||
      toIndex >= providerOrder.length
    ) {
      return;
    }

    const [moved] = providerOrder.splice(fromIndex, 1);
    if (!moved) {
      return;
    }
    providerOrder.splice(toIndex, 0, moved);

    props.actions.update({ providerOrder });
  };

  return (
    <div class="flex min-h-0 w-52 shrink-0 flex-col gap-1 border-r p-1">
      {props.serviceTabs}
      <ProviderSearchBox
        onSearchChange={handleSearchChange}
        placeholder={searchPlaceholder()}
        value={providerSearch()}
      />
      <div class="relative min-h-0 flex-1">
        <div
          class="h-full space-y-1 overflow-y-auto pt-1"
          classList={{ "pb-16": props.canAddCustomProvider }}
        >
          <Show
            fallback={props.emptyContent}
            when={filteredProviderOrder().length > 0}
          >
            <DragDropProvider
              onDragEnd={(event) => {
                if (event.canceled) {
                  return;
                }

                const { source } = event.operation;
                if (!isSortable(source)) {
                  return;
                }

                handleProviderDragEnd(source.initialIndex, source.index);
              }}
            >
              <For each={filteredProviderOrder()}>
                {(providerId) => (
                  <SortableProviderItem
                    displayName={getProviderDisplayName(providerId)}
                    getProviderMeta={props.getProviderMeta}
                    index={getProviderIndex(providerId)}
                    isEnabled={isEnabled(providerId)}
                    isSelected={props.config.activeProvider === providerId}
                    onProviderClick={handleProviderClick}
                    onToggleEnabled={handleToggleEnabled}
                    providerId={providerId}
                  />
                )}
              </For>
            </DragDropProvider>
          </Show>
        </div>
        <Show when={props.canAddCustomProvider}>
          <div class="absolute inset-x-0 bottom-0 z-10 bg-background">
            <button
              aria-label={addCustomProviderLabel()}
              class="flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-muted/70 text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
              onClick={props.onAddCustomProvider}
              title={addCustomProviderLabel()}
              type="button"
            >
              <span class="icon-[tabler--plus] size-6" />
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
};
