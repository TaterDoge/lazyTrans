import { createRootRoute, Outlet } from "@tanstack/solid-router";
import { useAppShortcuts } from "../hooks/use-app-shortcuts";

function RootLayout() {
  useAppShortcuts();
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootLayout,
});
