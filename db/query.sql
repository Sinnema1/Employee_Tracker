-- Get all departments
SELECT * FROM department;

-- Get all roles and associated department
SELECT role.id AS role_id, role.title, role.salary, department.name AS department_name
FROM role
JOIN department ON role.department_id = department.id;

-- Get all employees with their roles and manager
SELECT e.id AS employee_id, e.first_name, e.last_name, 
       role.title AS role_title, role.salary, 
       d.name AS department_name,
       m.first_name AS manager_first_name, m.last_name AS manager_last_name
FROM employee e
JOIN role ON e.role_id = role.id
JOIN department d ON role.department_id = d.id
LEFT JOIN employee m ON e.manager_id = m.id;

-- Get count of employees in each department
SELECT d.name AS department_name, COUNT(e.id) AS employee_count
FROM department d
LEFT JOIN role r ON d.id = r.department_id
LEFT JOIN employee e ON r.id = e.role_id
GROUP BY d.name;

-- Get all employees with their role and department
SELECT e.first_name, e.last_name, role.title AS role_title, d.name AS department_name
FROM employee e
JOIN role ON e.role_id = role.id
JOIN department d ON role.department_id = d.id;