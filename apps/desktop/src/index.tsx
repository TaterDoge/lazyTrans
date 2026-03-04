import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/solid-router";
import { render } from "solid-js/web";
import { useTheme } from "./hooks/use-theme";
import { I18nProvider } from "./i18n";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import { initSettingsStore } from "./stores/settings";

const hideDockIcon = async () => {
  try {
    const app = await import("@tauri-apps/api/app");
    await app.setDockVisibility(false);
  } catch {
    return;
  }
};

hideDockIcon();

const hashHistory = createHashHistory();

export const router = createRouter({
  routeTree,
  history: hashHistory,
  trailingSlash: "never",
  defaultPreload: "intent",
});

declare module "@tanstack/solid-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  useTheme();

  return (
    <I18nProvider>
      <RouterProvider router={router} />
    </I18nProvider>
  );
}

async function bootstrap() {
  await initSettingsStore();

  render(() => <App />, document.getElementById("root") as HTMLElement);
}

bootstrap();
