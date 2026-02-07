function AppearanceSettings() {
  return (
    <div>
      <h2 class="mb-6 font-bold text-2xl text-gray-800 dark:text-white">
        外观设置
      </h2>

      <div class="space-y-6">
        <section class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 class="mb-4 font-semibold text-gray-800 text-lg dark:text-white">
            主题
          </h3>

          <div class="flex gap-4">
            <button
              class="max-w-[120px] flex-1 rounded-lg border-2 border-blue-500 bg-white p-4 text-center dark:bg-gray-700"
              type="button"
            >
              <div class="mx-auto mb-2 h-12 w-12 rounded-full border border-gray-200 bg-white" />
              <span class="font-medium text-gray-700 text-sm dark:text-gray-300">
                浅色
              </span>
            </button>

            <button
              class="max-w-[120px] flex-1 rounded-lg border-2 border-transparent bg-white p-4 text-center hover:border-gray-300 dark:bg-gray-700 dark:hover:border-gray-600"
              type="button"
            >
              <div class="mx-auto mb-2 h-12 w-12 rounded-full border border-gray-700 bg-gray-800" />
              <span class="font-medium text-gray-700 text-sm dark:text-gray-300">
                深色
              </span>
            </button>

            <button
              class="max-w-[120px] flex-1 rounded-lg border-2 border-transparent bg-white p-4 text-center hover:border-gray-300 dark:bg-gray-700 dark:hover:border-gray-600"
              type="button"
            >
              <div class="mx-auto mb-2 h-12 w-12 rounded-full border border-gray-300 bg-gradient-to-r from-white to-gray-800" />
              <span class="font-medium text-gray-700 text-sm dark:text-gray-300">
                跟随系统
              </span>
            </button>
          </div>
        </section>

        <section class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 class="mb-4 font-semibold text-gray-800 text-lg dark:text-white">
            窗口
          </h3>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <label
                class="cursor-pointer text-gray-700 dark:text-gray-300"
                for="window-shadow"
              >
                显示窗口阴影
              </label>
              <input
                checked
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="window-shadow"
                type="checkbox"
              />
            </div>

            <div class="flex items-center justify-between">
              <label
                class="cursor-pointer text-gray-700 dark:text-gray-300"
                for="window-top"
              >
                窗口置顶
              </label>
              <input
                class="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                id="window-top"
                type="checkbox"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AppearanceSettings;
