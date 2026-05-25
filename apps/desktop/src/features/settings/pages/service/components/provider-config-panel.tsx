import { type JSX, Show } from "solid-js";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ProviderConfig } from "@/services/service-config/types";
import type { ProviderMeta } from "@/services/translate-core";

interface ProviderConfigPanelLabels {
  advancedConfig: string;
  apiConfig: string;
  apiEndpoint: string;
  apiKey: string;
  model: string;
  promptTemplate: string;
  promptTemplateDesc: string;
  promptTemplatePlaceholder: string;
  temperature: string;
  temperatureDesc: string;
}

interface ProviderConfigPanelProps<TProvider extends string> {
  labels: ProviderConfigPanelLabels;
  meta: ProviderMeta | undefined;
  providerConfig: ProviderConfig<TProvider> | undefined;
  updateProviderConfig: (updates: Partial<ProviderConfig<TProvider>>) => void;
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
  const shouldShowModelConfig = () => !!props.meta?.supportedModels?.length;

  return (
    <div class="min-h-0 flex-1 space-y-6 overflow-y-auto p-4">
      <Show when={props.meta && props.providerConfig}>
        <section class="space-y-2">
          <div class="flex items-center gap-2">
            <Show when={props.meta?.icon}>
              <span class={props.meta?.icon} />
            </Show>
            <h2 class="font-semibold text-lg">{props.meta?.name}</h2>
          </div>
          <Show when={props.meta?.description}>
            <p class="text-muted-foreground text-sm">
              {props.meta?.description}
            </p>
          </Show>
        </section>

        <section class="space-y-4 rounded-lg border p-6">
          <h3 class="font-medium text-muted-foreground text-sm">
            {props.labels.apiConfig}
          </h3>

          <div class="space-y-4">
            <Show when={props.meta?.requiresApiKey}>
              <ConfigRow label={props.labels.apiKey}>
                <Input
                  class="h-8 w-60 font-mono text-xs"
                  onInput={(e) =>
                    props.updateProviderConfig({
                      apiKey: e.currentTarget.value,
                    })
                  }
                  placeholder="sk-..."
                  type="password"
                  value={props.providerConfig?.apiKey}
                />
              </ConfigRow>
            </Show>

            <ConfigRow label={props.labels.apiEndpoint}>
              <Input
                class="h-8 w-60 font-mono text-xs"
                onInput={(e) =>
                  props.updateProviderConfig({
                    apiEndpoint: e.currentTarget.value,
                  })
                }
                placeholder="https://api.openai.com/v1"
                value={props.providerConfig?.apiEndpoint}
              />
            </ConfigRow>

            <Show when={shouldShowModelConfig()}>
              <ConfigRow label={props.labels.model}>
                <Select
                  itemComponent={(itemProps) => (
                    <SelectItem item={itemProps.item}>
                      <span class="font-mono text-xs">
                        {itemProps.item.rawValue.label}
                      </span>
                    </SelectItem>
                  )}
                  onChange={(opt) => {
                    if (opt) {
                      props.updateProviderConfig({ model: opt.value });
                    }
                  }}
                  options={
                    props.meta?.supportedModels?.map((model) => ({
                      value: model,
                      label: model,
                    })) ?? []
                  }
                  optionTextValue="label"
                  optionValue="value"
                  value={{
                    value: props.providerConfig?.model ?? "",
                    label: props.providerConfig?.model ?? "",
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
              </ConfigRow>
            </Show>
          </div>
        </section>

        <section class="space-y-4 rounded-lg border p-6">
          <h3 class="font-medium text-muted-foreground text-sm">
            {props.labels.advancedConfig}
          </h3>

          <div class="space-y-4">
            <div class="space-y-2">
              <div class="text-sm">{props.labels.promptTemplate}</div>
              <Textarea
                class="min-h-20 font-mono text-xs"
                onInput={(e) =>
                  props.updateProviderConfig({
                    promptTemplate: e.currentTarget.value,
                  })
                }
                placeholder={props.labels.promptTemplatePlaceholder}
                value={props.providerConfig?.promptTemplate}
              />
              <div class="text-muted-foreground text-xs">
                {props.labels.promptTemplateDesc}
              </div>
            </div>

            <div class="flex items-center justify-between gap-4">
              <div class="shrink-0 space-y-0.5">
                <div class="text-sm">{props.labels.temperature}</div>
                <div class="text-muted-foreground text-xs">
                  {props.labels.temperatureDesc}
                </div>
              </div>
              <Input
                class="h-8 w-20"
                max="2"
                min="0"
                onInput={(e) => {
                  const value = Number.parseFloat(e.currentTarget.value);
                  if (!Number.isNaN(value) && value >= 0 && value <= 2) {
                    props.updateProviderConfig({ temperature: value });
                  }
                }}
                step="0.1"
                type="number"
                value={props.providerConfig?.temperature}
              />
            </div>
          </div>
        </section>
      </Show>
    </div>
  );
};
