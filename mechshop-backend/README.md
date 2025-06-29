# MechShop Backend (Node.js + Express + MySQL)

## Production-Ready Setup Guide

### 1. Install Dependencies
```sh
npm install
```

### 2. Configure Environment Variables
Create a `.env` file or set environment variables for production security:
- `DB_HOST` (default: `localhost`)
- `DB_USER` (default: `root`)
- `DB_PASS` (default: empty)
- `DB_NAME` (default: `mechshop`)
- `JWT_SECRET` (set a strong secret in production)

### 3. Create MySQL Database and Tables
Run the following SQL in your MySQL client (Workbench, CLI, etc):

```sql
CREATE DATABASE IF NOT EXISTS mechshop;
USE mechshop;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','staff') NOT NULL DEFAULT 'staff'
);

CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    stock INT,
    wholesale_price DECIMAL(10,2) DEFAULT 0,
    sales_price DECIMAL(10,2) DEFAULT 0,
    low_stock_threshold INT DEFAULT 10,
    batch VARCHAR(100),
    expiry_date DATE
);

CREATE TABLE IF NOT EXISTS customers (
    membership_no INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    contact VARCHAR(100),
    phone VARCHAR(20) UNIQUE
);

CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer INT,
    items VARCHAR(255),
    quantity INT,
    rate DECIMAL(10,2),
    total DECIMAL(10,2),
    date DATE,
    FOREIGN KEY (customer) REFERENCES customers(membership_no)
);

CREATE TABLE IF NOT EXISTS purchases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier VARCHAR(255),
    items VARCHAR(255),
    quantity INT,
    date_of_purchase DATE,
    wholesale_amount DECIMAL(10,2),
    sales_price DECIMAL(10,2)
);
```

### 4. Run the Server
```sh
npm start
```
The server will run on port 3001 by default.

### 5. Security & Production Notes
- **Set a strong `JWT_SECRET` and DB password in production.**
- Use HTTPS and a secure reverse proxy (e.g., Nginx) in production.
- Regularly back up your database.
- Restrict DB and server access to trusted IPs.
- Use environment variables for all secrets and credentials.

### 6. API Endpoints
- `/api/login` (POST)
- `/api/inventory` (GET, POST, PUT, DELETE)
- `/api/sales` (GET, POST)
- `/api/sales/:id/invoice` (GET)
- `/api/purchases` (GET, POST)
- `/api/customers` (GET, POST)
- `/api/customers/phone/:phone` (GET)
- `/api/customers/:membership_no/history` (GET)
- `/api/reports` (GET)
- `/api/audit-log` (GET, admin only)
- `/api/notify` (POST, admin only)

---

For any issues, check backend logs and ensure your database schema matches the above. For production, consider using a process manager (e.g., PM2) and a firewall. 