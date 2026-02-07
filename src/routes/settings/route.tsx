import { createFileRoute } from "@tanstack/solid-router";
import SettingsLayout from "../../features/settings/layout";

export const Route = createFileRoute("/settings")({
  component: SettingsLayout,
});
