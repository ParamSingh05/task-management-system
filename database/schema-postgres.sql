-- ============================================
-- Task Management System - PostgreSQL Schema
-- ============================================

-- Drop existing tables
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_email ON users(email);

-- ============================================
-- Table: tasks
-- ============================================
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(20) DEFAULT 'Pending',
    category VARCHAR(20) DEFAULT 'Personal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id) 
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT check_priority 
        CHECK (priority IN ('Low', 'Medium', 'High')),
    CONSTRAINT check_status 
        CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    CONSTRAINT check_category 
        CHECK (category IN ('Work', 'Personal', 'Study', 'Other'))
);

-- Indexes for better performance
CREATE INDEX idx_user_id ON tasks(user_id);
CREATE INDEX idx_status ON tasks(status);
CREATE INDEX idx_priority ON tasks(priority);

-- ============================================
-- Trigger: Auto-update updated_at column
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification
-- ============================================
SELECT 'Database schema created successfully!' AS status;

-- Show tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';