document.addEventListener('DOMContentLoaded', async () => {
  const uploadForm = document.getElementById('uploadForm');
  const messageDiv = document.getElementById('message');
  const categorySelect = document.getElementById('category');
  const fileInput = document.getElementById('file');
  const fileUpload = document.getElementById('file-upload');
  const fileName = document.getElementById('file-name');
  const uploadButton = document.querySelector('.upload-btn');

  // Fetch categories
  try {
    const response = await fetch('http://localhost:5000/api/categories');
    const data = await response.json();
    if (response.ok) {
      if (data.data.length > 0) {
        data.data.forEach(category => {
          const option = document.createElement('option');
          option.value = category._id;
          option.textContent = category.name;
          categorySelect.appendChild(option);
        });
      }
    } else {
      throw new Error(data.error || 'Failed to load categories');
    }
  } catch (err) {
    console.error('Fetch Categories Error:', err);
    messageDiv.textContent = 'Error: ' + err.message;
    messageDiv.className = 'message error';
    messageDiv.style.display = 'block';
  }

  // File input change handler
  fileInput.addEventListener('change', () => {
    fileName.textContent = fileInput.files[0]?.name || 'No file selected';
  });

  // Click to open file input
  fileUpload.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag-and-drop handlers
  fileUpload.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUpload.classList.add('dragover');
  });
  fileUpload.addEventListener('dragleave', () => {
    fileUpload.classList.remove('dragover');
  });
  fileUpload.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUpload.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileName.textContent = fileInput.files[0].name;
    }
  });

  // Form submission
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    uploadButton.disabled = true;
    uploadButton.textContent = 'Uploading...';
    messageDiv.style.display = 'none';

    const formData = new FormData();
    formData.append('title', document.getElementById('course-name').value);
    formData.append('description', document.getElementById('course-code').value);
    formData.append('category', document.getElementById('category').value);
    formData.append('file', fileInput.files[0]);

    try {
      const response = await fetch('http://localhost:5000/api/resources', {
        method: 'POST',
        // --- THIS IS THE FIX ---
        // This line ensures the authentication cookie is sent with the request.
        credentials: 'include', 
        body: formData,
      });
      
      const data = await response.json();

      if (response.ok) {
        messageDiv.textContent = data.message;
        messageDiv.className = 'message success';
        uploadForm.reset();
        fileName.textContent = 'No file selected';
        setTimeout(() => {
          // Redirect to the new detail page of the uploaded resource
          window.location.href = `ResourceDetail.html?resourceId=${data.data._id}`;
        }, 1000);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Fetch Error:', err);
      messageDiv.textContent = 'Error: ' + err.message;
      messageDiv.className = 'message error';
    } finally {
        uploadButton.disabled = false;
        uploadButton.textContent = 'Upload File';
        messageDiv.style.display = 'block';
    }
  });
});
