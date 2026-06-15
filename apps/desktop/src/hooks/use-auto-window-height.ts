import { PhysicalPosition, PhysicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { currentMonitor, monitorFromPoint } from "@tauri-apps/api/window";
import { onCleanup, onMount } from "solid-js";
import { WINDOW_CONFIG, type WindowLabel } from "../config/window.config";
import {
  type Rect,
  resolveResizedWindowPosition,
  toIntegerPoint,
  type WindowPositionMode,
} from "../lib/utils/window-position";

type UseAutoWindowHeightOptions = {
  getContainer: () => HTMLElement | null;
  getContentHeight?: () => number | null | undefined;
  getObservedElements?: () => Array<HTMLElement | null | undefined>;
  getPositionMode?: () => WindowPositionMode | Promise<WindowPositionMode>;
  maxHeightRatio?: number;
};

function resolveWindowWidth(label: string, fallbackWidth: number) {
  if (label in WINDOW_CONFIG) {
    return WINDOW_CONFIG[label as WindowLabel].width ?? fallbackWidth;
  }

  return fallbackWidth;
}

function resolveContentHeight(
  container: HTMLElement,
  getContentHeight?: () => number | null | undefined
) {
  const measuredContentHeight = getContentHeight?.();

  if (
    typeof measuredContentHeight === "number" &&
    Number.isFinite(measuredContentHeight)
  ) {
    return Math.ceil(measuredContentHeight);
  }

  return Math.ceil(container.scrollHeight);
}

function resolveMaxInnerHeight(
  workArea: Rect,
  chromeHeight: number,
  maxHeightRatio: number
) {
  const normalizedRatio = Number.isFinite(maxHeightRatio)
    ? Math.max(0, maxHeightRatio)
    : 1;
  const maxHeightByRatio = Math.floor(workArea.height * normalizedRatio);
  const maxHeightByWorkArea = workArea.height - chromeHeight;

  return Math.max(1, Math.min(maxHeightByRatio, maxHeightByWorkArea));
}

function getWorkArea(monitor: Awaited<ReturnType<typeof currentMonitor>>) {
  if (!monitor) {
    return null;
  }

  return {
    x: monitor.workArea.position.x,
    y: monitor.workArea.position.y,
    width: monitor.workArea.size.width,
    height: monitor.workArea.size.height,
  } satisfies Rect;
}

async function resolveWorkAreaForWindow(position: { x: number; y: number }) {
  const monitor =
    (await monitorFromPoint(position.x, position.y).catch(() => null)) ??
    (await currentMonitor().catch(() => null));

  return getWorkArea(monitor);
}

export function useAutoWindowHeight({
  getContainer,
  getContentHeight,
  getObservedElements,
  getPositionMode,
  maxHeightRatio = 0.5,
}: UseAutoWindowHeightOptions) {
  const currentWindow = getCurrentWebviewWindow();
  onMount(() => {
    let disposed = false;
    let syncing = false;
    let syncPending = false;
    let observer: ResizeObserver | null = null;

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

        const scaleFactor = await currentWindow.scaleFactor();
        const innerSize = await currentWindow.innerSize();
        const outerSize = await currentWindow.outerSize();
        const position = await currentWindow.outerPosition();
        const workArea = await resolveWorkAreaForWindow(position);

        if (!workArea) {
          return;
        }

        const contentHeight = resolveContentHeight(container, getContentHeight);
        const targetWidth = resolveWindowWidth(
          currentWindow.label,
          innerSize.width / scaleFactor
        );
        const targetInnerWidth = Math.max(
          1,
          Math.round(targetWidth * scaleFactor)
        );
        const targetContentHeight = Math.max(
          1,
          Math.ceil(contentHeight * scaleFactor)
        );
        const chromeHeight = Math.max(0, outerSize.height - innerSize.height);
        const targetMaxInnerHeight = resolveMaxInnerHeight(
          workArea,
          chromeHeight,
          maxHeightRatio
        );
        const targetInnerHeight = Math.min(
          targetContentHeight,
          targetMaxInnerHeight
        );
        const targetOuterSize = {
          width:
            targetInnerWidth + Math.max(0, outerSize.width - innerSize.width),
          height: targetInnerHeight + chromeHeight,
        };
        const positionMode = (await getPositionMode?.()) ?? "mouse";
        const targetPosition = toIntegerPoint(
          resolveResizedWindowPosition(
            positionMode,
            position,
            targetOuterSize,
            workArea
          )
        );

        await currentWindow.setSizeConstraints({
          maxHeight: Math.max(
            1,
            Math.floor(targetMaxInnerHeight / scaleFactor)
          ),
        });

        const shouldResize =
          innerSize.width !== targetInnerWidth ||
          innerSize.height !== targetInnerHeight;
        const shouldReposition =
          targetPosition.x !== position.x || targetPosition.y !== position.y;

        if (shouldResize) {
          await currentWindow.setSize(
            new PhysicalSize(targetInnerWidth, targetInnerHeight)
          );
        }

        if (shouldReposition || shouldResize) {
          await currentWindow.setPosition(
            new PhysicalPosition(targetPosition.x, targetPosition.y)
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

    const scheduleWindowHeightSync = () => {
      requestAnimationFrame(() => {
        if (!disposed) {
          syncWindowHeight().catch(console.error);
        }
      });
    };

    const observeElements = () => {
      observer?.disconnect();
      observer = new ResizeObserver(() => {
        scheduleWindowHeightSync();
      });

      const container = getContainer();
      const observedElements = [container, ...(getObservedElements?.() ?? [])];
      for (const element of observedElements) {
        if (element) {
          observer.observe(element);
        }
      }
    };

    observeElements();
    scheduleWindowHeightSync();

    onCleanup(() => {
      disposed = true;
      observer?.disconnect();
    });
  });
}
