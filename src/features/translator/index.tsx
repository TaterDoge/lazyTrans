import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { createSignal } from "solid-js";
import { openSettings, pinTranslator } from "../../actions/window";
import HoverWrapper from "../../components/hover-wrapper";
import { useWindowShortcuts } from "../../hooks/use-window-shortcuts";
import { useI18n } from "../../i18n";
import { cn } from "../../utils";
import { hideWindow } from "../../utils/window";

function Translator() {
  const { t } = useI18n();
  const [sourceText, setSourceText] = createSignal("");
  const [pinned, setPinned] = createSignal(false);
  const [bouncing, setBouncing] = createSignal(false);
  const [copyStatus, setCopyStatus] = createSignal(false);
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

  useWindowShortcuts("translator", {
    "window.hide": () => hideWindow(),
    "translator.togglePinned": () => togglePinned(),
    "app.openSettings": () => openSettings(),
  });

  // 朗读翻译内容
  const handleRead = () => {
    console.log("朗读翻译内容");
  };

  // 复制翻译内容
  const handleCopy = async () => {
    setCopyStatus(true);
    await writeText(sourceText());
    setTimeout(() => setCopyStatus(false), 2000);
  };

  return (
    <div class="flex size-full flex-col gap-y-2 rounded-xl bg-white p-2">
      {/* 顶部工具栏 */}
      <div
        class="flex items-center justify-between"
        onPointerDown={handleDragStart}
      >
        <HoverWrapper onClick={togglePinned}>
          <span
            class={cn("scale-125", {
              "icon-[stash--pin-thumbtack]": !pinned(),
              "icon-[stash--pin-thumbtack-solid] text-blue-400": pinned(),
              "animate-wiggle": bouncing(),
            })}
          />
        </HoverWrapper>

        {/* 右侧工具按钮 */}
        <div class="flex gap-x-2">
          <HoverWrapper
            onClick={openSettings}
            title={t("translator.settingsTooltip")}
          >
            <span class="icon-[stash--sliders-h] scale-125" />
          </HoverWrapper>
        </div>
      </div>

      <div class="rounded-lg bg-zinc-100 p-1">
        <textarea
          class="min-h-14 w-full resize-none px-1 text-sm focus:outline-none"
          onInput={(e) => setSourceText(e.currentTarget.value)}
          value={sourceText()}
        />

        {/* 翻译内容源工具栏 */}
        <div class="flex justify-between">
          <div class="flex gap-x-1">
            {/* 朗读 */}
            <HoverWrapper onClick={handleRead}>
              <span class="icon-[tabler--volume]" />
            </HoverWrapper>

            {/* 复制 */}
            <HoverWrapper onClick={handleCopy}>
              <span
                class={cn({
                  "icon-[tabler--copy]": !copyStatus(),
                  "icon-[line-md--circle-twotone-to-confirm-circle-transition] text-green-500":
                    copyStatus(),
                })}
              />
            </HoverWrapper>
          </div>
        </div>
      </div>

      <div class="border-t p-4 dark:border-gray-700">
        <button
          class="w-full rounded-lg bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700"
          type="button"
        >
          {t("translator.translate")}
        </button>
      </div>
    </div>
  );
}

export default Translator;
