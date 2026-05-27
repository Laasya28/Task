const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
  reorderTasks
} = require('../controllers/taskController');

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Task CRUD
router.get('/', getAllTasks);
router.post('/', createTask);
router.post('/reorder', reorderTasks);

router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
