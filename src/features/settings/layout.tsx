import { Link, Outlet } from "@tanstack/solid-router";
import { For, onMount } from "solid-js";
import { useI18n } from "../../i18n";
import { initSettingsStore } from "../../stores/settings";
import { cn } from "../../utils";
import { settingsMenuItems } from "./config";

function SettingsLayout() {
  const { t } = useI18n();

  onMount(() => {
    initSettingsStore().catch((err) => {
      console.warn("initSettingsStore failed", err);
    });
  });

  return (
    <div class="flex h-screen bg-gray-50">
      <aside class="flex w-56 flex-col bg-white shadow-xl">
        <div class="flex">
          <div>LOGO</div>
          <div>lazyTrans</div>
        </div>

        <ul class="flex-1 space-y-1 px-2 py-4">
          <For each={settingsMenuItems}>
            {(item) => (
              <li>
                <Link
                  activeOptions={{ exact: true }}
                  activeProps={{
                    class: "bg-blue-50 text-blue-500",
                  }}
                  class="flex items-center gap-x-2 rounded-lg px-4 py-2.5 font-medium text-sm transition-colors"
                  inactiveProps={{
                    class: "hover:bg-gray-100",
                  }}
                  to={item.to}
                >
                  <span class={cn("size-5", item.icon)} />
                  <span>{t(item.labelKey)}</span>
                </Link>
              </li>
            )}
          </For>
        </ul>
      </aside>

      <main class="flex-1 overflow-auto">
        <div class="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default SettingsLayout;
