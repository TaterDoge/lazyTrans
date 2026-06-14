import { useSortable } from "@dnd-kit/solid/sortable";
import { Show } from "solid-js";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ProviderMeta } from "@/services/translate-core";

interface SortableProviderItemProps<TProvider extends string> {
  displayName?: string;
  getProviderMeta: (providerId: TProvider) => ProviderMeta | undefined;
  index: number;
  isEnabled: boolean;
  isSelected: boolean;
  onProviderClick: (providerId: TProvider) => void;
  onToggleEnabled: (providerId: TProvider) => void;
  providerId: TProvider;
}

export const SortableProviderItem = <TProvider extends string>(
  props: SortableProviderItemProps<TProvider>
) => {
  const meta = () => props.getProviderMeta(props.providerId);
  const { ref, handleRef, isDragging } = useSortable({
    get id() {
      return props.providerId;
    },
    get index() {
      return props.index;
    },
  });

  return (
    <button
      class={cn(
        "flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-md p-2 text-left transition-colors",
        props.isSelected && "bg-accent text-accent-foreground",
        !props.isSelected && "hover:bg-muted",
        isDragging() && "opacity-70"
      )}
      onClick={() => {
        props.onProviderClick(props.providerId);
      }}
      ref={ref}
      type="button"
    >
      <span
        aria-hidden="true"
        class="inline-flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted active:cursor-grabbing"
        data-drag-handle
        ref={handleRef}
      >
        <span class="icon-[tabler--grip-vertical]" />
      </span>
      <span class="flex min-w-0 flex-1 items-center gap-2.5">
        <Show when={meta()?.icon}>
          <span class={meta()?.icon} />
        </Show>
        <span class="truncate font-medium text-sm">
          {props.displayName?.trim() || meta()?.name}
        </span>
      </span>
      <Switch
        checked={props.isEnabled}
        onChange={() => props.onToggleEnabled(props.providerId)}
      />
    </button>
  );
};
