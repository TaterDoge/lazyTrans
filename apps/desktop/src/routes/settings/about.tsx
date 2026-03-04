import { createFileRoute } from "@tanstack/solid-router";
import AboutSettings from "../../features/settings/pages/about";

export const Route = createFileRoute("/settings/about")({
  component: AboutSettings,
});
