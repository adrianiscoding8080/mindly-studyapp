// --- Handle Sign Up Form ---
const signupForm = document.getElementById('signup-form');

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('signup-username').value;
    const passwordInput = document.getElementById('signup-password').value;

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! You can now log in.');
        signupForm.reset();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Registration request failed:', error);
      alert('Could not connect to the server.');
    }
  });
}

// --- Handle Login Form ---
const loginForm = document.getElementById('login-form');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('login-username').value;
    const passwordInput = document.getElementById('login-password').value;

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Login successful!');
        // Redirect user or update state (e.g., window.location.href = '/dashboard.html')
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Login request failed:', error);
      alert('Could not connect to the server.');
    }
  });
}