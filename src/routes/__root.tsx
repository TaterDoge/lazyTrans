import { createRootRoute, Outlet } from "@tanstack/solid-router";
import { useTray } from "../hooks/use-tray";

function RootLayout() {
  useTray();
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootLayout,
});
