import { debounce } from "@solid-primitives/scheduled";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  type JSX,
  onCleanup,
  Show,
  untrack,
} from "solid-js";
import { toast } from "solid-sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type Dictionary, useI18n } from "@/i18n";
import type { ProviderConfig } from "@/services/service-config/types";
import { listTranslateModels, translate } from "@/services/translate";
import type {
  TranslateConfig as CoreTranslateConfig,
  OpenAIApiMode,
  ProviderMeta,
} from "@/services/translate-core";

type ApiModeLabelKey = Extract<
  keyof Dictionary,
  `settings.service.providerConfig.${string}`
>;

interface ApiModeOption {
  labelKey: ApiModeLabelKey;
  value: OpenAIApiMode;
}

const DEFAULT_API_MODE: OpenAIApiMode = "chat-completions";
const API_MODE_OPTIONS: ApiModeOption[] = [
  {
    value: "chat-completions",
    labelKey: "settings.service.providerConfig.apiModeChatCompletions",
  },
  {
    value: "responses",
    labelKey: "settings.service.providerConfig.apiModeResponses",
  },
];

interface ProviderConfigPanelProps<TProvider extends string> {
  deleteProviderConfig: () => void;
  isCustomProvider?: boolean;
  isEnabled?: boolean;
  meta: ProviderMeta | undefined;
  providerConfig: ProviderConfig<TProvider> | undefined;
  updateProviderConfig: (
    updates: Partial<ProviderConfig<TProvider>>
  ) => Promise<unknown> | unknown;
}

function ConfigRow(props: { children: JSX.Element; label: string }) {
  return (
    <div class="flex items-center justify-between gap-4">
      <div class="shrink-0 space-y-0.5">
        <div class="text-sm">{props.label}</div>
      </div>
      {props.children}
    </div>
  );
}

