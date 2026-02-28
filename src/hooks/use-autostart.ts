import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import { createEffect } from "solid-js";
import { generalActions, generalStore } from "../stores/settings/general.store";

/**
 * 响应式同步开机自启状态：
 * - 初始化时从系统读取实际状态并同步到 store
 * - store.autoStart 变化时自动调用系统 API
 */
export function useAutoStart() {
  // 初始化：以系统实际状态为准，修正 store
  isEnabled()
    .then((enabled) => {
      if (enabled !== generalStore.autoStart) {
        generalActions.update({ autoStart: enabled });
      }
    })
    .catch((e) => console.error("[autostart] 读取开机自启状态失败:", e));

  // 响应式：store 变化时同步到系统
  createEffect(() => {
    const enabled = generalStore.autoStart;
    const promise = enabled ? enable() : disable();
    promise.catch((e) => console.error("[autostart] 设置开机自启失败:", e));
  });
}
