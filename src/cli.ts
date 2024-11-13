import inquirer from "inquirer";
import { pool, connectToDb } from "./connection.js";

// Initialize database connection
await connectToDb();

async function mainMenu() {
  let isRunning = true;

  while (isRunning) {
    const { action } = await inquirer.prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "View employees by manager", 
        "View employees by department", 
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update an employee role",
        'Update employee manager', 
        'Delete a department', 
        'Delete a role', 
        "Delete an employee", 
        "View utilized budget", 
        "Exit",
      ],
    });

    switch (action) {
      case "View all departments":
        await viewDepartments();
        break;
      case "View all roles":
        await viewRoles();
        break;
      case "View all employees":
        await viewEmployees();
        break;
      case "View employees by manager": 
        await viewEmployeesByMgr();
        break;
      case 'View employees by department': 
        await viewEmployeesByDept();
        break;
      case "Add a department":
        await addDepartment();
        break;
      case "Add a role":
        await addRole();
        break;
      case "Add an employee":
        await addEmployee();
        break;
      case "Update an employee role":
        await updateEmployeeRole();
        break;
      case 'Update employee manager': 
        await updateEmployeeManager();
        break;
      case 'Delete a department': 
        await deleteDepartment();
        break;
      case 'Delete a role': 
        await deleteRole();
        break;
      case 'Delete an employee': 
        await deleteEmployee();
        break;
      case "View utilized budget": 
      await viewBudget();
      break;
      case "Exit":
        console.log("Goodbye!");
        await pool.end(); // Close the database connection
        isRunning = false; // Variable change to exit the loop
        break;
    }
  }
}

// View all departments
async function viewDepartments() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM department
    `);
    console.table(result.rows);
  } catch (err) {
    console.error("Error retrieving departments:", err);
  }
}

// View all roles
async function viewRoles() {
  try {
    const result = await pool.query(`
      SELECT role.id AS role_id, role.title, role.salary, department.name AS department_name
      FROM role
      JOIN department ON role.department_id = department.id;
    `);
    console.table(result.rows);
  } catch (err) {
    console.error("Error retrieving roles:", err);
  }
}

// View all employees
async function viewEmployees() {
  try {
    const result = await pool.query(`
      SELECT 
        e.id AS employee_id, 
        e.first_name AS first_name, 
        e.last_name AS last_name, 
        r.title AS job_title, 
        d.name AS department_name, 
        r.salary AS salary, 
        m.first_name || ' ' || m.last_name AS manager
      FROM employee e
      LEFT JOIN role r ON e.role_id = r.id
      LEFT JOIN department d ON r.department_id = d.id
      LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY e.id;
    `);
    console.table(result.rows);
  } catch (err) {
    console.error("Error retrieving employees:", err);
  }
}

// View employees by manager
async function viewEmployeesByMgr() {
  try {
    const result = await pool.query(`
      SELECT
        m.id AS manager_id,
        m.first_name || ' ' || m.last_name AS manager,
        e.id AS employee_id,
        e.first_name || ' ' || e.last_name AS employee
      FROM employee e
      LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY m.id, e.id;
    `);
    console.table(result.rows);
  } catch (err) {
    console.error("Error retrieving employees:", err);
  }
}

// View employees by department
async function viewEmployeesByDept() {
  try {
    const result = await pool.query(`
      SELECT
        d.id AS department_id,
        d.name AS department_name, 
        e.id AS employee_id,
        e.first_name || ' ' || e.last_name AS employee
      FROM employee e
      JOIN role r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
      ORDER BY d.id, e.id;
    `);
    console.table(result.rows);
  } catch (err) {
    console.error("Error retrieving employees:", err);
  }
}

// Add a new department
async function addDepartment() {
  const { dptName } = await inquirer.prompt([
    {
      type: "input",
      name: "dptName",
      message: "Department name:",
      validate: (input) => (input ? true : "First name cannot be empty."),
    },
  ]);

  try {
    const result = await pool.query(
      `INSERT INTO department (name)
       VALUES ($1) RETURNING *`,
      [dptName || null]
    );
    console.log(`${dptName} department added successfully:`, result.rows[0]);
  } catch (err) {
    console.error("Error adding department:", err);
  }
}

// Add a new role
async function addRole() {
  try {
    const departmentsResult = await pool.query(
      "SELECT id, name FROM department ORDER BY id"
    );
    const departments = departmentsResult.rows;

    const { roleName, salary, departmentId } = await inquirer.prompt([
      {
        type: "input",
        name: "roleName",
        message: "Role name:",
        validate: (input) => (input ? true : "Role name cannot be empty."),
      },
      {
        type: "input",
        name: "salary",
        message: "Salary for role:",
        validate: (input) =>
          !isNaN(Number(input)) && input ? true : "Salary must be a number.",
      },
      {
        type: "list",
        name: "departmentId",
        message: "Select the department for this role:",
        choices: departments.map((dept) => ({
          name: dept.name,
          value: dept.id,
        })),
      },
    ]);

    const result = await pool.query(
      `INSERT INTO role (title, salary, department_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [roleName, salary, departmentId]
    );

    console.log(`${roleName} added successfully:`, result.rows[0]);
  } catch (err) {
    console.error("Error adding role:", err);
  }
}

