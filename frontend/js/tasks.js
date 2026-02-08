// API Base URL
const API_URL = 'http://localhost:5000/api';

// Global variable
let allTasks = [];

// ========================================
// HELPER: Get Authorization Headers
// ========================================
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ========================================
// CHECK AUTHENTICATION
// ========================================
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// ========================================
// LOAD USER INFO
// ========================================
function loadUserInfo() {
    if (!checkAuthentication()) return;
    
    const userName = localStorage.getItem('userName');
    document.getElementById('userInfo').textContent = userName;
}

// ========================================
// LOAD ALL TASKS
// ========================================
async function loadTasks() {
    try {
        // Show loading state
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('tasksContainer').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');

        const response = await fetch(`${API_URL}/tasks`, {
        headers: getAuthHeaders(),  // ADD THIS
        credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();

        if (data.success) {
            allTasks = data.tasks;

            // Hide loading
            document.getElementById('loadingState').classList.add('hidden');

            if (allTasks.length === 0) {
                // Show empty state
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                // Display tasks
                displayTasks(allTasks);
            }
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('loadingState').classList.add('hidden');
        showAlert('Failed to load tasks. Please refresh the page.', 'error');
    }
}

// ========================================
// DISPLAY TASKS
// ========================================
function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');
    container.classList.remove('hidden');
    container.innerHTML = '';

    if (tasks.length === 0) {
        document.getElementById('emptyState').classList.remove('hidden');
        container.classList.add('hidden');
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');

    tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        container.appendChild(taskCard);
    });
}

// ========================================
// CREATE TASK CARD HTML
// ========================================
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority.toLowerCase()}`;

    // Format date
    const createdDate = new Date(task.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="task-header">
            <div>
                <div class="task-title">${escapeHtml(task.title)}</div>
            </div>
        </div>

        <div class="task-badges">
            <span class="badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <span class="badge badge-status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</span>
            <span class="badge badge-category">${task.category}</span>
        </div>

        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}

        <div class="task-date">Created on ${createdDate}</div>

        <div class="task-actions">
            <button class="btn btn-warning btn-small" onclick="openEditModal(${task.id})">
                ✏️ Edit
            </button>
            <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">
                🗑️ Delete
            </button>
        </div>
    `;

    return card;
}

// ========================================
// ESCAPE HTML (Prevent XSS)
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// FILTER TASKS
// ========================================
function filterTasks() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;

    let filteredTasks = allTasks;

    // Filter by status
    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.category === categoryFilter);
    }

    displayTasks(filteredTasks);
}

// ========================================
// OPEN EDIT MODAL
// ========================================
function openEditModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    // Populate form
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description || '';
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editStatus').value = task.status;
    document.getElementById('editCategory').value = task.category;

    // Show modal
    document.getElementById('editModal').classList.add('active');
}

// ========================================
// CLOSE EDIT MODAL
// ========================================
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editTaskForm').reset();
}

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') {
        closeEditModal();
    }
});

// ========================================
// EDIT TASK FORM HANDLER
// ========================================
const editTaskForm = document.getElementById('editTaskForm');
if (editTaskForm) {
    editTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const taskId = document.getElementById('editTaskId').value;
        const title = document.getElementById('editTitle').value.trim();
        const description = document.getElementById('editDescription').value.trim();
        const priority = document.getElementById('editPriority').value;
        const status = document.getElementById('editStatus').value;
        const category = document.getElementById('editCategory').value;

        if (!title) {
            showAlert('Task title is required', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),  // ADD THIS
            credentials: 'include',
            body: JSON.stringify({
            title,
            description,
            priority,
            status,
            category
            })
        }
    );

            const data = await response.json();

            if (data.success) {
                showAlert('Task updated successfully! ✅', 'success');
                closeEditModal();
                loadTasks(); // Reload all tasks
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            showAlert('Failed to update task. Please try again.', 'error');
        }
    });
}

// ========================================
// DELETE TASK
// ========================================
async function deleteTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    // Confirm deletion
    const confirmDelete = confirm(`Are you sure you want to delete "${task.title}"?`);
    if (!confirmDelete) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),  // ADD THIS
        credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Task deleted successfully! 🗑️', 'success');
            loadTasks(); // Reload all tasks
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showAlert('Failed to delete task. Please try again.', 'error');
    }
}

// ========================================
// SHOW ALERT
// ========================================
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.innerHTML = `
        <div class="alert alert-${type}">
            ${message}
        </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.innerHTML = '';
    }, 5000);
}

// ========================================
// LOGOUT FUNCTION
// ========================================
async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        window.location.href = 'index.html';
    }
}

// ========================================
// INITIALIZE TASKS PAGE
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadTasks();
});