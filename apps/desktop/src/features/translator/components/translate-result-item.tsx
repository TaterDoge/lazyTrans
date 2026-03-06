import { For, Show } from "solid-js";
import { TRANSLATE_PROVIDERS } from "@/services/translate/config";
import type { TranslateProvider } from "@/services/translate/types";
import type { TranslateResultItem as TranslateResultItemType } from "../types";

export interface TranslateResultItemProps {
  /** 是否默认展开 */
  defaultExpanded?: boolean;
  /** 翻译结果数据 */
  item: TranslateResultItemType;
}

/**
 * 单个翻译结果项组件
 * 展示一个翻译服务的结果，包含服务图标、名称和翻译内容
 */
export function TranslateResultItem(props: TranslateResultItemProps) {
  const getProviderInfo = (provider: TranslateProvider) => {
    return (
      TRANSLATE_PROVIDERS[provider] || {
        name: provider,
        icon: "icon-[tabler--language]",
      }
    );
  };

  const providerInfo = () => getProviderInfo(props.item.provider);

  return (
    <div class="rounded-lg border p-2">
      {/* 服务标题 */}
      <div class="flex items-center gap-x-2 px-2 py-1">
        <span class={cn(providerInfo().icon, "text-base text-foreground")} />
        <span class="font-medium text-sm">{providerInfo().name}</span>
        <Show when={props.item.loading}>
          <span class="animate-pulse text-muted-foreground text-xs">
            翻译中...
          </span>
        </Show>
      </div>

      {/* 翻译内容 */}
      <div class="px-2 pb-1">
        <Show when={props.item.loading}>
          <p class="text-muted-foreground text-sm">翻译中...</p>
        </Show>

        <Show when={!props.item.loading && props.item.error}>
          <p class="text-destructive text-sm">{props.item.error}</p>
        </Show>

        <Show
          when={
            !(props.item.loading || props.item.error) &&
            props.item.resultLines.length > 0
          }
        >
          <ul class="list-disc space-y-1 pl-5 text-sm leading-6">
            <For each={props.item.resultLines}>{(line) => <li>{line}</li>}</For>
          </ul>
        </Show>

        <Show
          when={
            !(props.item.loading || props.item.error) &&
            props.item.resultLines.length === 0
          }
        >
          <p class="text-muted-foreground text-sm">暂无翻译结果</p>
        </Show>
      </div>
    </div>
  );
}

// 内联 cn 函数（避免循环依赖）
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
