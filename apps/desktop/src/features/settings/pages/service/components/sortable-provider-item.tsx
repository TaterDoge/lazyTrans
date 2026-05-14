import { useSortable } from "@dnd-kit/solid/sortable";
import type { VoidComponent } from "solid-js";
import { Show } from "solid-js";
import { Switch } from "@/components/ui/switch";
import { getProviderMeta } from "@/services/translate/config";
import type { TranslateProvider } from "@/services/translate/types";
import { cn } from "@/utils";

interface SortableProviderItemProps {
  index: number;
  isEnabled: boolean;
  isSelected: boolean;
  onProviderClick: (providerId: TranslateProvider) => void;
  onToggleEnabled: (providerId: TranslateProvider) => void;
  providerId: TranslateProvider;
}

export const SortableProviderItem: VoidComponent<SortableProviderItemProps> = (
  props
) => {
  const meta = () => getProviderMeta(props.providerId);
  const { ref, handleRef, isDragging } = useSortable({
    get id() {
      return props.providerId;
    },
    get index() {
      return props.index;
    },
  });

  return (
    <div
      class={cn(
        "flex w-full items-center justify-between gap-1.5 rounded-md p-2 text-left transition-colors",
        props.isSelected && "bg-accent text-accent-foreground",
        !props.isSelected && "hover:bg-muted",
        isDragging() && "opacity-70"
      )}
      ref={ref}
    >
      <button
        aria-label="Reorder provider"
        class="inline-flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted active:cursor-grabbing"
        ref={handleRef}
        title="Reorder provider"
        type="button"
      >
        <span class="icon-[tabler--grip-vertical]" />
      </button>
      <button
        class="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
        onClick={() => props.onProviderClick(props.providerId)}
        type="button"
      >
        <Show when={meta()?.icon}>
          <span class={meta()?.icon} />
        </Show>
        <span class="font-medium text-sm">{meta()?.name}</span>
      </button>
      <div class="pointer-events-auto">
        <Switch
          checked={props.isEnabled}
          onChange={() => props.onToggleEnabled(props.providerId)}
        />
      </div>
    </div>
  );
};
