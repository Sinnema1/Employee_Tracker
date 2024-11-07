INSERT INTO department (name) VALUES
('Sales'),
('Engineering'),
('Human Resources'),
('Marketing');

INSERT INTO role (title, salary, department_id) VALUES
('Sales Manager', 75000, 1),
('Sales Associate', 50000, 1),
('Software Engineer', 90000, 2),
('HR Specialist', 60000, 3),
('Marketing Coordinator', 55000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
('Alice', 'Johnson', 1, NULL),               -- Sales Manager (no manager)
('Bob', 'Smith', 2, 1),                      -- Sales Associate reports to Alice
('Carol', 'White', 3, NULL),                 -- Software Engineer (no manager)
('David', 'Brown', 4, NULL),                 -- HR Specialist (no manager)
('Emma', 'Davis', 5, NULL),                  -- Marketing Coordinator (no manager)
('Frank', 'Miller', 2, 1),                   -- Another Sales Associate reports to Alice
('Grace', 'Wilson', 3, NULL),                -- Another Software Engineer (no manager)
('Henry', 'Taylor', 2, 1);                   -- Sales Associate reports to Alice