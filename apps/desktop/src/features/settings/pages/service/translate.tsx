/**
 * 服务设置页面 - 翻译服务配置
 */

import { Show, type VoidComponent } from "solid-js";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import {
  getProviderDefaults,
  getProviderMeta,
  TRANSLATE_PROVIDER_OPTIONS,
} from "@/services/translate/config";
import { translateActions, translateConfig } from "@/stores/settings/services";

export const TranslateSettings: VoidComponent = () => {
  const { t } = useI18n();

  const currentProvider = () => translateConfig.provider;
  const providerMeta = () => getProviderMeta(currentProvider());

  return (
    <div class="space-y-6">
      {/* Provider 选择 */}
      <section class="space-y-4 rounded-lg border p-6">
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <div class="font-medium text-sm">
              {t("settings.service.translate.provider")}
            </div>
          </div>
          <Select
            itemComponent={(props) => (
              <SelectItem item={props.item}>
                <div class="flex items-center gap-2">
                  <Show when={props.item.rawValue.icon}>
                    <span class={props.item.rawValue.icon} />
                  </Show>
                  <span>{props.item.rawValue.label}</span>
                </div>
              </SelectItem>
            )}
            onChange={(opt) => {
              if (opt) {
                const newProvider = opt.value;
                const defaults = getProviderDefaults(newProvider);
                translateActions.update({
                  provider: newProvider,
                  ...defaults,
                });
              }
            }}
            options={TRANSLATE_PROVIDER_OPTIONS}
            optionTextValue="label"
            optionValue="value"
            value={TRANSLATE_PROVIDER_OPTIONS.find(
              (o) => o.value === currentProvider()
            )}
          >
            <SelectTrigger class="w-40">
              <SelectValue<(typeof TRANSLATE_PROVIDER_OPTIONS)[0]>>
                {(state) => (
                  <div class="flex items-center gap-2">
                    <Show when={state.selectedOption()?.icon}>
                      <span class={state.selectedOption()?.icon} />
                    </Show>
                    <span>{state.selectedOption()?.label}</span>
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </div>

        <Show when={providerMeta()?.description}>
          <div class="text-muted-foreground text-xs">
            {providerMeta()?.description}
          </div>
        </Show>
      </section>

      {/* API 配置 */}
      <section class="space-y-4 rounded-lg border p-6">
        <h3 class="font-medium text-muted-foreground text-sm">
          {t("settings.service.translate.apiConfig")}
        </h3>

        <div class="space-y-4">
          {/* API Key */}
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
                  translateActions.update({ apiKey: e.currentTarget.value })
                }
                placeholder="sk-..."
                type="password"
                value={translateConfig.apiKey}
              />
            </div>
          </Show>

          {/* API Endpoint */}
          <div class="flex items-center justify-between gap-4">
            <div class="shrink-0 space-y-0.5">
              <div class="text-sm">
                {t("settings.service.translate.apiEndpoint")}
              </div>
            </div>
            <Input
              class="h-8 w-60 font-mono text-xs"
              onInput={(e) =>
                translateActions.update({ apiEndpoint: e.currentTarget.value })
              }
              placeholder="https://api.openai.com/v1"
              value={translateConfig.apiEndpoint}
            />
          </div>

          {/* Model */}
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
                    translateActions.update({ model: opt.value });
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
                  value: translateConfig.model,
                  label: translateConfig.model,
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

      {/* 高级配置 */}
      <section class="space-y-4 rounded-lg border p-6">
        <h3 class="font-medium text-muted-foreground text-sm">
          {t("settings.service.translate.advancedConfig")}
        </h3>

        <div class="space-y-4">
          {/* 自定义提示词 */}
          <div class="space-y-2">
            <div class="text-sm">
              {t("settings.service.translate.promptTemplate")}
            </div>
            <Textarea
              class="min-h-20 font-mono text-xs"
              onInput={(e) =>
                translateActions.update({
                  promptTemplate: e.currentTarget.value,
                })
              }
              placeholder={t(
                "settings.service.translate.promptTemplatePlaceholder"
              )}
              value={translateConfig.promptTemplate}
            />
            <div class="text-muted-foreground text-xs">
              {t("settings.service.translate.promptTemplateDesc")}
            </div>
          </div>

          {/* Temperature */}
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
                  translateActions.update({ temperature: val });
                }
              }}
              step="0.1"
              type="number"
              value={translateConfig.temperature}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
