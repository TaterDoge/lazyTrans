import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { createSignal } from "solid-js";
import { Textarea } from "@/components/ui/textarea";
import HoverWrapper from "../../components/hover-wrapper";
import { useAutoWindowHeight } from "../../hooks/use-auto-window-height";
import { useWindowShortcuts } from "../../hooks/use-window-shortcuts";
import { useI18n } from "../../i18n";
import { cn } from "../../utils";
import {
  hideAllWindows,
  hideWindow,
  setAlwaysOnTop,
  showWindow,
} from "../../utils/window";

function Translator() {
  const { t } = useI18n();
  const [sourceText, setSourceText] = createSignal("");
  const [pinned, setPinned] = createSignal(false);
  const [bouncing, setBouncing] = createSignal(false);
  const [copyStatus, setCopyStatus] = createSignal(false);
  const currentWindow = getCurrentWebviewWindow();
  let rootRef: HTMLDivElement | null = null;

  useAutoWindowHeight({
    getContainer: () => rootRef,
  });

  const handleDragStart = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    currentWindow.startDragging().catch(console.error);
  };

  const togglePinned = () => {
    const next = !pinned();
    setPinned(next);
    setAlwaysOnTop(next, "translator");
    setBouncing(true);
    setTimeout(() => setBouncing(false), 300);
  };

  useWindowShortcuts("translator", {
    "window.hide": () => hideWindow(),
    "translator.togglePinned": () => togglePinned(),
    "app.openSettings": async () => {
      await hideAllWindows();
      showWindow("settings");
    },
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
    <div
      class="flex w-full flex-col gap-y-2 rounded-xl bg-background p-2 text-foreground"
      ref={(el) => {
        rootRef = el;
      }}
    >
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
            onClick={async () => {
              await hideAllWindows();
              showWindow("settings");
            }}
            title={t("translator.settingsTooltip")}
          >
            <span class="icon-[stash--sliders-h] scale-125" />
          </HoverWrapper>
        </div>
      </div>

      <div class="rounded-lg border p-0.5">
        <Textarea
          autofocus
          class="field-sizing-content max-h-[350px] min-h-20 w-full resize-none overflow-y-auto border-none px-2 text-sm focus:outline-none"
          onInput={(e) => setSourceText(e.currentTarget.value)}
          value={sourceText()}
        />

        {/* 翻译内容源工具栏 */}
        <div class="flex justify-between p-2">
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
    </div>
  );
}

export default Translator;
