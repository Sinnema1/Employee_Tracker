import express from 'express';
import { connectToDb } from './connection.js';
import employeeRoutes from './routes/employeeRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';

await connectToDb();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Use modularized routes
app.use('/api/employees', employeeRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/departments', departmentRoutes);

app.use((_req, res) => {
  res.status(404).end();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});