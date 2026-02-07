import { createRootRoute, Outlet } from "@tanstack/solid-router";

function RootLayout() {
  return <Outlet />;
}

export const Route = createRootRoute({
  component: RootLayout,
});
