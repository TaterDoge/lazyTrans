import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { generalStore } from "../stores/settings/general.store";

type ResolvedTheme = "light" | "dark";

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function useTheme() {
  const [systemTheme, setSystemTheme] = createSignal<ResolvedTheme>(
    getSystemTheme()
  );

  createEffect(() => {
    const theme = generalStore.theme;

    if (theme !== "system") {
      return;
    }

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setSystemTheme(getSystemTheme());

    syncSystemTheme();
    const handler = () => syncSystemTheme();
    mq.addEventListener("change", handler);
    onCleanup(() => mq.removeEventListener("change", handler));
  });

  const theme = createMemo<ResolvedTheme>(() => {
    const themeSetting = generalStore.theme;

    return themeSetting === "system" ? systemTheme() : themeSetting;
  });

  createEffect(() => {
    document.documentElement.classList.toggle("dark", theme() === "dark");
  });

  return theme;
}
