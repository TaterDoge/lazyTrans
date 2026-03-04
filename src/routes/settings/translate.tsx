import { createFileRoute } from "@tanstack/solid-router";
import TranslateSettings from "../../features/settings/pages/translate";

export const Route = createFileRoute("/settings/translate")({
  component: TranslateSettings,
});
