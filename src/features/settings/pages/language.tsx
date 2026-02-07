import { For } from "solid-js";

function LanguageSettings() {
  const languages = [
    { code: "zh-CN", name: "简体中文", flag: "🇨🇳" },
    { code: "zh-TW", name: "繁體中文", flag: "🇹🇼" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
  ];

  return (
    <div>
      <h2 class="mb-6 font-bold text-2xl text-gray-800 dark:text-white">
        语言设置
      </h2>

      <section class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 class="mb-4 font-semibold text-gray-800 text-lg dark:text-white">
          界面语言
        </h3>

        <div class="space-y-2">
          <For each={languages}>
            {(lang) => (
              <label class="flex cursor-pointer items-center rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  checked={lang.code === "zh-CN"}
                  class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  name="language"
                  type="radio"
                  value={lang.code}
                />
                <span class="ml-3 text-2xl">{lang.flag}</span>
                <span class="ml-3 font-medium text-gray-700 dark:text-gray-300">
                  {lang.name}
                </span>
              </label>
            )}
          </For>
        </div>
      </section>

      <div class="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p class="text-blue-700 text-sm dark:text-blue-400">
          更改语言后需要重启应用才能生效。
        </p>
      </div>
    </div>
  );
}

export default LanguageSettings;
