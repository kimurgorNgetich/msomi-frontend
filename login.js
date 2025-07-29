document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const messageDiv = document.getElementById('message');

  try {
    const response = await fetch('https://msomi-backend.onrender.com', {
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
      // --- THIS IS THE FIX ---
      // The user object returned from the API must be saved to localStorage
      // so other scripts (like homepageScript.js) can check the user's role.
      if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
      }
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      messageDiv.textContent = 'Login successful';
      messageDiv.className = 'message success';
      messageDiv.style.display = 'block';
      
      setTimeout(() => {
        window.location.href = 'HomePage.html';
      }, 1000);

    } else {
      messageDiv.textContent = data.error || 'Login failed';
      messageDiv.className = 'message error';
      messageDiv.style.display = 'block';
    }
  } catch (err) {
    console.error('Login Fetch Error:', err);
    messageDiv.textContent = 'Error: ' + err.message;
    messageDiv.className = 'message error';
    messageDiv.style.display = 'block';
  }
});
