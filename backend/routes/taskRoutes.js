const express = require('express');
const router = express.Router();
const {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
} = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');

// All task routes require authentication
router.use(isAuthenticated);

// Task CRUD routes
router.get('/', getAllTasks);           // GET /api/tasks
router.get('/stats', getTaskStats);     // GET /api/tasks/stats
router.get('/:id', getTaskById);        // GET /api/tasks/:id
router.post('/', createTask);           // POST /api/tasks
router.put('/:id', updateTask);         // PUT /api/tasks/:id
router.delete('/:id', deleteTask);      // DELETE /api/tasks/:id

module.exports = router;