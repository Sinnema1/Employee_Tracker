import { Router } from 'express';
import { QueryResult } from 'pg';
import { pool } from '../connection.js';

const router = Router();

// Add department
router.post('/', (req, res) => {
  const sql = `INSERT INTO department (name) VALUES ($1) RETURNING *`;
  const params = [req.body.name];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Department added successfully',
      data: result.rows[0],
    });
  });
});

// Get departments
router.get('/', (_req, res) => {
  const sql = `SELECT * FROM department ORDER BY id`;

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

// Update department
router.put('/:id', (req, res) => {
  const sql = `UPDATE department SET name = $1 WHERE id = $2 RETURNING *`;
  const params = [req.body.name, req.params.id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.rowCount) {
      res.json({
        message: 'Department not found',
      });
    } else {
      res.json({
        message: 'Department updated successfully',
        data: result.rows[0],
      });
    }
  });
});

// Delete department
router.delete('/:id', (req, res) => {
  const sql = `DELETE FROM department WHERE id = $1 RETURNING *`;
  const params = [req.params.id];

  pool.query(sql, params, (err: Error, result: QueryResult) => {
    if (err) {
      res.status(400).json({ error: err.message });
    } else if (!result.rowCount) {
      res.json({
        message: 'Department not found',
      });
    } else {
      res.json({
        message: 'Department deleted successfully',
        data: result.rows[0],
      });
    }
  });
});

export default router;