import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/solid-router";
import { render } from "solid-js/web";
import "./index.css";
import { routeTree } from "./routeTree.gen";

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
  return <RouterProvider router={router} />;
}

render(() => <App />, document.getElementById("root") as HTMLElement);
