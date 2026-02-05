use tauri::{AppHandle, WebviewWindow};
use tauri_nspanel::WebviewWindowExt;

pub fn platform(app_handle: &AppHandle, main_window: WebviewWindow) {
    let _ = app_handle.plugin(tauri_nspanel::init());
    let _ = main_window.to_panel();
}
