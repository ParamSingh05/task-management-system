const API_URL = '/api';

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
    const userInfoEl = document.getElementById('userInfo');
    const welcomeEl = document.getElementById('welcomeMessage');
    if (userInfoEl) userInfoEl.textContent = userName;
    if (welcomeEl) welcomeEl.textContent = `Welcome back, ${userName}! 👋`;
}

async function loadTaskStats() {
    try {
        const response = await fetch(`${API_URL}/tasks/stats`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (response.status === 401) {
            localStorage.clear();
            window.location.href = '/';
            return;
        }

        const data = await response.json();

        if (data.success) {
            document.getElementById('totalTasks').textContent = data.stats.total;

            let pending = 0, inProgress = 0, completed = 0;
            data.stats.byStatus.forEach(item => {
                if (item.status === 'Pending') pending = item.count;
                if (item.status === 'In Progress') inProgress = item.count;
                if (item.status === 'Completed') completed = item.count;
            });

            document.getElementById('pendingTasks').textContent = pending;
            document.getElementById('inProgressTasks').textContent = inProgress;
            document.getElementById('completedTasks').textContent = completed;
        }
    } catch (error) {
        console.error('Stats error:', error);
        showAlert('Failed to load statistics', 'error');
    }
}

const quickTaskForm = document.getElementById('quickTaskForm');
if (quickTaskForm) {
    quickTaskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value.trim();
        const description = document.getElementById('description').value.trim();
        const priority = document.getElementById('priority').value;
        const status = document.getElementById('status').value;
        const category = document.getElementById('category').value;

        if (!title) {
            showAlert('Task title is required', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include',
                body: JSON.stringify({ title, description, priority, status, category })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Task created successfully! 🎉', 'success');
                quickTaskForm.reset();
                loadTaskStats();
            } else {
                showAlert(data.message || 'Failed to create task', 'error');
            }
        } catch (error) {
            console.error('Create task error:', error);
            showAlert('Failed to create task', 'error');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadTaskStats();
});