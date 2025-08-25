-- Create DATABASE Performance_test_M4
DROP DATABASE Performance_test_M4
CREATE DATABASE Performance_test_M4;
USE Performance_test_M4;

-- Create the clients table
CREATE TABLE clients (
    client_id INT PRIMARY KEY AUTO_INCREMENT,
    name_client VARCHAR(255) NOT NULL,
    identification VARCHAR(50) UNIQUE NOT NULL,
    address VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Create the transactions table
CREATE TABLE transactions (
    transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    transaction_code VARCHAR(50) UNIQUE NOT NULL,
    transaction_datetime TIMESTAMP NOT NULL,
    transaction_amount DECIMAL(10, 2) NOT NULL,
    transaction_status ENUM("Fallida","Completada", "Pendiente"),
    transaction_type VARCHAR(50) NOT NULL,
    platform_used VARCHAR(100),
    client_id_fk INT,
    FOREIGN KEY (client_id_fk) REFERENCES clients(client_id)
);

-- Create the bills table
CREATE TABLE bills (
    bill_id INT PRIMARY KEY AUTO_INCREMENT,
    bill_code VARCHAR(50) UNIQUE NOT NULL,
    billing_period VARCHAR(7) NOT NULL,
    invoiced_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) NOT NULL,
    transaction_id_fk INT,
    client_id_fk INT,
    FOREIGN KEY (transaction_id_fk) REFERENCES transactions(transaction_id),
    FOREIGN KEY (client_id_fk) REFERENCES clients(client_id)
);