import { Link, Outlet } from "@tanstack/solid-router";
import { For } from "solid-js";
import { settingsMenuItems } from "./routes";

function SettingsLayout() {
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
              {(item) => (
                <li>
                  <Link
                    activeOptions={{ exact: true }}
                    activeProps={{
                      class:
                        "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                    }}
                    class="block rounded-lg px-4 py-2.5 font-medium text-sm transition-colors"
                    inactiveProps={{
                      class:
                        "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                    }}
                    to={item.path}
                  >
                    {item.label}
                  </Link>
                </li>
              )}
            </For>
          </ul>
        </nav>
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
