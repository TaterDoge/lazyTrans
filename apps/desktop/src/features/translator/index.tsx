import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { createSignal, onMount } from "solid-js";
import { Textarea } from "@/components/ui/textarea";
import { initSettingsStore } from "@/stores/settings";
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
import { TranslateResultList } from "./components";

/**
 * 翻译器主组件
 * 负责输入框、工具栏和窗口控制
 * 翻译结果展示由 TranslateResultList 组件处理
 */
function Translator() {
  const { t } = useI18n();
  const [inputText, setInputText] = createSignal("");
  const [translateText, setTranslateText] = createSignal("", {
    equals: false,
  });
  const [pinned, setPinned] = createSignal(false);
  const [bouncing, setBouncing] = createSignal(false);
  const [copyStatus, setCopyStatus] = createSignal(false);
  const [isComposing, setIsComposing] = createSignal(false);
  const currentWindow = getCurrentWebviewWindow();
  let rootRef: HTMLDivElement | null = null;

  useAutoWindowHeight({
    getContainer: () => rootRef,
  });

  onMount(() => {
    initSettingsStore({ mode: "all", scheduleDeferred: false }).catch(
      (error) => {
        console.error("[settings] translator 初始化失败", error);
      }
    );
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
    await writeText(inputText());
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

      {/* 输入区域 */}
      <div class="rounded-lg border p-0.5">
        <Textarea
          autofocus
          class="field-sizing-content max-h-[350px] min-h-20 w-full resize-none overflow-y-auto border-none px-2 text-sm focus:outline-none"
          onCompositionEnd={() => setIsComposing(false)}
          onCompositionStart={() => setIsComposing(true)}
          onInput={(e) => setInputText(e.currentTarget.value)}
          onKeyDown={(e) => {
            const isImeComposing =
              isComposing() || e.isComposing || e.keyCode === 229;
            if (e.key === "Enter" && !e.shiftKey && !isImeComposing) {
              e.preventDefault();
              setTranslateText(inputText());
            }
          }}
          value={inputText()}
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

      {/* 翻译结果列表 - 组件化，内部处理多服务翻译 */}
      <div class="rounded-lg border p-2">
        <TranslateResultList text={translateText()} />
      </div>
    </div>
  );
}

export default Translator;
