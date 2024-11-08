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
      case 'View all employees':
        await viewEmployees();
        break;
      case 'Add an employee':
        await addEmployee();
        break;
      case 'Update an employee role':
        await updateEmployeeRole();
        break;
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

// View all employees
async function viewEmployees() {
  try {
    const result = await pool.query(`
      SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department
      FROM employee
      JOIN role ON employee.role_id = role.id
      JOIN department ON role.department_id = department.id
      ORDER BY employee.id;
    `);
    console.table(result.rows);
  } catch (err) {
    console.error('Error retrieving employees:', err);
  }
}

// Add a new employee
async function addEmployee() {
  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    { 
      type: 'input', 
      name: 'firstName', 
      message: "Employee's first name:", 
      validate: (input) => input ? true : 'First name cannot be empty.' 
    },
    { 
      type: 'input', 
      name: 'lastName', 
      message: "Employee's last name:", 
      validate: (input) => input ? true : 'Last name cannot be empty.' 
    },
    { 
      type: 'input', 
      name: 'roleId', 
      message: "Employee's role ID:", 
      validate: (input) => !isNaN(Number(input)) && input ? true : 'Role ID must be a number.' 
    },
    { 
      type: 'input', 
      name: 'managerId', 
      message: "Employee's manager ID (optional):", 
      validate: (input) => input === '' || !isNaN(Number(input)) ? true : 'Manager ID must be a number or left empty.' 
    },
  ]);

  try {
    const result = await pool.query(
      `INSERT INTO employee (first_name, last_name, role_id, manager_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [firstName, lastName, roleId, managerId || null]
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