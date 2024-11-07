import { Router } from 'express';
import { QueryResult } from 'pg';
import { pool } from '../connection.js';


const router = Router();

// Create employee
router.post('/', (req, res) => {
  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
               VALUES ($1, $2, $3, $4) RETURNING *`;
  const params = [req.body.first_name, req.body.last_name, req.body.role_id, req.body.manager_id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Employee added successfully',
      data: result.rows[0],
    });
  });
});

// Get all employees
router.get('/', (_req, res) => {
  const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title AS role, department.name AS department
               FROM employee
               JOIN role ON employee.role_id = role.id
               JOIN department ON role.department_id = department.id
               ORDER BY employee.id`;

  pool.query(sql, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Success',
      data: result.rows,
    });
  });
});

// Update  employee role
router.put('/:id', (req, res) => {
  const sql = `UPDATE employee SET role_id = $1 WHERE id = $2 RETURNING *`;
  const params = [req.body.role_id, req.params.id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.rowCount) {
      res.json({
        message: 'Employee not found',
      });
    } else {
      res.json({
        message: 'Employee role updated successfully',
        data: result.rows[0],
      });
    }
  });
});

// Delete employee
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM employee WHERE id = $1 RETURNING *`;
  const params = [req.params.id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.rowCount) {
      res.json({
        message: 'Employee not found',
      });
    } else {
      res.json({
        message: 'Employee deleted successfully',
        data: result.rows[0],
      });
    }
  });
});

export default router;