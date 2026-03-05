import { Store } from "@tauri-apps/plugin-store";
import {
  createStore,
  produce,
  reconcile,
  type SetStoreFunction,
} from "solid-js/store";

const STORE_FILE = "settings.json";

let store: Store | null = null;
export async function getStore(): Promise<Store> {
  if (!store) {
    store = await Store.load(STORE_FILE);
  }
  return store;
}
export interface SettingsModule {
  load(store: Store): Promise<void>;
  update(partial: unknown): Promise<void>;
}

export interface SettingsModuleResult<T extends object> {
  actions: SettingsModule & { update(partial: Partial<T>): Promise<void> };
  setStore: SetStoreFunction<T>;
  store: T;
}

export function createSettingsModule<T extends object>(
  key: string,
  defaults: T,
  options?: {
    onLoad?: (saved: T | null, defaults: T) => T;
  }
): SettingsModuleResult<T> {
  const [state, setState] = createStore<T>(defaults);
  let tauriStore: Store | null = null;

  const actions = {
    async load(s: Store) {
      tauriStore = s;
      const saved = await s.get<T>(key);
      const resolved = options?.onLoad
        ? options.onLoad(saved ?? null, defaults)
        : saved;
      if (resolved) {
        setState(reconcile(resolved));
      }
      s.onKeyChange<T>(key, (value) => {
        if (value) {
          setState(reconcile(value));
        }
      });
    },
    async update(partial: Partial<T>) {
      setState(produce((s) => Object.assign(s, partial)));
      await tauriStore?.set(key, state);
    },
  };

  return { store: state, setStore: setState, actions };
}
