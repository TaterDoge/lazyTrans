import { createFileRoute } from "@tanstack/solid-router";
import TranslatorApp from "../features/translator";

export const Route = createFileRoute("/")({
  component: TranslatorApp,
});
