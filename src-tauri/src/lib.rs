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
struct PdfFile {

    path: String,

    last_modified: u64,

    file_size: u64,

}

#[derive(serde::Serialize)]
struct ScanResult {

    pdf_count: usize,

    image_count: usize,

    pdf_files: Vec<PdfFile>,

    image_files: Vec<String>,

}

#[tauri::command]
fn scan_documents(folder: String) -> ScanResult {

    let mut pdf_count = 0;
    let mut image_count = 0;

    let mut pdf_files: Vec<PdfFile> = Vec::new();
    let mut image_files: Vec<String> = Vec::new();

    if let Ok(entries) = fs::read_dir(folder) {

        for entry in entries.flatten() {

            let path = entry.path();

            if let Some(ext) = path.extension() {

                let ext = ext.to_string_lossy().to_lowercase();

                match ext.as_str() {

                    "pdf" => {

                        if let Ok(metadata) = fs::metadata(&path) {

                            let last_modified = metadata
                                .modified()
                                .ok()
                                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                .map(|d| d.as_secs())
                                .unwrap_or(0);

                            pdf_count += 1;

                            pdf_files.push(

                                PdfFile {

                                    path: path.to_string_lossy().to_string(),

                                    last_modified,

                                    file_size: metadata.len(),

                                }

                            );

                        }

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
        .plugin(
            tauri_plugin_sql::Builder::default().build()
        )
        .invoke_handler(tauri::generate_handler![

            greet,

            scan_documents,

            read_pdf_bytes

        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

}