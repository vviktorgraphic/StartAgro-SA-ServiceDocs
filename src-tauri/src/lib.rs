use std::fs;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn read_pdf_bytes(path: String) -> Result<Vec<u8>, String> {

    fs::read(path)
        .map_err(|e| e.to_string())

}

#[derive(serde::Serialize)]
struct ScanResult {
    pdf_count: usize,
    image_count: usize,
    pdf_files: Vec<String>,
    image_files: Vec<String>,
}

#[tauri::command]
fn scan_documents(folder: String) -> ScanResult {

    println!("Indexelés indult: {}", folder);

    let mut pdf_count = 0;
    let mut image_count = 0;

    let mut pdf_files: Vec<String> = Vec::new();
    let mut image_files: Vec<String> = Vec::new();

    if let Ok(entries) = fs::read_dir(folder) {

        for entry in entries.flatten() {

            let path = entry.path();

            if let Some(ext) = path.extension() {

                let ext = ext.to_string_lossy().to_lowercase();

                match ext.as_str() {

                    "pdf" => {

                        pdf_count += 1;

                        pdf_files.push(
                            path.to_string_lossy().to_string()
                        );

                    }

                    "jpg" | "jpeg" => {

                        image_count += 1;

                        image_files.push(
                            path.to_string_lossy().to_string()
                        );

                    }

                    _ => {}

                }

            }

        }

    }

    ScanResult {

        pdf_count,
        image_count,
        pdf_files,
        image_files,

    }

}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            scan_documents,
            read_pdf_bytes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}