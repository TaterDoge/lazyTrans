import { LogicalPosition, LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { currentMonitor } from "@tauri-apps/api/window";
import { onCleanup, onMount } from "solid-js";
import { WINDOW_CONFIG, type WindowLabel } from "../config/window.config";

type UseAutoWindowHeightOptions = {
  getContainer: () => HTMLElement | null;
  maxHeightRatio?: number;
};

function resolveWindowWidth(label: string, fallbackWidth: number) {
  if (label in WINDOW_CONFIG) {
    return WINDOW_CONFIG[label as WindowLabel].width ?? fallbackWidth;
  }

  return fallbackWidth;
}

function resolveWindowY(
  currentY: number,
  targetHeight: number,
  workAreaTop: number,
  workAreaBottom: number
) {
  if (currentY < workAreaTop) {
    return workAreaTop;
  }

  if (currentY + targetHeight > workAreaBottom) {
    return workAreaBottom - targetHeight;
  }

  return currentY;
}

export function useAutoWindowHeight({
  getContainer,
  maxHeightRatio = 0.5,
}: UseAutoWindowHeightOptions) {
  const currentWindow = getCurrentWebviewWindow();
  onMount(() => {
    let disposed = false;
    let maxHeight = Number.POSITIVE_INFINITY;
    const workAreaTop = Number.NEGATIVE_INFINITY;
    const workAreaBottom = Number.POSITIVE_INFINITY;
    let syncing = false;
    let syncPending = false;

    const syncWindowHeight = async () => {
      if (syncing) {
        syncPending = true;
        return;
      }

      syncing = true;

      try {
        const container = getContainer();
        if (!container) {
          return;
        }

        const contentHeight = Math.ceil(container.scrollHeight);
        const size = await currentWindow.innerSize();
        const position = await currentWindow.outerPosition();
        const targetWidth = resolveWindowWidth(currentWindow.label, size.width);

        const maxVisibleHeight = Math.max(0, workAreaBottom - workAreaTop);
        const targetHeight = Math.min(
          contentHeight,
          maxHeight,
          maxVisibleHeight
        );

        const targetY = resolveWindowY(
          position.y,
          targetHeight,
          workAreaTop,
          workAreaBottom
        );

        if (targetY !== position.y) {
          await currentWindow.setPosition(
            new LogicalPosition(position.x, targetY)
          );
        }

        if (size.height !== targetHeight) {
          await currentWindow.setSize(
            new LogicalSize(targetWidth, targetHeight)
          );
        }
      } finally {
        syncing = false;

        if (syncPending && !disposed) {
          syncPending = false;
          syncWindowHeight().catch(console.error);
        }
      }
    };

    const observer = new ResizeObserver(() => {
      syncWindowHeight().catch(console.error);
    });

    const container = getContainer();
    if (container) {
      observer.observe(container);
    }

    currentMonitor()
      .then((monitor) => {
        if (disposed || !monitor) {
          return;
        }

        maxHeight = Math.floor(monitor.workArea.size.height * maxHeightRatio);
        return currentWindow.setSizeConstraints({ maxHeight });
      })
      .finally(() => {
        if (!disposed) {
          syncWindowHeight().catch(console.error);
        }
      });

    onCleanup(() => {
      disposed = true;
      observer.disconnect();
    });
  });
}
