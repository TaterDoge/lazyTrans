import { createFileRoute } from "@tanstack/solid-router";
import ShortcutsSettings from "../../features/settings/pages/shortcuts";

export const Route = createFileRoute("/settings/shortcuts")({
  component: ShortcutsSettings,
});
