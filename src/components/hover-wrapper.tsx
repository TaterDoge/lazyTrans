import { type JSX, splitProps } from "solid-js";
import { cn } from "../utils";

export default function HoverWrapper(
  props: { children: JSX.Element } & JSX.HTMLAttributes<HTMLDivElement>
) {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div
      class={cn(
        "flex items-center justify-center rounded-md p-1 transition-all duration-300 hover:bg-secondary",
        local.class
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
}
