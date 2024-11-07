import inquirer from 'inquirer';

const baseURL = 'http://localhost:3001/api';

async function mainMenu() {
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
      process.exit();
  }

  mainMenu(); // Loop back to main menu
}

// Get all employees
async function viewEmployees() {
  try {
    const response = await fetch(`${baseURL}/employees`);
    const data = await response.json() as { data: any[] };
    console.table(data.data);
  } catch (err) {
    console.log('Error retrieving employees:', err);
  }
}

// Add a new employee
async function addEmployee() {
  const { firstName, lastName, roleId, managerId } = await inquirer.prompt([
    { type: 'input', name: 'firstName', message: "Employee's first name:" },
    { type: 'input', name: 'lastName', message: "Employee's last name:" },
    { type: 'input', name: 'roleId', message: "Employee's role ID:" },
    { type: 'input', name: 'managerId', message: "Employee's manager ID (optional):" },
  ]);

  const newEmployee = {
    first_name: firstName,
    last_name: lastName,
    role_id: Number(roleId),
    manager_id: managerId ? Number(managerId) : null,
  };

  try {
    const response = await fetch(`${baseURL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEmployee),
    });

    if (response.ok) {
      console.log('Employee added successfully.');
    } else {
      console.log('Error adding employee:', response.statusText);
    }
  } catch (err) {
    console.log('Error adding employee:', err);
  }
}

// Update employee role
async function updateEmployeeRole() {
  const { employeeId, newRoleId } = await inquirer.prompt([
    { type: 'input', name: 'employeeId', message: "Employee's ID to update:" },
    { type: 'input', name: 'newRoleId', message: "Employee's new role ID:" },
  ]);

  try {
    const response = await fetch(`${baseURL}/employees/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: Number(newRoleId) }),
    });

    if (response.ok) {
      console.log('Employee role updated successfully.');
    } else {
      console.log('Error updating employee role:', response.statusText);
    }
  } catch (err) {
    console.log('Error updating employee role:', err);
  }
}

// Delete employee
async function deleteEmployee() {
  const { employeeId } = await inquirer.prompt({
    type: 'input',
    name: 'employeeId',
    message: 'Enter the ID of the employee to delete:',
  });

  try {
    const response = await fetch(`${baseURL}/employees/${employeeId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Employee deleted successfully.');
    } else {
      console.log('Error deleting employee:', response.statusText);
    }
  } catch (err) {
    console.log('Error deleting employee:', err);
  }
}

mainMenu();