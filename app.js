// API Base URL Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize application components once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initAuthForms();
  initDynamicFeatures();
  checkExistingSession();
});

// --- Utility Functions ---

// Display feedback messages to the user
function showMessage(container, text, isError = false) {
  if (!container) return;
  container.textContent = text;
  container.style.color = isError ? '#ff4757' : '#2ed573';
}

// Clear message container
function clearMessage(container) {
  if (container) container.textContent = '';
}

// Toggle button text and disabled state during async calls
function setLoadingState(button, isLoading, defaultText = 'Submit') {
  if (!button) return;
  button.disabled = isLoading;
  button.textContent = isLoading ? 'Processing...' : defaultText;
}

// --- 1. Authentication Form Logic ---
function initAuthForms() {
  const toggleLoginBtn = document.getElementById('toggle-login');
  const toggleSignupBtn = document.getElementById('toggle-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const messageDiv = document.getElementById('message');

  // Skip execution if auth elements are absent on the current page
  if (!loginForm || !signupForm) return;

  // Form Tab Toggling
  if (toggleLoginBtn && toggleSignupBtn) {
    toggleLoginBtn.addEventListener('click', () => {
      toggleLoginBtn.classList.add('active');
      toggleSignupBtn.classList.remove('active');
      loginForm.classList.remove('hidden');
      signupForm.classList.add('hidden');
      clearMessage(messageDiv);
    });

    toggleSignupBtn.addEventListener('click', () => {
      toggleSignupBtn.classList.add('active');
      toggleLoginBtn.classList.remove('active');
      signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
      clearMessage(messageDiv);
    });
  }

  // Handle Signup Submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = signupForm.querySelector('button[type="submit"]');

    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    // Validation checks
    if (!username || !email || !password) {
      showMessage(messageDiv, 'Please fill in all fields.', true);
      return;
    }

    if (password.length < 6) {
      showMessage(messageDiv, 'Password must be at least 6 characters.', true);
      return;
    }

    setLoadingState(submitBtn, true);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(messageDiv, 'Account created successfully! Switching to login...');
        signupForm.reset();
        
        setTimeout(() => {
          if (toggleLoginBtn) toggleLoginBtn.click();
        }, 1200);
      } else {
        showMessage(messageDiv, data.message || 'Signup failed.', true);
      }
    } catch (error) {
      console.error('Signup error:', error);
      showMessage(messageDiv, 'Unable to connect to the server.', true);
    } finally {
      setLoadingState(submitBtn, false, 'Sign Up');
    }
  });

  // Handle Login Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');

    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
      showMessage(messageDiv, 'Please enter your email and password.', true);
      return;
    }

    setLoadingState(submitBtn, true);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage(messageDiv, `Welcome back, ${data.user.username}!`);
        
        // Save user details to localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        loginForm.reset();

        // Redirect to homepage at root level
        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } else {
        showMessage(messageDiv, data.message || 'Invalid credentials.', true);
      }
    } catch (error) {
      console.error('Login error:', error);
      showMessage(messageDiv, 'Unable to connect to the server.', true);
    } finally {
      setLoadingState(submitBtn, false, 'Log In');
    }
  });
}

// --- 2. Dynamic Feature Loader (index.html) ---
async function initDynamicFeatures() {
  const featuresGrid = document.querySelector('.features-grid');
  if (!featuresGrid) return;

  try {
    const response = await fetch(`${API_BASE_URL}/features`);
    if (!response.ok) return;

    const features = await response.json();

    // Populate feature cards dynamically if API responds with array data
    if (Array.isArray(features) && features.length > 0) {
      featuresGrid.innerHTML = features.map(item => `
        <div class="feature-card">
          <div class="card-icon">${item.icon || '✨'}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      `).join('');
    }
  } catch (error) {
    console.warn('Backend offline or unavailable for feature loading. Utilizing fallback layout.');
  }
}

// --- 3. Persistent Session State ---
function checkExistingSession() {
  const savedUser = localStorage.getItem('currentUser');
  if (!savedUser) return;

  try {
    const user = JSON.parse(savedUser);
    const navActions = document.querySelector('.nav-actions');

    if (navActions && user.username) {
      navActions.innerHTML = `
        <span class="user-greeting" style="color: #ffffff; font-weight: 500;">Hello, ${user.username}</span>
        <button id="logout-btn" class="btn btn-outline" style="cursor: pointer;">Log Out</button>
      `;

      document.getElementById('logout-btn')?.addEventListener('click', logoutUser);
    }
  } catch (e) {
    localStorage.removeItem('currentUser');
  }
}

function logoutUser() {
  localStorage.removeItem('currentUser');
  window.location.reload();
}