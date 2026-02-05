import { invoke } from "@tauri-apps/api/core";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { createSignal } from "solid-js";

const COMMAND = {
  HIDE_WINDOW: "plugin:custom-window|hide_window",
};

function TranslatorApp() {
  const [text, setText] = createSignal("");
  const currentWindow = getCurrentWebviewWindow();

  const handleClose = () => {
    invoke(COMMAND.HIDE_WINDOW)
      .catch(() => currentWindow.hide())
      .catch(console.error);
  };

  const handleDragStart = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    currentWindow.startDragging().catch(console.error);
  };

  return (
    <div class="flex h-screen flex-col bg-white dark:bg-gray-800">
      <div
        class="flex items-center justify-between border-b p-4 dark:border-gray-700"
        onPointerDown={handleDragStart}
      >
        <h2 class="font-semibold text-gray-900 text-lg dark:text-white">
          翻译
        </h2>
        <button
          class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={handleClose}
          onPointerDown={(event) => event.stopPropagation()}
          type="button"
        >
          ✕
        </button>
      </div>

      <div class="flex-1 space-y-4 p-4">
        <textarea
          class="h-32 w-full resize-none rounded-lg border p-3 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          onInput={(e) => setText(e.currentTarget.value)}
          placeholder="输入要翻译的文本..."
          value={text()}
        />
      </div>

      <div class="border-t p-4 dark:border-gray-700">
        <button
          class="w-full rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
          type="button"
        >
          翻译
        </button>
      </div>
    </div>
  );
}

export default TranslatorApp;
