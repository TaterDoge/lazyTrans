import { exit } from "@tauri-apps/plugin-process";
import { hideAllWindows, showWindow } from "../utils/window";

export async function openSettings() {
  await hideAllWindows();
  showWindow("settings");
}

export function openTranslator() {
  showWindow("translator");
}

export function quitApp() {
  exit(0);
}
