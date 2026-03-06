import { getStore, type SettingsModule } from "./base";
import { generalActions } from "./general.store";
import { translateActions } from "./services/translate.store";
import { shortcutsActions } from "./shortcuts.store";

type SettingsInitMode = "critical" | "all";

type InitSettingsStoreOptions = {
  mode?: SettingsInitMode;
  scheduleDeferred?: boolean;
};

const criticalModules: SettingsModule[] = [generalActions, shortcutsActions];
const deferredModules: SettingsModule[] = [translateActions];

const loadedModules = new Set<SettingsModule>();
let criticalInitPromise: Promise<void> | null = null;
let allInitPromise: Promise<void> | null = null;
let deferredScheduled = false;

async function loadModules(modules: SettingsModule[]) {
  const store = await getStore();
  await Promise.all(
    modules.map(async (module) => {
      if (loadedModules.has(module)) {
        return;
      }
      await module.load(store);
      loadedModules.add(module);
    })
  );
}

function ensureCriticalModulesLoaded() {
  if (!criticalInitPromise) {
    criticalInitPromise = loadModules(criticalModules);
  }
  return criticalInitPromise;
}

function ensureAllModulesLoaded() {
  if (!allInitPromise) {
    allInitPromise = (async () => {
      await ensureCriticalModulesLoaded();
      await loadModules(deferredModules);
    })();
  }
  return allInitPromise;
}

function scheduleDeferredSettingsLoad() {
  if (deferredScheduled) {
    return;
  }

  deferredScheduled = true;
  setTimeout(() => {
    ensureAllModulesLoaded().catch((error) =>
      console.error("[settings] 延迟加载失败", error)
    );
  }, 0);
}

export async function initSettingsStore(
  options: InitSettingsStoreOptions = {}
) {
  const mode = options.mode ?? "critical";
  const scheduleDeferred = options.scheduleDeferred ?? mode === "critical";

  if (mode === "all") {
    await ensureAllModulesLoaded();
    return;
  }

  await ensureCriticalModulesLoaded();

  if (scheduleDeferred) {
    scheduleDeferredSettingsLoad();
  }
}
