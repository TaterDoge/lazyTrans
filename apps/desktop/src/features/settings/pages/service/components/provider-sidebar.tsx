import { DragDropProvider } from "@dnd-kit/solid";
import { isSortable } from "@dnd-kit/solid/sortable";
import { createMemo, createSignal, For, type JSX, Show } from "solid-js";
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
  config: ServiceConfig<TProvider>;
  emptyContent?: JSX.Element;
  getDefaultProviderConfig: (
    providerId: TProvider
  ) => ProviderConfig<TProvider>;
  getProviderMeta: (providerId: TProvider) => ProviderMeta | undefined;
  onSearchChange?: (value: string) => void;
  searchPlaceholder: string;
  serviceTabs?: JSX.Element;
}

export const ProviderSidebar = <TProvider extends string>(
  props: ProviderSidebarProps<TProvider>
) => {
  const [providerSearch, setProviderSearch] = createSignal("");

  const providerSearchItems = createMemo(() =>
    createProviderSearchItems(props.config.providerOrder, props.getProviderMeta)
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
    props.config.providers.some((provider) => provider.provider === providerId);

  const handleProviderClick = (providerId: TProvider) => {
    props.actions.update({ activeProvider: providerId });
  };

  const handleToggleEnabled = (providerId: TProvider) => {
    if (!isEnabled(providerId)) {
      const providers = [
        ...props.config.providers,
        props.getDefaultProviderConfig(providerId),
      ];
      props.actions.update({
        activeProvider: providerId,
        providers,
      });
      return;
    }

    const providers = props.config.providers.filter(
      (provider) => provider.provider !== providerId
    );
    const nextConfig: Partial<ServiceConfig<TProvider>> = { providers };
    const nextProvider = providers[0]?.provider;

    if (props.config.activeProvider === providerId && nextProvider) {
      nextConfig.activeProvider = nextProvider;
    }

    props.actions.update(nextConfig);
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
        placeholder={props.searchPlaceholder}
        value={providerSearch()}
      />
      <div class="min-h-0 flex-1 space-y-1 overflow-y-auto">
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
    </div>
  );
};
