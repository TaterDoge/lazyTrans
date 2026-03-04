/**
 * 服务设置页面 - 入口 (带 Tab 切换)
 */

import { For, type VoidComponent } from "solid-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import { SERVICE_TABS } from "./config";
import { OCRSettings } from "./ocr";
import { TranslateSettings } from "./translate";
import { TTSSettings } from "./tts";

const ServiceSettings: VoidComponent = () => {
  const { t } = useI18n();

  return (
    <div class="space-y-6">
      {/* 页面标题 */}
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-lg">{t("settings.service.title")}</h2>
      </div>

      {/* Tab 切换 */}
      <Tabs class="w-full" defaultValue="translate">
        <TabsList>
          <For each={SERVICE_TABS}>
            {(tab) => (
              <TabsTrigger value={tab.id}>
                <span class={tab.icon} />
                {t(tab.labelKey)}
              </TabsTrigger>
            )}
          </For>
        </TabsList>

        <TabsContent value="translate">
          <TranslateSettings />
        </TabsContent>
        <TabsContent value="tts">
          <TTSSettings />
        </TabsContent>
        <TabsContent value="ocr">
          <OCRSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceSettings;
