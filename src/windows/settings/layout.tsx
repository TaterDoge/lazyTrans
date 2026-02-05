import { A, type RouteSectionProps, useLocation } from "@solidjs/router";
import { For } from "solid-js";
import { useTray } from "../../hooks/use-tray";
import { settingsMenuItems } from "./routes";

function SettingsLayout(props: RouteSectionProps) {
  const location = useLocation();
  useTray();

  return (
    <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside class="flex w-56 flex-col border-gray-200 border-r bg-white dark:border-gray-700 dark:bg-gray-800">
        <div class="border-gray-200 border-b p-4 dark:border-gray-700">
          <h1 class="font-semibold text-gray-800 text-lg dark:text-white">
            设置
          </h1>
        </div>

        <nav class="flex-1 py-4">
          <ul class="space-y-1 px-2">
            <For each={settingsMenuItems}>
              {(item) => {
                const isActive = () => location.pathname === item.path;

                return (
                  <li>
                    <A
                      class={`block rounded-lg px-4 py-2.5 font-medium text-sm transition-colors ${
                        isActive()
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                      end
                      href={item.path}
                    >
                      {item.label}
                    </A>
                  </li>
                );
              }}
            </For>
          </ul>
        </nav>
      </aside>

      <main class="flex-1 overflow-auto">
        <div class="p-8">{props.children}</div>
      </main>
    </div>
  );
}

export default SettingsLayout;
