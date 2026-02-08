const { pool } = require('../config/database');

// ========================================
// GET ALL TASKS for logged-in user
// ========================================
const getAllTasks = async (req, res) => {
    try {
        const userId = req.userId; // Changed from req.session.userId

        const [tasks] = await pool.query(
            'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({
            success: true,
            count: tasks.length,
            tasks: tasks
        });

    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tasks'
        });
    }
};

// ========================================
// GET SINGLE TASK by ID
// ========================================
const getTaskById = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;

        const [tasks] = await pool.query(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            task: tasks[0]
        });

    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching task'
        });
    }
};

// ========================================
// CREATE NEW TASK
// ========================================
const createTask = async (req, res) => {
    try {
        const userId = req.userId;
        const { title, description, priority, status, category } = req.body;

        // Validation
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Title is required'
            });
        }

        const [result] = await pool.query(
            `INSERT INTO tasks (user_id, title, description, priority, status, category) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                title,
                description || '',
                priority || 'Medium',
                status || 'Pending',
                category || 'Personal'
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            taskId: result.insertId
        });

    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating task'
        });
    }
};

// ========================================
// UPDATE TASK
// ========================================
const updateTask = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;
        const { title, description, priority, status, category } = req.body;

        // Check if task exists and belongs to user
        const [existingTasks] = await pool.query(
            'SELECT id FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (existingTasks.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Update task
        await pool.query(
            `UPDATE tasks 
             SET title = ?, description = ?, priority = ?, status = ?, category = ?
             WHERE id = ? AND user_id = ?`,
            [title, description, priority, status, category, taskId, userId]
        );

        res.json({
            success: true,
            message: 'Task updated successfully'
        });

    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating task'
        });
    }
};

// ========================================
// DELETE TASK
// ========================================
const deleteTask = async (req, res) => {
    try {
        const userId = req.userId;
        const taskId = req.params.id;

        const [result] = await pool.query(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });

    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting task'
        });
    }
};

// ========================================
// GET TASK STATISTICS
// ========================================
const getTaskStats = async (req, res) => {
    try {
        const userId = req.userId;

        // Total tasks
        const [totalResult] = await pool.query(
            'SELECT COUNT(*) as total FROM tasks WHERE user_id = ?',
            [userId]
        );

        // Tasks by status
        const [statusResult] = await pool.query(
            `SELECT status, COUNT(*) as count 
             FROM tasks 
             WHERE user_id = ? 
             GROUP BY status`,
            [userId]
        );

        // Tasks by priority
        const [priorityResult] = await pool.query(
            `SELECT priority, COUNT(*) as count 
             FROM tasks 
             WHERE user_id = ? 
             GROUP BY priority`,
            [userId]
        );

        res.json({
            success: true,
            stats: {
                total: totalResult[0].total,
                byStatus: statusResult,
                byPriority: priorityResult
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
};

module.exports = {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    getTaskStats
};