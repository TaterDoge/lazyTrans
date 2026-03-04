import { For, Show } from "solid-js";
import { useI18n } from "../../../../i18n";
import { SettingItemRenderer } from "../../components/setting-item";
import type { DictionaryLeafKey } from "./config";
import { generalSettingGroups } from "./groups";

function GeneralSettings() {
  const { t } = useI18n();

  return (
    <div class="space-y-6">
      <For each={generalSettingGroups}>
        {(group) => (
          <>
            <Show when={group.titleKey}>
              <h3 class="font-medium text-muted-foreground text-sm">
                {t(group.titleKey as DictionaryLeafKey)}
              </h3>
            </Show>

            <section class="space-y-4 rounded-lg border p-6">
              <For each={group.items}>
                {(item) => <SettingItemRenderer item={item} />}
              </For>
            </section>
          </>
        )}
      </For>
    </div>
  );
}

export default GeneralSettings;
