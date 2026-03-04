import { createEffect, onCleanup } from "solid-js";
import { generalStore } from "../stores/settings/general.store";

export function useTheme() {
  createEffect(() => {
    const theme = generalStore.theme;
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      return;
    }

    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    // system: 跟随系统偏好
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    root.classList.toggle("dark", mq.matches);
    const handler = (e: MediaQueryListEvent) =>
      root.classList.toggle("dark", e.matches);
    mq.addEventListener("change", handler);
    onCleanup(() => mq.removeEventListener("change", handler));
  });
}
