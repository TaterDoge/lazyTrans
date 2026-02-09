import { createRootRoute, Outlet } from "@tanstack/solid-router";
import { useGlobalShortcut } from "../hooks/use-global-shortcut";
import { useTray } from "../hooks/use-tray";

function RootLayout() {
  useTray();
  useGlobalShortcut();
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootLayout,
});
