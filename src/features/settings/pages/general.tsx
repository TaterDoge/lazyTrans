function GeneralSettings() {
  return (
    <div>
      <h2 class="mb-6 font-bold text-2xl text-gray-800 dark:text-white">
        通用设置
      </h2>

      <div class="space-y-6">
        <section class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 class="mb-4 font-semibold text-gray-800 text-lg dark:text-white">
            启动选项
          </h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label
                class="cursor-pointer text-gray-700 dark:text-gray-300"
                for="auto-start"
              >
                开机自启动
              </label>
              <input
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="auto-start"
                type="checkbox"
              />
            </div>

            <div class="flex items-center justify-between">
              <label
                class="cursor-pointer text-gray-700 dark:text-gray-300"
                for="minimize-tray"
              >
                启动时最小化到托盘
              </label>
              <input
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="minimize-tray"
                type="checkbox"
              />
            </div>
          </div>
        </section>

        <section class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 class="mb-4 font-semibold text-gray-800 text-lg dark:text-white">
            翻译设置
          </h3>

          <div class="space-y-4">
            <div>
              <label
                class="mb-2 block font-medium text-gray-700 text-sm dark:text-gray-300"
                for="target-lang"
              >
                默认目标语言
              </label>
              <select
                class="w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                id="target-lang"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>

            <div class="flex items-center justify-between">
              <label
                class="cursor-pointer text-gray-700 dark:text-gray-300"
                for="auto-detect"
              >
                自动检测语言
              </label>
              <input
                checked
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="auto-detect"
                type="checkbox"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default GeneralSettings;
