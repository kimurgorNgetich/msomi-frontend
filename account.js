// frontend resources/account.js

document.addEventListener('DOMContentLoaded', async function() {
    // --- ELEMENT SELECTORS ---
    const contentList = document.getElementById('contentList');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const passwordError = document.getElementById('passwordError');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    // Modals
    const deleteContentModal = document.getElementById('deleteContentModal');
    const cancelDeleteContent = document.getElementById('cancelDeleteContent');
    const confirmDeleteContent = document.getElementById('confirmDeleteContent');
    const deleteAccountModal = document.getElementById('deleteAccountModal');
    const cancelDeleteAccount = document.getElementById('cancelDeleteAccount');
    const confirmDeleteAccount = document.getElementById('confirmDeleteAccount');
    const deleteAccountError = document.getElementById('deleteAccountError');

    let contentToDelete = null;

    // --- DATA FETCHING ---
    const loadContent = async () => {
        try {
            // --- CHANGE: Call the new, dedicated endpoint ---
            const response = await fetch('http://localhost:5000/api/resources/my-resources', { 
                credentials: 'include' 
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to load your resources.');
            }
            const { data } = await response.json();
            
            contentList.innerHTML = '';
            if (data.length === 0) {
                contentList.innerHTML = '<p>You have not uploaded any content yet.</p>';
                return;
            }

            // No client-side filtering is needed anymore! The backend does the work.
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'content-item';
                div.innerHTML = `
                    <div>
                        <div class="content-title">${item.title}</div>
                        <div class="content-date">Uploaded: ${new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                    <button class="danger-btn delete-content-btn" data-id="${item._id}">Delete</button>
                `;
                contentList.appendChild(div);
            });

            // Re-attach event listeners after rendering
            document.querySelectorAll('.delete-content-btn').forEach(button => {
                button.addEventListener('click', function() {
                    contentToDelete = this.getAttribute('data-id');
                    deleteContentModal.style.display = 'flex';
                });
            });

        } catch (error) {
            contentList.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    };
    
    // Change Password Form
    changePasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        passwordError.textContent = '';
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            passwordError.textContent = 'New passwords do not match.';
            return;
        }
        
        try {
            const response = await fetch('http://localhost:5000/api/auth/changepassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // This request needs credentials to be sent
                credentials: 'include',
                // The body is now correct and does not send the email
                body: JSON.stringify({ currentPassword, newPassword }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to change password.');
            }
            alert('Password changed successfully!');
            changePasswordForm.reset();
        } catch (error) {
            passwordError.textContent = error.message;
        }
    });

    // Delete Account Logic
    deleteAccountBtn.addEventListener('click', () => {
        deleteAccountModal.style.display = 'flex';
    });

    confirmDeleteAccount.addEventListener('click', async () => {
        deleteAccountError.textContent = '';
        const password = document.getElementById('deleteAccountPassword').value;
        if (!password) {
            deleteAccountError.textContent = 'Password is required.';
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/deleteaccount', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                // This request needs credentials to be sent
                credentials: 'include',
                // The body is now correct and does not send the email
                body: JSON.stringify({ password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete account.');
            }
            alert('Account deleted successfully.');
            localStorage.clear(); // Clear all user data
            window.location.href = 'RegisterPage.html';
        } catch (error) {
            deleteAccountError.textContent = error.message;
        }
    });

    // Delete Content Logic
    confirmDeleteContent.addEventListener('click', async () => {
        if (!contentToDelete) return;
        try {
            const response = await fetch(`http://localhost:5000/api/resources/${contentToDelete}`, {
                method: 'DELETE',
                // This request needs credentials to be sent
                credentials: 'include'
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete content.');
            }
            alert('Content deleted successfully');
            await loadContent(); // Refresh the list
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            deleteContentModal.style.display = 'none';
            contentToDelete = null;
        }
    });

    // Modal Closing Logic
    cancelDeleteContent.addEventListener('click', () => deleteContentModal.style.display = 'none');
    cancelDeleteAccount.addEventListener('click', () => deleteAccountModal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target === deleteContentModal) deleteContentModal.style.display = 'none';
        if (e.target === deleteAccountModal) deleteAccountModal.style.display = 'none';
    });

    // Initial Load
    await loadContent();
});
