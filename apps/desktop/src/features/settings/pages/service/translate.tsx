import { DragDropProvider } from "@dnd-kit/solid";
import { isSortable, useSortable } from "@dnd-kit/solid/sortable";
import { createSignal, For, Show, type VoidComponent } from "solid-js";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import {
  getDefaultProviderConfig,
  getProviderMeta,
  TRANSLATE_PROVIDERS,
} from "@/services/translate/config";
import type {
  ProviderConfig,
  TranslateProvider,
} from "@/services/translate/types";
import { translateActions, translateConfig } from "@/stores/settings/services";
import { cn } from "@/utils";

interface SortableProviderItemProps {
  index: number;
  isEnabled: boolean;
  isSelected: boolean;
  onProviderClick: (providerId: TranslateProvider) => void;
  onToggleEnabled: (providerId: TranslateProvider) => void;
  providerId: TranslateProvider;
}

const SortableProviderItem: VoidComponent<SortableProviderItemProps> = (
  props
) => {
  const meta = () => TRANSLATE_PROVIDERS[props.providerId];
  const { ref, handleRef, isDragging } = useSortable({
    get id() {
      return props.providerId;
    },
    get index() {
      return props.index;
    },
  });

  return (
    <div
      class={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-md p-2 text-left transition-colors",
        props.isSelected && "bg-accent text-accent-foreground",
        !props.isSelected && "hover:bg-muted",
        isDragging() && "opacity-70"
      )}
      ref={ref}
    >
      <button
        aria-label="Reorder provider"
        class="inline-flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted active:cursor-grabbing"
        ref={handleRef}
        title="Reorder provider"
        type="button"
      >
        <span class="icon-[tabler--grip-vertical]" />
      </button>
      <button
        class="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
        onClick={() => props.onProviderClick(props.providerId)}
        type="button"
      >
        <Show when={meta()?.icon}>
          <span class={meta()?.icon} />
        </Show>
        <span class="font-medium text-sm">{meta()?.name}</span>
      </button>
      <div class="pointer-events-auto">
        <Switch
          checked={props.isEnabled}
          onChange={() => props.onToggleEnabled(props.providerId)}
        />
      </div>
    </div>
  );
};