export const ProviderConfigPanel = <TProvider extends string>(
  props: ProviderConfigPanelProps<TProvider>
) => {
  const { t } = useI18n();

  // Local form state — only persisted on save
  const [localDisplayName, setLocalDisplayName] = createSignal("");
  const [localApiKey, setLocalApiKey] = createSignal("");
  const [localApiEndpoint, setLocalApiEndpoint] = createSignal("");
  const [localApiMode, setLocalApiMode] =
    createSignal<OpenAIApiMode>(DEFAULT_API_MODE);
  const [localModel, setLocalModel] = createSignal("");
  const [localCustomModels, setLocalCustomModels] = createSignal<string[]>([]);
  const [localPromptTemplate, setLocalPromptTemplate] = createSignal("");
  const [localTemperature, setLocalTemperature] = createSignal(0.3);

  // Model fetch state
  const [isFetchingModels, setIsFetchingModels] = createSignal(false);

  // Model picker drawer state
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  const [fetchedModelIds, setFetchedModelIds] = createSignal<string[]>([]);
  const [modelSearch, setModelSearch] = createSignal("");
  const [selectedModels, setSelectedModels] = createSignal<Set<string>>(
    new Set()
  );

  /** Computed set of models already present (built-in + custom). */
  const alreadyAddedSet = createMemo(() => {
    const builtIn = new Set(props.meta?.supportedModels ?? []);
    const custom = new Set(localCustomModels());
    return new Set([...builtIn, ...custom]);
  });

  /** Filtered fetched models based on search query. */
  const filteredFetchedModels = createMemo(() => {
    const query = modelSearch().toLowerCase();
    if (!query) {
      return fetchedModelIds();
    }
    return fetchedModelIds().filter((id) => id.toLowerCase().includes(query));
  });

  /** Filtered models that are NOT already added (eligible for selection). */
  const eligibleModels = createMemo(() =>
    filteredFetchedModels().filter((id) => !alreadyAddedSet().has(id))
  );

  /** Whether the select-all checkbox should be checked. */
  const isAllEligibleSelected = createMemo(() => {
    const eligible = eligibleModels();
    if (eligible.length === 0) {
      return false;
    }
    const selected = selectedModels();
    return eligible.every((id) => selected.has(id));
  });

  const supportedApiModes = createMemo(
    () => props.meta?.supportedApiModes ?? []
  );

  const apiModeOptions = createMemo(() => {
    const supported = new Set(supportedApiModes());
    return API_MODE_OPTIONS.filter((option) => supported.has(option.value));
  });

  const shouldShowApiModeConfig = () =>
    props.meta?.providerKind === "llm" && apiModeOptions().length > 1;

  const shouldShowModelConfig = () => {
    if (props.meta?.supportsModelConfig === false) {
      return false;
    }

    return (
      props.meta?.supportsModelConfig === true ||
      !!props.meta?.supportedModels?.length ||
      props.isCustomProvider === true ||
      localCustomModels().length > 0
    );
  };

  const shouldShowAdvancedConfig = () =>
    props.meta?.supportsAdvancedConfig !== false;

  const testButtonIconClass = () => {
    switch (testStatus()) {
      case "testing":
        return "icon-[tabler--loader-2] animate-spin";
      case "success":
        return "icon-[line-md--circle-twotone-to-confirm-circle-transition] text-green-500";
      case "failed":
        return "icon-[line-md--close-circle] text-destructive";
      default:
        return "";
    }
  };

  const testButtonLabel = () => {
    switch (testStatus()) {
      case "testing":
        return t("settings.service.providerConfig.testing");
      case "success":
        return t("settings.service.providerConfig.testSuccess");
      case "failed":
        return t("settings.service.providerConfig.testFailed");
      default:
        return t("settings.service.providerConfig.testConnection");
    }
  };

  const allModelOptions = createMemo(() => {
    const models = new Set([
      ...(props.meta?.supportedModels ?? []),
      ...localCustomModels(),
    ]);
    // Always include the current model if set
    if (localModel()) {
      models.add(localModel());
    }
    return [...models].map((model) => ({
      value: model,
      label: model,
    }));
  });

  // Sync local state when providerConfig changes (e.g. switching providers)
  createEffect(() => {
    const config = props.providerConfig;
    if (config) {
      untrack(() => {
        setLocalDisplayName(config.displayName ?? "");
        setLocalApiKey(config.apiKey ?? "");
        setLocalApiEndpoint(config.apiEndpoint ?? "");
        setLocalApiMode(
          config.apiMode ?? props.meta?.defaultApiMode ?? DEFAULT_API_MODE
        );
        setLocalModel(config.model ?? "");
        setLocalCustomModels(config.customModels ?? []);
        setLocalPromptTemplate(config.promptTemplate ?? "");
        setLocalTemperature(config.temperature ?? 0.3);
      });
    }
  });

  const isDirty = (): boolean => {
    const config = props.providerConfig;
    if (!config) {
      return false;
    }
    return (
      localDisplayName() !== (config.displayName ?? "") ||
      localApiKey() !== (config.apiKey ?? "") ||
      localApiEndpoint() !== (config.apiEndpoint ?? "") ||
      localApiMode() !==
        (config.apiMode ?? props.meta?.defaultApiMode ?? DEFAULT_API_MODE) ||
      localModel() !== (config.model ?? "") ||
      localCustomModels().join(",") !== (config.customModels ?? []).join(",") ||
      localPromptTemplate() !== (config.promptTemplate ?? "") ||
      localTemperature() !== (config.temperature ?? 0.3)
    );
  };

  // 连通性检测状态
  const [testStatus, setTestStatus] = createSignal<
    "idle" | "testing" | "success" | "failed"
  >("idle");
  let testRequestId = 0;

  createEffect((previousProvider) => {
    const provider = props.providerConfig?.provider;
    if (provider !== previousProvider) {
      testRequestId += 1;
      setTestStatus("idle");
    }
    return provider;
  });

  createEffect(() => {
    const status = testStatus();
    if (status !== "success" && status !== "failed") {
      return;
    }

    const timeout = window.setTimeout(() => setTestStatus("idle"), 2500);
    onCleanup(() => window.clearTimeout(timeout));
  });

  const handleSave = debounce(async () => {
    try {
      await props.updateProviderConfig({
        displayName: props.isCustomProvider
          ? localDisplayName().trim()
          : undefined,
        apiKey: localApiKey(),
        apiEndpoint: localApiEndpoint(),
        apiMode: localApiMode(),
        model: localModel(),
        customModels: localCustomModels(),
        promptTemplate: localPromptTemplate(),
        temperature: localTemperature(),
      });

      toast.success(t("global.operationSuccess"));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t("global.operationFailed"), { description: message });
      throw error;
    }
  }, 300);

  /** Add selected models from the drawer into localCustomModels. */
  const handleAddSelectedModels = () => {
    const toAdd = [...selectedModels()];
    if (toAdd.length === 0) {
      return;
    }

    const existing = new Set(localCustomModels());
    const newModels: string[] = [];
    for (const id of toAdd) {
      if (!existing.has(id)) {
        newModels.push(id);
        existing.add(id);
      }
    }

    setLocalCustomModels([...localCustomModels(), ...newModels]);

    toast.success(
      t("settings.service.providerConfig.fetchModelsSuccess", {
        count: newModels.length.toString(),
        total: fetchedModelIds().length.toString(),
      })
    );

    // Close drawer and reset picker state
    setDrawerOpen(false);
    setFetchedModelIds([]);
    setSelectedModels(new Set<string>());
    setModelSearch("");
  };

  const toggleModel = (id: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const eligible = eligibleModels();
    if (isAllEligibleSelected()) {
      // Deselect all eligible
      setSelectedModels(new Set<string>());
    } else {
      // Select all eligible
      setSelectedModels(new Set(eligible));
    }
  };

  const buildLocalTranslateConfig = (): CoreTranslateConfig => ({
    provider: props.providerConfig?.provider ?? "openai",
    apiKey: localApiKey(),
    apiEndpoint: localApiEndpoint(),
    apiMode: localApiMode(),
    requiresApiKey: props.meta?.requiresApiKey,
    model: localModel(),
    promptTemplate: localPromptTemplate(),
    temperature: localTemperature(),
    sourceLang: "en",
    targetLang: "zh-CN",
  });

  /** Fetch models through the selected provider's own API contract. */
  const handleFetchModels = async () => {
    setIsFetchingModels(true);
    try {
      const fetchedIds = await listTranslateModels(buildLocalTranslateConfig());

      if (fetchedIds.length === 0) {
        toast.info(t("settings.service.providerConfig.fetchModelsEmpty"));
        return;
      }

      setFetchedModelIds(fetchedIds);
      setSelectedModels(new Set<string>());
      setModelSearch("");
      setDrawerOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t("settings.service.providerConfig.fetchModelsFailed"), {
        description: message,
      });
    } finally {
      setIsFetchingModels(false);
    }
  };

  /** 连通性测试 */
  const handleTestConnection = async () => {
    const requestId = ++testRequestId;
    setTestStatus("testing");
    try {
      await translate(buildLocalTranslateConfig(), { text: "Hi" });
      if (requestId !== testRequestId) {
        return;
      }
      setTestStatus("success");
      toast.success(t("settings.service.providerConfig.testSuccess"));
    } catch (error) {
      if (requestId !== testRequestId) {
        return;
      }
      setTestStatus("failed");
      const message = error instanceof Error ? error.message : String(error);
      toast.error(t("settings.service.providerConfig.testFailed"), {
        description: message,
      });
    }
  };

  return (
    <div class="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
      <Show when={props.meta && props.providerConfig}>
        <section class="space-y-2">
          <div class="flex items-center gap-2">
            <Show when={props.meta?.icon}>
              <span class={props.meta?.icon} />
            </Show>
            <h2 class="font-semibold text-lg">
              {props.providerConfig?.displayName?.trim() || props.meta?.name}
            </h2>
            <Show when={props.isEnabled === false}>
              <span class="rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                {t("global.disabled")}
              </span>
            </Show>
          </div>
          <Show when={props.meta?.description}>
            <p class="text-muted-foreground text-sm">
              {props.meta?.description}
            </p>
          </Show>
        </section>

        <section class="space-y-4 rounded-lg border p-6">
          <h3 class="font-medium text-muted-foreground text-sm">
            {t("settings.service.providerConfig.apiConfig")}
          </h3>

          <div class="space-y-4">
            <Show when={props.isCustomProvider}>
              <ConfigRow
                label={t("settings.service.providerConfig.displayName")}
              >
                <Input
                  class="h-8 w-60 text-xs"
                  onInput={(e) => setLocalDisplayName(e.currentTarget.value)}
                  placeholder={props.meta?.name}
                  value={localDisplayName()}
                />
              </ConfigRow>
            </Show>

            <ConfigRow label={t("settings.service.providerConfig.apiEndpoint")}>
              <Input
                class="h-8 w-60 font-mono text-xs"
                onInput={(e) => setLocalApiEndpoint(e.currentTarget.value)}
                placeholder="https://api.openai.com/v1"
                value={localApiEndpoint()}
              />
            </ConfigRow>

            <Show when={props.meta?.requiresApiKey}>
              <ConfigRow label={t("settings.service.providerConfig.apiKey")}>
                <Input
                  class="h-8 w-60 font-mono text-xs"
                  onInput={(e) => setLocalApiKey(e.currentTarget.value)}
                  placeholder="sk-..."
                  type="password"
                  value={localApiKey()}
                />
              </ConfigRow>
            </Show>

            <Show when={shouldShowApiModeConfig()}>
              <ConfigRow label={t("settings.service.providerConfig.apiMode")}>
                <Select
                  itemComponent={(itemProps) => (
                    <SelectItem item={itemProps.item}>
                      {t(itemProps.item.rawValue.labelKey)}
                    </SelectItem>
                  )}
                  onChange={(opt) => {
                    if (opt) {
                      setLocalApiMode(opt.value);
                    }
                  }}
                  options={apiModeOptions()}
                  optionTextValue="labelKey"
                  optionValue="value"
                  value={
                    apiModeOptions().find(
                      (option) => option.value === localApiMode()
                    ) ?? apiModeOptions()[0]
                  }
                >
                  <SelectTrigger class="h-8 w-60">
                    <SelectValue<ApiModeOption>>
                      {(state) => (
                        <span class="text-xs">
                          {t(state.selectedOption()?.labelKey ?? "")}
                        </span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </ConfigRow>
            </Show>

            <Show when={shouldShowModelConfig()}>
              <ConfigRow label={t("settings.service.providerConfig.model")}>
                <div class="flex w-60 min-w-0 items-center gap-1">
                  <Select
                    class="min-w-0 flex-1"
                    itemComponent={(itemProps) => (
                      <SelectItem item={itemProps.item}>
                        <span class="font-mono text-xs">
                          {itemProps.item.rawValue.label}
                        </span>
                      </SelectItem>
                    )}
                    onChange={(opt) => {
                      if (opt) {
                        setLocalModel(opt.value);
                      }
                    }}
                    options={allModelOptions()}
                    optionTextValue="label"
                    optionValue="value"
                    value={
                      allModelOptions().find(
                        (o) => o.value === localModel()
                      ) ?? {
                        value: localModel(),
                        label: localModel(),
                      }
                    }
                  >
                    <SelectTrigger class="h-8 min-w-0 flex-1">
                      <SelectValue<{ value: string; label: string }>>
                        {(state) => (
                          <span class="block min-w-0 truncate font-mono text-xs">
                            {state.selectedOption()?.label}
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                  <button
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                    disabled={isFetchingModels()}
                    onClick={handleFetchModels}
                    title={t("settings.service.providerConfig.fetchModels")}
                    type="button"
                  >
                    <Show
                      fallback={
                        <span class="icon-[tabler--loader-2] size-4 animate-spin" />
                      }
                      when={!isFetchingModels()}
                    >
                      <span class="icon-[tabler--refresh] size-4" />
                    </Show>
                  </button>
                </div>
              </ConfigRow>
            </Show>
          </div>
        </section>

        <Show when={shouldShowAdvancedConfig()}>
          <section class="space-y-4 rounded-lg border p-6">
            <h3 class="font-medium text-muted-foreground text-sm">
              {t("settings.service.providerConfig.advancedConfig")}
            </h3>

            <div class="space-y-4">
              <div class="space-y-2">
                <div class="text-sm">
                  {t("settings.service.providerConfig.promptTemplate")}
                </div>
                <Textarea
                  class="min-h-20 font-mono text-xs"
                  onInput={(e) => setLocalPromptTemplate(e.currentTarget.value)}
                  placeholder={t(
                    "settings.service.providerConfig.promptTemplatePlaceholder"
                  )}
                  value={localPromptTemplate()}
                />
                <div class="text-muted-foreground text-xs">
                  {t("settings.service.providerConfig.promptTemplateDesc")}
                </div>
              </div>

              <div class="flex items-center justify-between gap-4">
                <div class="shrink-0 space-y-0.5">
                  <div class="text-sm">
                    {t("settings.service.providerConfig.temperature")}
                  </div>
                  <div class="text-muted-foreground text-xs">
                    {t("settings.service.providerConfig.temperatureDesc")}
                  </div>
                </div>
                <Input
                  class="h-8 w-20"
                  max="2"
                  min="0"
                  onInput={(e) => {
                    const value = Number.parseFloat(e.currentTarget.value);
                    if (!Number.isNaN(value) && value >= 0 && value <= 2) {
                      setLocalTemperature(value);
                    }
                  }}
                  step="0.1"
                  type="number"
                  value={localTemperature()}
                />
              </div>
            </div>
          </section>
        </Show>

        {/* Action buttons */}
        <div class="flex w-full items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Show when={props.isCustomProvider}>
              <AlertDialog>
                <AlertDialogTrigger as={Button} size="xs" variant="destructive">
                  {t("global.delete")}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("settings.service.providerConfig.deleteConfirmTitle")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t(
                        "settings.service.providerConfig.deleteConfirmDescription"
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction as={Button} size="sm" variant="outline">
                      {t("global.cancel")}
                    </AlertDialogAction>
                    <AlertDialogAction
                      as={Button}
                      onClick={() => props.deleteProviderConfig()}
                      size="sm"
                      variant="destructive"
                    >
                      {t("global.delete")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Show>

            <Button
              class="gap-1.5"
              disabled={testStatus() === "testing"}
              onClick={handleTestConnection}
              size="xs"
              variant="outline"
            >
              <Show when={testButtonIconClass()}>
                {(iconClass) => <span class={`${iconClass()} size-4`} />}
              </Show>
              {testButtonLabel()}
            </Button>
          </div>

          <div class="flex items-center gap-2">
            <Button disabled={!isDirty()} onClick={handleSave} size="xs">
              {t("global.save")}
            </Button>
          </div>
        </div>
      </Show>

      {/* Model picker drawer */}
      <Drawer
        modal
        onOpenChange={setDrawerOpen}
        open={drawerOpen()}
        side="right"
      >
        <DrawerContent class="inset-y-0 right-0 h-full w-80 max-w-[90vw] sm:w-96">
          <div class="flex h-full flex-col">
            <DrawerHeader class="border-b px-4 py-3">
              <DrawerTitle class="text-base">
                {t("settings.service.providerConfig.modelPickerTitle")}
              </DrawerTitle>
              <DrawerDescription class="text-muted-foreground text-xs">
                {t("settings.service.providerConfig.modelPickerCount", {
                  count: selectedModels().size.toString(),
                })}
              </DrawerDescription>
            </DrawerHeader>

            {/* Search + Select All bar */}
            <div class="flex items-center gap-2 border-b px-4 py-2">
              <Checkbox
                checked={isAllEligibleSelected()}
                class="size-4 shrink-0"
                id="model-picker-select-all"
                onChange={toggleSelectAll}
              />
              <label
                class="cursor-pointer text-foreground text-xs"
                for="model-picker-select-all"
              >
                {isAllEligibleSelected()
                  ? t("settings.service.providerConfig.modelPickerDeselectAll")
                  : t("settings.service.providerConfig.modelPickerSelectAll")}
              </label>
              <Input
                class="h-7 flex-1 font-mono text-xs"
                onInput={(e) => setModelSearch(e.currentTarget.value)}
                placeholder={t(
                  "settings.service.providerConfig.modelPickerSearch"
                )}
                value={modelSearch()}
              />
            </div>

            {/* Model list */}
            <div class="flex-1 overflow-y-auto">
              <Show
                fallback={
                  <div class="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    {t("settings.service.providerConfig.modelPickerNoResults")}
                  </div>
                }
                when={filteredFetchedModels().length > 0}
              >
                <ul class="divide-y">
                  <For each={filteredFetchedModels()}>
                    {(modelId, index) => {
                      const isAlreadyAdded = () =>
                        alreadyAddedSet().has(modelId);
                      const isChecked = () => selectedModels().has(modelId);
                      const checkboxId = () =>
                        `model-picker-${index()}-${modelId.replace(/[^a-zA-Z0-9_-]/g, "-")}`;

                      return (
                        <li
                          class="flex items-center gap-2 px-4 py-2 transition-colors hover:bg-muted/50"
                          classList={{
                            "opacity-50": isAlreadyAdded(),
                            "cursor-not-allowed": isAlreadyAdded(),
                          }}
                        >
                          <Checkbox
                            checked={isChecked()}
                            class="size-4 shrink-0"
                            disabled={isAlreadyAdded()}
                            id={checkboxId()}
                            onChange={() => toggleModel(modelId)}
                          />
                          <label
                            class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 font-mono text-foreground text-xs"
                            classList={{
                              "cursor-not-allowed": isAlreadyAdded(),
                            }}
                            for={checkboxId()}
                          >
                            <span class="flex-1 truncate">{modelId}</span>
                            <Show when={isAlreadyAdded()}>
                              <span class="shrink-0 rounded bg-muted px-1.5 py-0.5 text-muted-foreground text-xs">
                                {t(
                                  "settings.service.providerConfig.modelPickerAlreadyAdded"
                                )}
                              </span>
                            </Show>
                          </label>
                        </li>
                      );
                    }}
                  </For>
                </ul>
              </Show>
            </div>

            {/* Footer with action buttons */}
            <DrawerFooter class="border-t px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <DrawerClose as={Button} size="xs" variant="outline">
                  {t("global.cancel")}
                </DrawerClose>
                <Button
                  disabled={selectedModels().size === 0}
                  onClick={handleAddSelectedModels}
                  size="xs"
                >
                  {t("settings.service.providerConfig.modelPickerAdd")}
                </Button>
              </div>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
