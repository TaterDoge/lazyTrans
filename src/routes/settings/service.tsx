import { createFileRoute } from "@tanstack/solid-router";
import ServiceSettings from "../../features/settings/pages/service";

export const Route = createFileRoute("/settings/service")({
  component: ServiceSettings,
});
