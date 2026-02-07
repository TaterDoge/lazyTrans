import { For } from "solid-js";

function ShortcutsSettings() {
  const shortcuts = [
    { id: "translate", name: "翻译", defaultKey: "Ctrl+Shift+T" },
    { id: "screenshot", name: "截图翻译", defaultKey: "Ctrl+Shift+S" },
    { id: "copy", name: "复制结果", defaultKey: "Ctrl+C" },
    { id: "close", name: "关闭窗口", defaultKey: "Esc" },
  ];

  return (
    <div>
      <h2 class="mb-6 font-bold text-2xl text-gray-800 dark:text-white">
        快捷键设置
      </h2>

      <div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-sm dark:text-gray-300">
                功能
              </th>
              <th class="px-6 py-3 text-left font-semibold text-gray-700 text-sm dark:text-gray-300">
                快捷键
              </th>
              <th class="px-6 py-3 text-right font-semibold text-gray-700 text-sm dark:text-gray-300">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <For each={shortcuts}>
              {(shortcut) => (
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td class="px-6 py-4 text-gray-800 dark:text-gray-200">
                    {shortcut.name}
                  </td>
                  <td class="px-6 py-4">
                    <kbd class="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 font-mono text-gray-700 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {shortcut.defaultKey}
                    </kbd>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <button
                      class="px-3 py-1.5 font-medium text-blue-600 text-sm hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      type="button"
                    >
                      修改
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <p class="mt-4 text-gray-500 text-sm dark:text-gray-400">
        点击"修改"按钮，然后按下新的快捷键组合即可更改。
      </p>
    </div>
  );
}

export default ShortcutsSettings;
