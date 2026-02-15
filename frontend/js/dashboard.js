const API_URL = 'http://localhost:5000/api';

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    const userName = localStorage.getItem('userName');
    
    if (!token || !userName) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

function loadUserInfo() {
    if (!checkAuthentication()) return;
    
    const userName = localStorage.getItem('userName');
    document.getElementById('userInfo').textContent = userName;
    document.getElementById('welcomeMessage').textContent = `Welcome back, ${userName}! 👋`;
}

async function loadTaskStats() {
    try {
        const response = await fetch(`${API_URL}/tasks/stats`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to fetch statistics');

        const data = await response.json();
        
        if (data.success) {
            const stats = data.stats;
            document.getElementById('totalTasks').textContent = stats.total;

            let pending = 0, inProgress = 0, completed = 0;

            stats.byStatus.forEach(item => {
                if (item.status === 'Pending') pending = item.count;
                if (item.status === 'In Progress') inProgress = item.count;
                if (item.status === 'Completed') completed = item.count;
            });

            document.getElementById('pendingTasks').textContent = pending;
            document.getElementById('inProgressTasks').textContent = inProgress;
            document.getElementById('completedTasks').textContent = completed;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showAlert('Failed to load task statistics', 'error');
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
                showAlert(data.message, 'error');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            showAlert('Failed to create task', 'error');
        }
    });
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
    loadTaskStats();
});