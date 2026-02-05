use tauri::{Manager, WindowEvent};
use tauri_plugin_custom_window::{show_main_window, MAIN_WINDOW_LABEL};

#[cfg(target_os = "macos")]
mod setup;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();

            let main_window = app
                .get_webview_window(MAIN_WINDOW_LABEL)
                .expect("translator window missing");

            #[cfg(target_os = "macos")]
            setup::platform(&app_handle, main_window.clone());

            Ok(())
        })
        .plugin(tauri_plugin_custom_window::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_process::init())
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                let _ = window.hide();
                api.prevent_close();
            }
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application");

    app.run(|app_handle, event| match event {
        #[cfg(target_os = "macos")]
        tauri::RunEvent::Reopen { .. } => {
            show_main_window(app_handle);
        }
        _ => {
            let _ = app_handle;
        }
    });
}
