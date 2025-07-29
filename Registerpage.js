document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  console.log('Form submitted');
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const terms = document.getElementById('terms').checked;
  const messageDiv = document.getElementById('message');
  
  if (!terms) {
    messageDiv.textContent = 'You must agree to the terms of usage to register';
    messageDiv.className = 'message error';
    messageDiv.style.display = 'block';
    return;
  }

  try {
    // --- THIS IS THE FIX ---
    // The URL now correctly points to the /api/auth/register endpoint on your live server.
    const response = await fetch('https://msomi-backend.onrender.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      messageDiv.textContent = "Registration successful! Redirecting...";
      messageDiv.className = 'message success';
      // Save user data to localStorage so they are logged in immediately
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      setTimeout(() => {
        window.location.href = 'HomePage.html';
      }, 1500);
    } else {
      throw new Error(data.error || 'Registration failed');
    }
  } catch (err) {
    console.error('Fetch Error:', err);
    messageDiv.textContent = 'Error: ' + err.message;
    messageDiv.className = 'message error';
  } finally {
      messageDiv.style.display = 'block';
  }
});

function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.querySelector('.toggle-icon');
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.textContent = '👁️‍🗨️';
  } else {
    passwordInput.type = 'password';
    toggleIcon.textContent = '👁️';
  }
}
