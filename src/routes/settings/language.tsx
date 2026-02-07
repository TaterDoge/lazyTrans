import { createFileRoute } from "@tanstack/solid-router";
import LanguageSettings from "../../features/settings/pages/language";

export const Route = createFileRoute("/settings/language")({
  component: LanguageSettings,
});
