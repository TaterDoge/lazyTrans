import { Store } from "@tauri-apps/plugin-store";

const STORE_FILE = "settings.json";

let store: Store | null = null;

/** 获取共享的 Tauri Store 实例（懒加载单例） */
export async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load(STORE_FILE);
  }
  return store;
}

/** 子 store 需要实现的接口 */
export interface SettingsModule {
  /** 从持久化存储加载数据到内存 signal */
  load(store: Store): Promise<void>;
}