// Add a new employee
async function addEmployee() {
  try {
    const mgrResults = await pool.query(
      "SELECT id, first_name, last_name FROM employee ORDER BY first_name"
    );
    const managers = mgrResults.rows;

    const rolesResult = await pool.query(
      "SELECT id, title FROM role ORDER BY id"
    );
    const roles = rolesResult.rows;

    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
      {
        type: "input",
        name: "firstName",
        message: "Employee's first name:",
        validate: (input) => (input ? true : "First name cannot be empty."),
      },
      {
        type: "input",
        name: "lastName",
        message: "Employee's last name:",
        validate: (input) => (input ? true : "Last name cannot be empty."),
      },
      {
        type: "list",
        name: "roleId",
        message: "Select employee's role:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
      {
        type: "list",
        name: "managerId",
        message: "Select employee's manager (or choose 'None'):",
        choices: [
          { name: "None", value: null },
          ...managers.map((mgr) => ({
            name: `${mgr.first_name} ${mgr.last_name}`,
            value: mgr.id,
          })),
        ],
      },
    ]);

    const result = await pool.query(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [firstName, lastName, roleId, managerId]
    );

    console.log(`${firstName} ${lastName} added successfully:`, result.rows[0]);
  } catch (err) {
    console.error("Error adding employee:", err);
  }
}

// Update an employee's role
async function updateEmployeeRole() {
  try {
    const empResults = await pool.query(`
      SELECT id, first_name, last_name
      FROM employee
      ORDER BY first_name;
    `);
    const employees = empResults.rows;

    const roleResults = await pool.query(`
      SELECT id, title
      FROM role
      ORDER BY title;
    `);
    const roles = roleResults.rows;

    const { employeeName, updatedRoleName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeName',
        message: "Which employee's role do you want to update?",
        choices: employees.map((emp) => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id,
        })),
      },
      {
        type: 'list',
        name: 'updatedRoleName',
        message: 'Which role do you want to assign to the selected employee?',
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
    ]);

    const result = await pool.query(
      `UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *`,
      [updatedRoleName, employeeName]
    );

      console.log('Employee role updated successfully:', result.rows[0]);
  } catch (err) {
    console.error('Error updating employee role:', err);
  }
}

// Update an employee's manager
async function updateEmployeeManager() {
  try {
    const empResults = await pool.query(`
      SELECT id, first_name, last_name
      FROM employee
      ORDER BY first_name;
    `);
    const employees = empResults.rows;

    const mgrResults = await pool.query(`
      SELECT id, first_name, last_name
      FROM employee
      ORDER BY first_name, last_name;
    `);
    const managers = mgrResults.rows;

    const { employeeName, managerName } = await inquirer.prompt([
        {
          type: 'list',
          name: 'employeeName',
          message: "Which employee's manager do you want to update?",
          choices: employees.map((emp) => ({
            name: `${emp.first_name} ${emp.last_name}`,
            value: emp.id,
          })),
        },
      {
        type: 'list',
        name: 'managerName',
        message: "Select employee's new manager (or choose 'None'):",
        choices: [
          { name: 'None', value: null },
          ...managers.map((mgr) => ({
            name: `${mgr.first_name} ${mgr.last_name}`,
            value: mgr.id,
          })),
        ],
      },
    ]);

    const result = await pool.query(
      `UPDATE employee SET manager_id = $1 WHERE id = $2 RETURNING *`,
      [managerName, employeeName]
    );

    if (result.rowCount === 0) {
      console.log('Employee not found.');
    } else {
      console.log('Employee manager updated successfully:', result.rows[0]);
    }
  } catch (err) {
    console.error('Error updating employee manager:', err);
  }
}

// Delete a department
async function deleteDepartment() {
  try {
    const departmentsResult = await pool.query(
      "SELECT id, name FROM department ORDER BY id"
    );
    const departments = departmentsResult.rows;



    const { deptName } = await inquirer.prompt([
    {
      type: "list",
      name: "deptName",
      message: "Select the department to delete:",
      choices: departments.map((dept) => ({
        name: dept.name,
        value: dept.id,
      })),
    }
  ]);
    const result = await pool.query(
      `DELETE FROM department WHERE id = $1 RETURNING *`,
      [deptName]
    );

      console.log("Department deleted successfully:", result.rows[0]);
  } catch (err) {
    console.error("Error deleting department:", err);
  }
}

// Delete a role
async function deleteRole() {
  try{
    const roleResults = await pool.query(`
      SELECT id, title
      FROM role
      ORDER BY title;
    `);
    const roles = roleResults.rows;

    const { roleName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'roleName',
        message: 'Which role do you want to delete?',
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
    ]);
    const result = await pool.query(
      `DELETE FROM role WHERE id = $1 RETURNING *`,
      [roleName]
    );

      console.log("Role deleted successfully:", result.rows[0]);
  } catch (err) {
    console.error("Error deleting role:", err);
  }
}

// Delete an employee
async function deleteEmployee() {
  try{
    const empResults = await pool.query(`
      SELECT id, first_name, last_name
      FROM employee
      ORDER BY first_name;
    `);
    const employees = empResults.rows;

    const { employeeName } = await inquirer.prompt([
      {
        type: 'list',
        name: 'employeeName',
        message: "Which employee do you want to delete?",
        choices: employees.map((emp) => ({
          name: `${emp.first_name} ${emp.last_name}`,
          value: emp.id,
        })),
      }
    ]);
    const result = await pool.query(
      `DELETE FROM employee WHERE id = $1 RETURNING *`,
      [employeeName]
    );

      console.log("Employee deleted successfully:", result.rows[0]);
  } catch (err) {
    console.error("Error deleting employee:", err);
  }
}

// View total utilized budget
async function viewBudget() {
  try {
    const result = await pool.query(`
      SELECT 
        d.name AS department_name, 
        SUM(r.salary) AS dept_budget,
        COUNT(e.id) AS total_employees
      FROM role r
      JOIN employee e ON r.id = e.role_id
      JOIN department d ON r.department_id = d.id
      GROUP BY d.name
    `);
    console.table(result.rows);
  } catch (err) {
    console.error("Error retrieving budget:", err);
  }
}

// Start the CLI
mainMenu();
