-- MechShop Manager Production Database Schema
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

INSERT INTO users (username, password, role)
VALUES ('admin', '$2a$10$Te7DY8Ib8pQv1nH/5hYIU.ppcWmBEmpBDS7g6aEUSj0KSGN/a0OZS', 'admin');

ALTER TABLE inventory
    ADD COLUMN wholesale_price DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN sales_price DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN low_stock_threshold INT DEFAULT 10,
    ADD COLUMN batch VARCHAR(100),
    ADD COLUMN expiry_date DATE; 