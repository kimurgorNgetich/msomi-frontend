document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');

  try {
    // --- THIS IS THE FIX ---
    // The URL now correctly points to the /api/auth/login endpoint on your live server.
    const response = await fetch('https://msomi-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('Login response data:', data);

    if (response.ok) {
      if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      messageDiv.textContent = 'Login successful';
      messageDiv.className = 'message success';
      
      setTimeout(() => {
        window.location.href = 'HomePage.html';
      }, 1000);

    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (err) {
    console.error('Login Fetch Error:', err);
    messageDiv.textContent = 'Error: ' + err.message;
    messageDiv.className = 'message error';
  } finally {
      messageDiv.style.display = 'block';
  }
});
