import { createMemo, For, Show } from "solid-js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { getProviderMeta } from "@/services/translate/config";
import { translateActions, translateConfig } from "@/stores/settings/services";
import { useMultiTranslate } from "../hooks/use-multi-translate";

interface TranslateResultListProps {
  text: string;
}

export function TranslateResultList(props: TranslateResultListProps) {
  const { t } = useI18n();
  const { results, enabledProviders, triggerProviderTranslation } =
    useMultiTranslate(() => props.text);

  const expandedValues = createMemo(() =>
    results().flatMap((item) => (item.isCollapsed ? [] : [item.provider]))
  );

  const getProviderDisplayName = (provider: string) =>
    translateConfig.providers
      .find((config) => config.provider === provider)
      ?.displayName?.trim();

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

    for (const item of currentResults) {
      const wasExpanded = previousExpandedSet.has(item.provider);
      const isExpanded = expandedSet.has(item.provider);

      if (!wasExpanded && isExpanded) {
        triggerProviderTranslation(item.provider).catch(() => undefined);
      }
    }

    let hasChanges = false;

    const nextProviders = translateConfig.providers.map((config) => {
      const shouldCollapse = !expandedSet.has(config.provider);
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
            {(item) => {
              const providerInfo = () =>
                getProviderMeta(item.provider) || {
                  name: item.provider,
                  icon: "icon-[tabler--language]",
                };
              const providerName = () =>
                getProviderDisplayName(item.provider) || providerInfo().name;

              return (
                <AccordionItem value={item.provider}>
                  <AccordionTrigger class="px-2 py-2 no-underline hover:no-underline">
                    <span class="flex items-center gap-x-2">
                      <span
                        class={cn(
                          providerInfo().icon,
                          "text-base text-foreground"
                        )}
                      />
                      <span class="font-medium text-sm">{providerName()}</span>
                      <Show when={item.loading}>
                        <span class="animate-pulse text-muted-foreground text-xs">
                          ({t("translator.translating")})
                        </span>
                      </Show>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent class="px-2 pb-1">
                    <Show when={item.resultText.trim().length > 0}>
                      <div class="whitespace-pre-wrap break-words text-sm leading-6">
                        {item.resultText}
                      </div>
                    </Show>

                    <Show when={item.loading && item.resultText.length === 0}>
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
                        item.resultText.trim().length === 0
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
