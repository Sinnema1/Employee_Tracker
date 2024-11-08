import inquirer from 'inquirer';
import { pool, connectToDb } from './connection.js';

// Initialize database connection
await connectToDb();

async function mainMenu() {
  let isRunning = true;

  while (isRunning) {
    const { action } = await inquirer.prompt({
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all employees',
        'Add an employee',
        'Update an employee role',
        'Delete an employee',
        'Exit',
      ],
    });

    switch (action) {
      case 'View all departments':
        await viewDepartments();
        break;
      case 'View all roles':
        await viewRoles();
        break;
      case 'View all employees':
        await viewEmployees();
        break;
      // case 'View employees by manager':
      //   await viewEmployeesByMgr();
      //   break;
      // case 'View employees by department':
      //   await viewEmployeesByDept();
      //   break;
      case 'Add a department':
        await addDepartment();
        break;
      case 'Add a role':
        await addRole();
        break;
      case 'Add an employee':
        await addEmployee();
        break;
      case 'Update an employee role':
        await updateEmployeeRole();
        break;
      // case 'Update employee manager':
      //   await updateEmployeeManager();
      //   break;
      // case 'Delete a department':
      //   await deleteDepartment();
      //   break;
      // case 'Delete a role':
      //   await deleteRole();
      //   break;
      case 'Delete an employee':
        await deleteEmployee();
        break;
      case 'Exit':
        console.log('Goodbye!');
        await pool.end(); // Close the database connection
        isRunning = false; // Exit the loop
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
    console.error('Error retrieving departments:', err);
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
    console.error('Error retrieving roles:', err);
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
        d.name AS department, 
        r.salary AS salary, 
        m.first_name AS manager_first_name, 
        m.last_name AS manager_last_name
      FROM employee e
      JOIN role r ON e.role_id = r.id
      JOIN department d ON r.department_id = d.id
      LEFT JOIN employee m ON e.manager_id = m.id
      ORDER BY e.id;
    `);
    console.table(result.rows);
  } catch (err) {
    console.error('Error retrieving employees:', err);
  }
}

// Add a new department
async function addDepartment() {
  const { dptName } = await inquirer.prompt([
    { 
      type: 'input', 
      name: 'dptName', 
      message: "Department name:", 
      validate: (input) => input ? true : 'First name cannot be empty.' 
    }
  ]);

  try {
    const result = await pool.query(
      `INSERT INTO department (name)
       VALUES ($1) RETURNING *`,
      [dptName || null]
    );
    console.log('Department added successfully:', result.rows[0]);
  } catch (err) {
    console.error('Error adding department:', err);
  }
}

// Add a new role
async function addRole() {
  try {
    const departmentsResult = await pool.query('SELECT id, name FROM department ORDER BY id');
    const departments = departmentsResult.rows;

    const { roleName, salary, departmentId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'roleName',
        message: 'Role name:',
        validate: (input) => input ? true : 'Role name cannot be empty.',
      },
      {
        type: 'input',
        name: 'salary',
        message: 'Salary for role:',
        validate: (input) => !isNaN(Number(input)) && input ? true : 'Salary must be a number.',
      },
      {
        type: 'list',
        name: 'departmentId',
        message: 'Select the department for this role:',
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

    console.log('Role added successfully:', result.rows[0]);
  } catch (err) {
    console.error('Error adding role:', err);
  }
}

// Add a new employee
async function addEmployee() {
  try {
    // Fetch all employees for the manager list
    const mgrResults = await pool.query('SELECT id, first_name, last_name FROM employee ORDER BY first_name');
    const managers = mgrResults.rows;

    // Fetch all roles for the role list
    const rolesResult = await pool.query('SELECT id, title FROM role ORDER BY id');
    const roles = rolesResult.rows;

    // Prompt the user for employee details
    const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
      {
        type: 'input',
        name: 'firstName',
        message: "Employee's first name:",
        validate: (input) => input ? true : 'First name cannot be empty.',
      },
      {
        type: 'input',
        name: 'lastName',
        message: "Employee's last name:",
        validate: (input) => input ? true : 'Last name cannot be empty.',
      },
      {
        type: 'list',
        name: 'roleId',
        message: "Select employee's role:",
        choices: roles.map((role) => ({
          name: role.title,
          value: role.id,
        })),
      },
      {
        type: 'list',
        name: 'managerId',
        message: "Select employee's manager (or choose 'None'):",
        choices: [
          { name: 'None', value: null },
          ...managers.map((mgr) => ({
            name: `${mgr.first_name} ${mgr.last_name}`,
            value: mgr.id,
          })),
        ],
      },
    ]);

    // Insert the new employee into the database
    const result = await pool.query(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [firstName, lastName, roleId, managerId]
    );

    console.log('Employee added successfully:', result.rows[0]);
  } catch (err) {
    console.error('Error adding employee:', err);
  }
}
  
// Update an employee's role
async function updateEmployeeRole() {
  const { employeeId, newRoleId } = await inquirer.prompt([
    { 
      type: 'input', 
      name: 'employeeId', 
      message: "Employee's ID to update:", 
      validate: (input) => !isNaN(Number(input)) && input ? true : 'Employee ID must be a number.' 
    },
    { 
      type: 'input', 
      name: 'newRoleId', 
      message: "New role ID for the employee:", 
      validate: (input) => !isNaN(Number(input)) && input ? true : 'New role ID must be a number.' 
    },
  ]);

  try {
    const result = await pool.query(
      `UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *`,
      [newRoleId, employeeId]
    );
    if (result.rowCount === 0) {
      console.log('Employee not found.');
    } else {
      console.log('Employee role updated successfully:', result.rows[0]);
    }
  } catch (err) {
    console.error('Error updating employee role:', err);
  }
}

// Delete an employee
async function deleteEmployee() {
  const { employeeId } = await inquirer.prompt({
    type: 'input',
    name: 'employeeId',
    message: 'Enter the ID of the employee to delete:',
    validate: (input) => !isNaN(Number(input)) && input ? true : 'Employee ID must be a number.',
  });

  try {
    const result = await pool.query(
      `DELETE FROM employee WHERE id = $1 RETURNING *`,
      [employeeId]
    );
    if (result.rowCount === 0) {
      console.log('Employee not found.');
    } else {
      console.log('Employee deleted successfully:', result.rows[0]);
    }
  } catch (err) {
    console.error('Error deleting employee:', err);
  }
}

// Start the CLI
mainMenu();