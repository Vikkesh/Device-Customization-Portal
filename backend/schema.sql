CREATE TABLE IF NOT EXISTS user_profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('client', 'admin') DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional: Add an index on email for faster lookups during login
-- CREATE INDEX idx_email ON user_profile(email);

CREATE TABLE IF NOT EXISTS projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  shipping_country VARCHAR(255),
  num_active_projects INT DEFAULT 0,
  num_total_projects INT DEFAULT 0,
  device_model VARCHAR(255),
  device_amount INT,
  created_by INT,
  project_status VARCHAR(50) DEFAULT 'Active',
  project_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- Optional: Add indexes for frequently queried columns
-- CREATE INDEX idx_project_status ON projects(project_status);
-- CREATE INDEX idx_customer_name ON projects(customer_name);

CREATE TABLE IF NOT EXISTS project_preview (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  filetype VARCHAR(50),
  url VARCHAR(500),
  field VARCHAR(255),
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  field VARCHAR(255),
  value TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
);

-- Optional: Add indexes for better performance
-- CREATE INDEX idx_project_preview_project_id ON project_preview(project_id);
-- CREATE INDEX idx_project_preview_field ON project_preview(field);
-- CREATE INDEX idx_project_inputs_project_id ON project_inputs(project_id);
-- CREATE INDEX idx_project_inputs_field ON project_inputs(field);
