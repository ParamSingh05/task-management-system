const API_URL = '/api';
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
        window.location.href = '/';
        return false;
    }
    return true;
}

function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
        setTimeout(() => alertDiv.innerHTML = '', 5000);
    }
}

function loadUserInfo() {
    if (!checkAuthentication()) return;
    const userName = localStorage.getItem('userName');
    const el = document.getElementById('userInfo');
    if (el) el.textContent = userName;
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

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/';
            return;
        }

        const data = await response.json();
        document.getElementById('loadingState').classList.add('hidden');

        if (data.success) {
            allTasks = data.tasks;
            if (allTasks.length === 0) {
                document.getElementById('emptyState').classList.remove('hidden');
            } else {
                displayTasks(allTasks);
            }
        }
    } catch (error) {
        console.error('Load tasks error:', error);
        document.getElementById('loadingState').classList.add('hidden');
        showAlert('Failed to load tasks', 'error');
    }
}

function displayTasks(tasks) {
    const container = document.getElementById('tasksContainer');

    if (tasks.length === 0) {
        container.classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');
    container.classList.remove('hidden');
    container.innerHTML = '';

    tasks.forEach(task => {
        container.appendChild(createTaskCard(task));
    });
}

function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = `task-card priority-${task.priority.toLowerCase()}`;

    const date = new Date(task.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
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
        <div class="task-date">📅 ${date}</div>
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
    const status = document.getElementById('statusFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    const category = document.getElementById('categoryFilter').value;

    let filtered = allTasks;
    if (status !== 'all') filtered = filtered.filter(t => t.status === status);
    if (priority !== 'all') filtered = filtered.filter(t => t.priority === priority);
    if (category !== 'all') filtered = filtered.filter(t => t.category === category);

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
    if (e.target.id === 'editModal') closeEditModal();
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
            showAlert('Title is required', 'error');
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
                showAlert('Task updated! ✅', 'success');
                closeEditModal();
                loadTasks();
            } else {
                showAlert(data.message || 'Update failed', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showAlert('Failed to update task', 'error');
        }
    });
}

async function deleteTask(taskId) {
    const task = allTasks.find(t => t.id === taskId);
    if (!confirm(`Delete "${task?.title}"?`)) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Task deleted! 🗑️', 'success');
            loadTasks();
        } else {
            showAlert(data.message || 'Delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showAlert('Failed to delete task', 'error');
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
    } catch (e) {
        console.error(e);
    } finally {
        localStorage.clear();
        window.location.href = '/';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadTasks();
});