import { createFileRoute } from "@tanstack/solid-router";
import AppearanceSettings from "../../features/settings/pages/appearance";

export const Route = createFileRoute("/settings/appearance")({
  component: AppearanceSettings,
});
