/**
 * 服务设置页面 - OCR配置 (占位)
 */

import { createSignal, type JSX } from "solid-js";
import { useI18n } from "@/i18n";
import { ProviderSearchBox } from "./components/provider-search-box";

interface OCRSettingsProps {
  serviceTabs?: JSX.Element;
}

export function OCRSettings(props: OCRSettingsProps) {
  const { t } = useI18n();
  const [providerSearch, setProviderSearch] = createSignal("");

  return (
    <div class="flex h-full min-h-0 gap-6 overflow-hidden">
      <div class="flex min-h-0 w-52 shrink-0 flex-col border-r">
        {props.serviceTabs}
        <ProviderSearchBox
          onSearchChange={setProviderSearch}
          placeholder={t("settings.service.providerSearchPlaceholder")}
          value={providerSearch()}
        />
        <div class="min-h-0 flex-1 overflow-y-auto px-2 text-muted-foreground text-sm">
          OCR 服务提供商 - 开发中
        </div>
      </div>
      <div class="flex min-h-0 flex-1 items-center justify-center overflow-y-auto text-muted-foreground">
        OCR 服务配置 - 开发中
      </div>
    </div>
  );
}
