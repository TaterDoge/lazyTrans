import { createFileRoute } from "@tanstack/solid-router";
import Translator from "../features/translator";

export const Route = createFileRoute("/")({
  component: Translator,
});
