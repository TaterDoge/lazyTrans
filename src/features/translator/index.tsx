import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { createSignal } from "solid-js";
import { pinTranslator } from "../../actions/window";
import HoverWrapper from "../../components/hover-wrapper";
import { useWindowShortcut } from "../../hooks/use-window-shortcut";
import { cn } from "../../utils";

function TranslatorApp() {
  const [text, setText] = createSignal("");
  const [pinned, setPinned] = createSignal(false);
  const [bouncing, setBouncing] = createSignal(false);
  const currentWindow = getCurrentWebviewWindow();

  const handleDragStart = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    currentWindow.startDragging().catch(console.error);
  };

  const togglePinned = () => {
    const next = !pinned();
    setPinned(next);
    pinTranslator(next);
    setBouncing(true);
    setTimeout(() => setBouncing(false), 300);
  };

  useWindowShortcut({ key: "p", metaKey: true, handler: togglePinned });

  return (
    <div class="flex size-full flex-col rounded-xl bg-white">
      <div
        class="flex items-center justify-between p-2"
        onPointerDown={handleDragStart}
      >
        <HoverWrapper onClick={togglePinned}>
          <span
            class={cn({
              "icon-[stash--pin-thumbtack]": !pinned(),
              "icon-[stash--pin-thumbtack-solid] text-blue-400": pinned(),
              "animate-wiggle": bouncing(),
            })}
          />
        </HoverWrapper>
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
