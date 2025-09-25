-- Drop old tables if exist
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    company VARCHAR(100),
    role VARCHAR(100),
    status VARCHAR(50) DEFAULT 'applied',
    date_applied DATE DEFAULT CURRENT_DATE,
    notes TEXT
);

-- Insert sample user
-- Password: password123 (bcrypt hashed for demonstration; replace with your own)
INSERT INTO users (name, email, password)
VALUES ('Shivam', 'shivam@example.com', '$2a$10$u5BfZSPC1CwTnMPbn.Y4hehTX/7ZTZM6zVvZpp5X7tQiFq6UYPu2K');

-- Insert sample jobs for the sample user
INSERT INTO jobs (user_id, company, role, status, date_applied, notes)
VALUES
(1, 'ABC Corp', 'Software Engineer', 'applied', '2025-09-05', 'First application'),
(1, 'XYZ Ltd', 'Backend Developer', 'interview', '2025-09-01', 'Interview scheduled next week');
