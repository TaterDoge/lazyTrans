import type { VoidComponent } from "solid-js";

import { Input } from "@/components/ui/input";

interface ProviderSearchBoxProps {
  onSearchChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export const ProviderSearchBox: VoidComponent<ProviderSearchBoxProps> = (
  props
) => (
  <div class="relative">
    <span class="icon-[tabler--search] pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      class="h-8 rounded-lg pl-8 text-sm"
      onInput={(event) => props.onSearchChange(event.currentTarget.value)}
      placeholder={props.placeholder}
      type="search"
      value={props.value}
    />
  </div>
);
