-- ============================================
-- Task Management System - Database Schema
-- ============================================

-- Drop database if exists (use carefully!)
DROP DATABASE IF EXISTS task_management_db;

-- Create database
CREATE DATABASE task_management_db;

-- Use database
USE task_management_db;

-- ============================================
-- Table: users
-- Stores user account information
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)  -- Index for faster login queries
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Table: tasks
-- Stores all tasks with user relationship
-- ============================================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
    status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
    category ENUM('Work', 'Personal', 'Study', 'Other') DEFAULT 'Personal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),  -- Index for faster task retrieval
    INDEX idx_status (status)      -- Index for filtering by status
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert sample user (password is 'password123' hashed with bcrypt)
INSERT INTO users (name, email, password) VALUES 
('John Doe', 'john@example.com', '$2b$10$rZ1zJ8H9vKjZ9qH9qH9qH9qH9qH9qH9qH9qH9qH9qH9qH9qH9qH9q');

-- Insert sample tasks (user_id = 1)
INSERT INTO tasks (user_id, title, description, priority, status, category) VALUES 
(1, 'Complete Project Report', 'Finish the annual project report by end of week', 'High', 'In Progress', 'Work'),
(1, 'Buy Groceries', 'Milk, Eggs, Bread, Vegetables', 'Low', 'Pending', 'Personal'),
(1, 'Study MySQL', 'Complete MySQL tutorial and practice queries', 'Medium', 'Pending', 'Study');

-- ============================================
-- Verify Installation
-- ============================================
SELECT 'Database created successfully!' AS Status;
SHOW TABLES;
