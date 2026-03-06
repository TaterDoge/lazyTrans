import { Link, Outlet } from "@tanstack/solid-router";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { For } from "solid-js";
import { useWindowShortcuts } from "@/hooks/use-window-shortcuts";
import { hideWindow } from "@/utils/window";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../../components/ui/sidebar";
import { useI18n } from "../../i18n";
import { settingsMenuItems } from "./config";

function SettingsLayout() {
  const { t } = useI18n();
  const currentWindow = getCurrentWebviewWindow();

  useWindowShortcuts("translator", {
    "window.hide": () => hideWindow(),
  });

  const handleDragStart = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }
    currentWindow.startDragging().catch(console.error);
  };

  return (
    <SidebarProvider class="h-screen bg-background text-foreground [--sidebar-width:12rem]!">
      <Sidebar collapsible="icon">
        <SidebarHeader
          class="cursor-grab pt-10 active:cursor-grabbing"
          onPointerDown={handleDragStart}
        >
          <div class="flex items-center justify-center gap-2 px-2 py-1">
            <div class="font-semibold text-sm">logo</div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {/* <SidebarGroupLabel>{t("settings.title")}</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                <For each={settingsMenuItems}>
                  {(item) => (
                    <SidebarMenuItem class="flex justify-center">
                      <SidebarMenuButton
                        activeOptions={{ exact: item.id === "general" }}
                        activeProps={{
                          class:
                            "bg-sidebar-accent text-sidebar-accent-foreground",
                        }}
                        as={Link}
                        class="h-12 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-9!"
                        to={item.to}
                      >
                        <span
                          class={`${item.icon} size-5 shrink-0 group-data-[collapsible=icon]:size-5`}
                        />
                        <span class="text-base">{t(item.labelKey)}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </For>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header
          class="flex h-12 shrink-0 cursor-grab items-center gap-2 border-b px-4 active:cursor-grabbing"
          onPointerDown={handleDragStart}
        >
          <SidebarTrigger class="cursor-pointer" />
        </header>
        <main class="flex-1 overflow-y-scroll p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default SettingsLayout;
