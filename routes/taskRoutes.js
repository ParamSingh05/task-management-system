const express = require('express');
const router = express.Router();
const {
    getAllTasks, getTaskById, createTask,
    updateTask, deleteTask, getTaskStats
} = require('../controllers/taskController');
const { isAuthenticated } = require('../middleware/auth');

router.use(isAuthenticated);

router.get('/stats', getTaskStats);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;