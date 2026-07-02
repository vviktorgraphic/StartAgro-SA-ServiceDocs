export const SCHEMA = `

CREATE TABLE IF NOT EXISTS work_orders (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    work_order_number TEXT NOT NULL UNIQUE,

    prefix TEXT NOT NULL,

    pdf_file TEXT NOT NULL,

    partner_name TEXT,
    tax_number TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,

    machine_type TEXT,
    serial_number TEXT,

    work_type TEXT,

    reported_issue TEXT,

    completed_work TEXT

);

CREATE TABLE IF NOT EXISTS service_visits (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    work_order_number TEXT NOT NULL,

    visit_date TEXT NOT NULL,

    technician TEXT NOT NULL,

    travel_cost INTEGER NOT NULL,

    kilometers INTEGER NOT NULL,

    work_hours REAL NOT NULL,

    short_description TEXT

);

`;