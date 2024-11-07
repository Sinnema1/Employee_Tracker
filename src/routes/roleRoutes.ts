import { Router } from 'express';
import { QueryResult } from 'pg';
import { pool } from '../connection.js';

const router = Router();

// Create a new role
router.post('/', (req, res) => {
  const sql = `INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3) RETURNING *`;
  const params = [req.body.title, req.body.salary, req.body.department_id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Role added successfully',
      data: result.rows[0],
    });
  });
});

// Read all roles
router.get('/', (_req, res) => {
  const sql = `SELECT role.id, role.title, role.salary, department.name AS department
               FROM role
               JOIN department ON role.department_id = department.id
               ORDER BY role.id`;

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

// Update a role
router.put('/:id', (req, res) => {
  const sql = `UPDATE role SET title = $1, salary = $2, department_id = $3 WHERE id = $4 RETURNING *`;
  const params = [req.body.title, req.body.salary, req.body.department_id, req.params.id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.rowCount) {
      res.json({
        message: 'Role not found',
      });
    } else {
      res.json({
        message: 'Role updated successfully',
        data: result.rows[0],
      });
    }
  });
});

// Delete a role
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM role WHERE id = $1 RETURNING *`;
  const params = [req.params.id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.rowCount) {
      res.json({
        message: 'Role not found',
      });
    } else {
      res.json({
        message: 'Role deleted successfully',
        data: result.rows[0],
      });
    }
  });
});

export default router;