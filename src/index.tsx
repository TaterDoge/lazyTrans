import {
  createHashHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/solid-router";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { onCleanup, onMount } from "solid-js";
import { render } from "solid-js/web";
import "./index.css";
import { routeTree } from "./routeTree.gen";
import { listenWindowVisibility } from "./utils/window";

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
  let unlisten: UnlistenFn | null = null;

  onMount(async () => {
    unlisten = await listenWindowVisibility();
  });

  onCleanup(() => {
    unlisten?.();
  });

  return <RouterProvider router={router} />;
}

render(() => <App />, document.getElementById("root") as HTMLElement);
