/**
 * 服务设置页面 - 入口 (带 Tab 切换)
 */

import { For, type VoidComponent } from "solid-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import { SERVICE_TABS } from "./config";
import { OCRSettings } from "./ocr";
import { TranslateSettings } from "./translate";
import { TTSSettings } from "./tts";

const ServiceSettings: VoidComponent = () => {
  const { t } = useI18n();

  const serviceTabs = () => (
    <TabsList class="h-auto w-full items-center gap-1 bg-muted p-1">
      <For each={SERVICE_TABS}>
        {(tab) => (
          <TabsTrigger
            class="h-9 min-w-0 px-2 data-[selected]:shadow-none"
            value={tab.id}
          >
            <span class={cn("size-4 shrink-0", tab.icon)} />
            {t(tab.labelKey)}
          </TabsTrigger>
        )}
      </For>
    </TabsList>
  );

  return (
    <Tabs
      class="h-full min-h-0 w-full overflow-hidden"
      defaultValue="translate"
    >
      <TabsContent class="min-h-0 min-w-0 overflow-hidden" value="translate">
        <TranslateSettings serviceTabs={serviceTabs()} />
      </TabsContent>
      <TabsContent class="min-h-0 min-w-0 overflow-hidden" value="tts">
        <TTSSettings serviceTabs={serviceTabs()} />
      </TabsContent>
      <TabsContent class="min-h-0 min-w-0 overflow-hidden" value="ocr">
        <OCRSettings serviceTabs={serviceTabs()} />
      </TabsContent>
    </Tabs>
  );
};

export default ServiceSettings;
