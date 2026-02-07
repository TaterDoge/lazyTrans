import { createFileRoute } from "@tanstack/solid-router";
import GeneralSettings from "../../features/settings/pages/general";

export const Route = createFileRoute("/settings/")({
  component: GeneralSettings,
});
