const API_BASE_URL = 'http://localhost:5000/api';

// Auth Form Switching
document.addEventListener('DOMContentLoaded', () => {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginTab?.addEventListener('click', () => {
        loginTab.classList.add('active', 'bg-gradient-to-r', 'from-orange-500', 'to-amber-500', 'text-white', 'shadow-md');
        loginTab.classList.remove('bg-orange-50/50', 'text-orange-800');
        
        registerTab.classList.remove('active', 'bg-gradient-to-r', 'from-orange-500', 'to-amber-500', 'text-white', 'shadow-md');
        registerTab.classList.add('bg-orange-50/50', 'text-orange-800');
        
        loginForm.classList.remove('hidden');
        loginForm.classList.add('active');
        registerForm.classList.add('hidden');
    });

    registerTab?.addEventListener('click', () => {
        registerTab.classList.add('active', 'bg-gradient-to-r', 'from-orange-500', 'to-amber-500', 'text-white', 'shadow-md');
        registerTab.classList.remove('bg-orange-50/50', 'text-orange-800');
        
        loginTab.classList.remove('active', 'bg-gradient-to-r', 'from-orange-500', 'to-amber-500', 'text-white', 'shadow-md');
        loginTab.classList.add('bg-orange-50/50', 'text-orange-800');
        
        registerForm.classList.remove('hidden');
        registerForm.classList.add('active');
        loginForm.classList.add('hidden');
    });
});

// Show Error
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    if (errorEl && errorText) {
        errorText.textContent = message;
        errorEl.classList.remove('hidden');
        setTimeout(() => {
            errorEl.classList.add('hidden');
        }, 5000);
    }
}

// Show Success
function showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    const successText = document.getElementById('successText');
    if (successEl && successText) {
        successText.textContent = message;
        successEl.classList.remove('hidden');
        setTimeout(() => {
            successEl.classList.add('hidden');
        }, 5000);
    }
}

// Show Loading
function showLoading(show) {
    const loadingState = document.getElementById('loadingState');
    const authForms = document.querySelectorAll('.auth-form');
    
    if (show) {
        loadingState.classList.remove('hidden');
        authForms.forEach(form => {
            form.querySelectorAll('input, button').forEach(el => el.disabled = true);
        });
    } else {
        loadingState.classList.add('hidden');
        authForms.forEach(form => {
            form.querySelectorAll('input, button').forEach(el => el.disabled = false);
        });
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    showLoading(true);

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSuccess('Login successful! Redirecting...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Handle Register
async function handleRegister(e) {
    e.preventDefault();
    showLoading(true);

    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        showLoading(false);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        showSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showError(error.message);
    } finally {
        showLoading(false);
    }
}

// Show Forgot Password (placeholder)
function showForgotPassword() {
    const email = prompt('Enter your email address:');
    if (email) {
        // Here you would call the forgot password API
        showSuccess('Password reset instructions sent to your email!');
    }
}
