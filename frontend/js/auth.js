// API Base URL
const API_URL = 'https://task-management-system-ypyr.onrender.com/api';

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
// CHECK IF ALREADY LOGGED IN
// ========================================
async function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Already logged in, redirect to dashboard
        window.location.href = 'dashboard.html';
    }
}

// Run check on login/register pages
if (window.location.pathname.includes('index.html') || 
    window.location.pathname.includes('register.html') ||
    window.location.pathname === '/' ||
    window.location.pathname.endsWith('/')) {
    checkAuth();
}

// ========================================
// HELPER FUNCTIONS
// ========================================
function showAlert(message, type = 'success') {
    const alertDiv = document.getElementById('alertMessage');
    if (alertDiv) {
        alertDiv.innerHTML = `
            <div class="alert alert-${type}">
                ${message}
            </div>
        `;

        setTimeout(() => {
            alertDiv.innerHTML = '';
        }, 5000);
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ========================================
// LOGIN FORM HANDLER
// ========================================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validation
        if (!validateEmail(email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }

        try {
            console.log('🔵 Attempting login...');

            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('🔵 Login response:', data);

            if (data.success) {
                // Store token in localStorage
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userName', data.user.name);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('userId', data.user.id);

                console.log('✅ Token stored, redirecting...');
                showAlert('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 500);
            } else {
                showAlert(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('❌ Login error:', error);
            showAlert('Connection error. Is the server running?', 'error');
        }
    });
}

// ========================================
// REGISTER FORM HANDLER
// ========================================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (name.length < 3) {
            showAlert('Name must be at least 3 characters', 'error');
            return;
        }

        if (!validateEmail(email)) {
            showAlert('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 6) {
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showAlert('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                showAlert('Registration successful! Redirecting to login...', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                showAlert(data.message, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showAlert('Connection error. Please try again.', 'error');
        }
    });
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
        // Clear localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        
        window.location.href = 'index.html';
    }
}