import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/i18n";
import { TRANSLATE_PROVIDERS } from "@/services/translate/config";
import { translateActions, translateConfig } from "@/stores/settings/services";
import { cn } from "@/utils";
import { useMultiTranslate } from "../hooks/use-multi-translate";
import type { TranslateResultItem, TranslateResultListProps } from "../types";

/**
 * 翻译结果列表组件
 * 接收待翻译文本 props，自动调用所有启用的翻译服务并展示结果
 */
export function TranslateResultList(props: TranslateResultListProps) {
  const { t } = useI18n();
  const { results, enabledProviders, triggerProviderTranslation } =
    useMultiTranslate(() => props.text);

  const providerStateMap = createMemo(
    () => new Map(enabledProviders().map((config) => [config.provider, config]))
  );

  const [userInteractedProviders, setUserInteractedProviders] = createSignal(
    new Set<TranslateResultItem["provider"]>()
  );

  createEffect(() => {
    props.text;
    setUserInteractedProviders(new Set<TranslateResultItem["provider"]>());
  });

  const shouldCollapseByDefault = (item: TranslateResultItem): boolean =>
    !(item.loading || item.error) && item.resultLines.length === 0;

  const isServiceCollapsed = (item: TranslateResultItem): boolean => {
    const hasUserInteracted = userInteractedProviders().has(item.provider);
    if (!hasUserInteracted && shouldCollapseByDefault(item)) {
      return true;
    }

    const persistedState = providerStateMap().get(item.provider)?.isCollapsed;
    if (persistedState !== undefined) {
      return persistedState;
    }

    return shouldCollapseByDefault(item);
  };

  const expandedValues = createMemo(() =>
    results().flatMap((item, index) =>
      isServiceCollapsed(item) ? [] : [`translate-${index}`]
    )
  );

  const normalizeAccordionValues = (
    value: string[] | string | undefined
  ): string[] => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string") {
      return [value];
    }
    return [];
  };

  const handleAccordionChange = (nextValue: string[] | string | undefined) => {
    const expandedSet = new Set(normalizeAccordionValues(nextValue));
    const previousExpandedSet = new Set(expandedValues());
    const currentResults = results();

    setUserInteractedProviders((prev) => {
      const next = new Set(prev);
      for (const [index, item] of currentResults.entries()) {
        const key = `translate-${index}`;
        const wasExpanded = previousExpandedSet.has(key);
        const isExpanded = expandedSet.has(key);

        if (wasExpanded !== isExpanded) {
          next.add(item.provider);
        }

        if (!wasExpanded && isExpanded && shouldCollapseByDefault(item)) {
          triggerProviderTranslation(item.provider).catch(() => undefined);
        }
      }

      return next;
    });

    let hasChanges = false;

    const nextProviders = translateConfig.providers.map((config) => {
      const resultIndex = currentResults.findIndex(
        (item) => item.provider === config.provider
      );

      if (resultIndex === -1) {
        return config;
      }

      const shouldCollapse = !expandedSet.has(`translate-${resultIndex}`);
      if (config.isCollapsed === shouldCollapse) {
        return config;
      }

      hasChanges = true;
      return {
        ...config,
        isCollapsed: shouldCollapse,
      };
    });

    if (!hasChanges) {
      return;
    }

    translateActions.update({ providers: nextProviders });
  };

  return (
    <div class="space-y-2">
      <Show when={enabledProviders().length === 0}>
        <p class="text-muted-foreground text-sm">
          {t("translator.noEnabledProviders")}
        </p>
      </Show>

      <Show when={enabledProviders().length > 0 && results().length > 0}>
        <Accordion
          class="w-full"
          collapsible
          multiple
          onChange={handleAccordionChange}
          value={expandedValues()}
        >
          <For each={results()}>
            {(item, index) => {
              const providerInfo = () =>
                TRANSLATE_PROVIDERS[item.provider] || {
                  name: item.provider,
                  icon: "icon-[tabler--language]",
                };

              return (
                <AccordionItem value={`translate-${index()}`}>
                  <AccordionTrigger class="px-2 py-2 no-underline hover:no-underline">
                    <span class="flex items-center gap-x-2">
                      <span
                        class={cn(
                          providerInfo().icon,
                          "text-base text-foreground"
                        )}
                      />
                      <span class="font-medium text-sm">
                        {providerInfo().name}
                      </span>
                      <Show when={item.loading}>
                        <span class="animate-pulse text-muted-foreground text-xs">
                          ({t("translator.translating")})
                        </span>
                      </Show>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent class="px-2 pb-1">
                    <Show when={item.loading}>
                      <p class="text-muted-foreground text-sm">
                        {t("translator.translating")}
                      </p>
                    </Show>

                    <Show when={!item.loading && item.error}>
                      <p class="text-destructive text-sm">{item.error}</p>
                    </Show>

                    <Show
                      when={
                        !(item.loading || item.error) &&
                        item.resultLines.length > 0
                      }
                    >
                      <ul class="list-disc space-y-1 pl-5 text-sm leading-6">
                        <For each={item.resultLines}>
                          {(line) => <li>{line}</li>}
                        </For>
                      </ul>
                    </Show>

                    <Show
                      when={
                        !(item.loading || item.error) &&
                        item.resultLines.length === 0
                      }
                    >
                      <p class="text-muted-foreground text-sm">
                        {t("translator.emptyResult")}
                      </p>
                    </Show>
                  </AccordionContent>
                </AccordionItem>
              );
            }}
          </For>
        </Accordion>
      </Show>
    </div>
  );
}
