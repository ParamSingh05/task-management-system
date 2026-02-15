const API_URL = 'http://localhost:5000/api';
let allTasks = [];

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function loadUserInfo() {
    if (!checkAuthentication()) return;
    const userName = localStorage.getItem('userName');
    document.getElementById('userInfo').textContent = userName;
}

async function loadTasks() {
    try {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('tasksContainer').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');

        const response = await fetch(`${API_URL}/tasks`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch tasks');

        const data = await response.json();

        if (data.success) {
            allTasks = data.tasks;
            document.getElementById('loadingState').classList.add('hidden');

            if (allTasks.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                displayTasks(allTasks);
            }
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        document.getElementById('loadingState').classList.add('hidden');
        showAlert('Failed to load tasks', 'error');
    }
}

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
        const card = createTaskCard(task);
        container.appendChild(card);
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority.toLowerCase()}`;

    const createdDate = new Date(task.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const statusClass = task.status.toLowerCase().replace(' ', '-');

    card.innerHTML = `
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-badges">
            <span class="badge badge-priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <span class="badge badge-status-${statusClass}">${task.status}</span>
            <span class="badge badge-category">${task.category}</span>
        </div>
        ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-date">Created on ${createdDate}</div>
        <div class="task-actions">
            <button class="btn btn-warning btn-small" onclick="openEditModal(${task.id})">✏️ Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">🗑️ Delete</button>
        </div>
    `;

    return card;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function filterTasks() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;

    let filtered = allTasks;

    if (statusFilter !== 'all') {
        filtered = filtered.filter(t => t.status === statusFilter);
    }
    if (priorityFilter !== 'all') {
        filtered = filtered.filter(t => t.priority === priorityFilter);
    }
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(t => t.category === categoryFilter);
    }

    displayTasks(filtered);
}

function openEditModal(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTitle').value = task.title;
    document.getElementById('editDescription').value = task.description || '';
    document.getElementById('editPriority').value = task.priority;
    document.getElementById('editStatus').value = task.status;
    document.getElementById('editCategory').value = task.category;

    document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
}

document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target.id === 'editModal') {
        closeEditModal();
    }
});

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
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({ title, description, priority, status, category })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Task updated successfully! ✅', 'success');
                closeEditModal();
                loadTasks();
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            console.error('Error updating task:', error);
            showAlert('Failed to update task', 'error');
        }
    });
}

async function deleteTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!task) return;

    if (!confirm(`Are you sure you want to delete "${task.title}"?`)) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Task deleted successfully! 🗑️', 'success');
            loadTasks();
        } else {
            showAlert(data.message, 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showAlert('Failed to delete task', 'error');
    }
}

function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadTasks();
});