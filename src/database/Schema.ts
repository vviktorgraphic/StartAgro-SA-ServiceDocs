export const SCHEMA = `

CREATE TABLE IF NOT EXISTS work_orders (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    work_order_number TEXT NOT NULL UNIQUE,

    prefix TEXT NOT NULL,

    pdf_file TEXT NOT NULL,

    image_files TEXT NOT NULL DEFAULT '[]',

    partner_name TEXT,
    tax_number TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,

    machine_type TEXT,
    serial_number TEXT,

    work_type TEXT,

    reported_issue TEXT,

    completed_work TEXT,

    delivery_note_number TEXT,
    operating_hours TEXT,
    other_agreements TEXT,

    billing_address TEXT,
    service_location TEXT,
    material_total TEXT,
    total_kilometers TEXT,
    total_work_hours TEXT,
    washing TEXT,
    closed_at TEXT,
    handed_over_by TEXT,
    received_by TEXT

);

CREATE INDEX IF NOT EXISTS idx_work_order_number
ON work_orders(work_order_number);

CREATE TABLE IF NOT EXISTS work_order_imports (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    work_order_number TEXT NOT NULL UNIQUE,

    pdf_file TEXT NOT NULL,

    pdf_last_modified INTEGER NOT NULL,

    pdf_file_size INTEGER NOT NULL

);

CREATE INDEX IF NOT EXISTS idx_work_order_import_number
ON work_order_imports(work_order_number);

CREATE INDEX IF NOT EXISTS idx_work_order_import_pdf_file
ON work_order_imports(pdf_file);

CREATE TABLE IF NOT EXISTS service_visits (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    work_order_id INTEGER NOT NULL,

    visit_date TEXT NOT NULL,

    technician TEXT NOT NULL,

    travel_cost INTEGER NOT NULL,

    kilometers INTEGER NOT NULL,

    work_hours REAL NOT NULL,

    short_description TEXT,

    FOREIGN KEY(work_order_id)
        REFERENCES work_orders(id)
        ON DELETE CASCADE

);

CREATE INDEX IF NOT EXISTS idx_service_work_order
ON service_visits(work_order_id);

`;