export const TranslateSettings: VoidComponent = () => {
  const { t } = useI18n();

  const [selectedProvider, setSelectedProvider] =
    createSignal<TranslateProvider>(translateConfig.activeProvider);

  const providerMeta = () => getProviderMeta(selectedProvider());

  // 获取当前选中的 provider 配置
  const currentProviderConfig = (): ProviderConfig | undefined => {
    return translateConfig.providers.find(
      (p) => p.provider === selectedProvider()
    );
  };

  // 判断 provider 是否启用（存在于 providers 数组中）
  const isEnabled = (providerId: TranslateProvider) => {
    return translateConfig.providers.some((p) => p.provider === providerId);
  };

  // 切换 provider 启用状态
  const toggleEnabled = (providerId: TranslateProvider) => {
    const exists = isEnabled(providerId);
    if (exists) {
      // 禁用：从数组移除
      const newProviders = translateConfig.providers.filter(
        (p) => p.provider !== providerId
      );
      translateActions.update({
        providers: newProviders,
      });

      // 如果禁用的是当前选中的 provider，自动切换到下一个可用的
      if (selectedProvider() === providerId && newProviders.length > 0) {
        const nextProvider = newProviders[0]?.provider;
        if (nextProvider) {
          setSelectedProvider(nextProvider);
          translateActions.update({ activeProvider: nextProvider });
        }
      }
    } else {
      // 启用：添加默认配置
      const newConfig = getDefaultProviderConfig(providerId);
      translateActions.update({
        providers: [...translateConfig.providers, newConfig],
      });
    }
  };

  // 更新当前 provider 的配置
  const updateProviderConfig = (updates: Partial<ProviderConfig>) => {
    const updatedProviders = translateConfig.providers.map((p) =>
      p.provider === selectedProvider() ? { ...p, ...updates } : p
    );
    translateActions.update({ providers: updatedProviders });
  };

  // 点击 provider 列表项
  const handleProviderClick = (providerId: TranslateProvider) => {
    setSelectedProvider(providerId);
    translateActions.update({ activeProvider: providerId });
  };

  // 拖拽后更新 provider 顺序
  const handleProviderDragEnd = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) {
      return;
    }

    const currentOrder = [...translateConfig.providerOrder];
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= currentOrder.length ||
      toIndex >= currentOrder.length
    ) {
      return;
    }

    const [moved] = currentOrder.splice(fromIndex, 1);
    if (!moved) {
      return;
    }
    currentOrder.splice(toIndex, 0, moved);

    translateActions.update({ providerOrder: currentOrder });
  };

  return (
    <div class="flex h-full min-h-125 gap-6">
      <div class="w-52 shrink-0 space-y-1 border-r pr-4">
        <h3 class="mb-3 px-2 font-medium text-muted-foreground text-sm">
          {t("settings.service.translate.provider")}
        </h3>
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
          <For each={translateConfig.providerOrder}>
            {(providerId, index) => (
              <SortableProviderItem
                index={index()}
                isEnabled={isEnabled(providerId)}
                isSelected={selectedProvider() === providerId}
                onProviderClick={handleProviderClick}
                onToggleEnabled={toggleEnabled}
                providerId={providerId}
              />
            )}
          </For>
        </DragDropProvider>
      </div>

      <div class="flex-1 space-y-6 overflow-y-auto">
        <Show when={providerMeta() && currentProviderConfig()}>
          {
            <>
              <section class="space-y-2">
                <div class="flex items-center gap-2">
                  <Show when={providerMeta()?.icon}>
                    <span class={providerMeta()?.icon} />
                  </Show>
                  <h2 class="font-semibold text-lg">{providerMeta()?.name}</h2>
                </div>
                <Show when={providerMeta()?.description}>
                  <p class="text-muted-foreground text-sm">
                    {providerMeta()?.description}
                  </p>
                </Show>
              </section>

              <section class="space-y-4 rounded-lg border p-6">
                <h3 class="font-medium text-muted-foreground text-sm">
                  {t("settings.service.translate.apiConfig")}
                </h3>

                <div class="space-y-4">
                  <Show when={providerMeta()?.requiresApiKey}>
                    <div class="flex items-center justify-between gap-4">
                      <div class="shrink-0 space-y-0.5">
                        <div class="text-sm">
                          {t("settings.service.translate.apiKey")}
                        </div>
                      </div>
                      <Input
                        class="h-8 w-60 font-mono text-xs"
                        onInput={(e) =>
                          updateProviderConfig({
                            apiKey: e.currentTarget.value,
                          })
                        }
                        placeholder="sk-..."
                        type="password"
                        value={currentProviderConfig()?.apiKey}
                      />
                    </div>
                  </Show>

                  <div class="flex items-center justify-between gap-4">
                    <div class="shrink-0 space-y-0.5">
                      <div class="text-sm">
                        {t("settings.service.translate.apiEndpoint")}
                      </div>
                    </div>
                    <Input
                      class="h-8 w-60 font-mono text-xs"
                      onInput={(e) =>
                        updateProviderConfig({
                          apiEndpoint: e.currentTarget.value,
                        })
                      }
                      placeholder="https://api.openai.com/v1"
                      value={currentProviderConfig()?.apiEndpoint}
                    />
                  </div>

                  <Show when={providerMeta()?.supportedModels?.length}>
                    <div class="flex items-center justify-between gap-4">
                      <div class="shrink-0 space-y-0.5">
                        <div class="text-sm">
                          {t("settings.service.translate.model")}
                        </div>
                      </div>
                      <Select
                        itemComponent={(props) => (
                          <SelectItem item={props.item}>
                            <span class="font-mono text-xs">
                              {props.item.rawValue.label}
                            </span>
                          </SelectItem>
                        )}
                        onChange={(opt) => {
                          if (opt) {
                            updateProviderConfig({ model: opt.value });
                          }
                        }}
                        options={
                          providerMeta()?.supportedModels?.map((m: string) => ({
                            value: m,
                            label: m,
                          })) || []
                        }
                        optionTextValue="label"
                        optionValue="value"
                        value={{
                          value: currentProviderConfig()?.model || "",
                          label: currentProviderConfig()?.model || "",
                        }}
                      >
                        <SelectTrigger class="h-8 w-60">
                          <SelectValue<{ value: string; label: string }>>
                            {(state) => (
                              <span class="font-mono text-xs">
                                {state.selectedOption()?.label}
                              </span>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent />
                      </Select>
                    </div>
                  </Show>
                </div>
              </section>

              <section class="space-y-4 rounded-lg border p-6">
                <h3 class="font-medium text-muted-foreground text-sm">
                  {t("settings.service.translate.advancedConfig")}
                </h3>

                <div class="space-y-4">
                  <div class="space-y-2">
                    <div class="text-sm">
                      {t("settings.service.translate.promptTemplate")}
                    </div>
                    <Textarea
                      class="min-h-20 font-mono text-xs"
                      onInput={(e) =>
                        updateProviderConfig({
                          promptTemplate: e.currentTarget.value,
                        })
                      }
                      placeholder={t(
                        "settings.service.translate.promptTemplatePlaceholder"
                      )}
                      value={currentProviderConfig()?.promptTemplate}
                    />
                    <div class="text-muted-foreground text-xs">
                      {t("settings.service.translate.promptTemplateDesc")}
                    </div>
                  </div>

                  <div class="flex items-center justify-between gap-4">
                    <div class="shrink-0 space-y-0.5">
                      <div class="text-sm">
                        {t("settings.service.translate.temperature")}
                      </div>
                      <div class="text-muted-foreground text-xs">
                        {t("settings.service.translate.temperatureDesc")}
                      </div>
                    </div>
                    <Input
                      class="h-8 w-20"
                      max="2"
                      min="0"
                      onInput={(e) => {
                        const val = Number.parseFloat(e.currentTarget.value);
                        if (!Number.isNaN(val) && val >= 0 && val <= 2) {
                          updateProviderConfig({ temperature: val });
                        }
                      }}
                      step="0.1"
                      type="number"
                      value={currentProviderConfig()?.temperature}
                    />
                  </div>
                </div>
              </section>
            </>
          }
        </Show>
      </div>
    </div>
  );
};
