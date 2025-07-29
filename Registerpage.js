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
    messageDiv.classList.add('error');
    messageDiv.classList.remove('success');
    messageDiv.style.display = 'block';
    return;
  }

  try {
   const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    if (response.ok) {
      messageDiv.textContent = data.message;
      messageDiv.classList.add('success');
      messageDiv.classList.remove('error');
      setTimeout(() => {
        window.location.href = 'HomePage.html';
      }, 1000);
    } else {
      messageDiv.textContent = data.error || 'Registration failed';
      messageDiv.classList.add('error');
      messageDiv.classList.remove('success');
    }
    messageDiv.style.display = 'block';
  } catch (err) {
    console.error('Fetch Error:', err);
    messageDiv.textContent = 'Error: ' + err.message;
    messageDiv.classList.add('error');
    messageDiv.classList.remove('success');
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