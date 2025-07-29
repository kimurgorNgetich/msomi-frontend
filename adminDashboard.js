document.addEventListener('DOMContentLoaded', () => {
    const messageContainer = document.getElementById('message-container');
    const usersTableContainer = document.getElementById('users-table-container');
    const resourcesTableContainer = document.getElementById('resources-table-container');
    const categoriesListContainer = document.getElementById('categories-list-container');
    const createCategoryForm = document.getElementById('create-category-form');
    const modal = document.getElementById('confirmation-modal');
    const modalText = document.getElementById('modal-text');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    
    const API_BASE_URL = 'https://msomi-backend.onrender.com';
    let deleteAction = null;

    const showMessage = (text, type = 'error') => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = text;
        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 5000);
    };

    const openConfirmationModal = (text, onConfirm) => {
        modalText.textContent = text;
        deleteAction = onConfirm;
        modal.style.display = 'flex';
    };

    const closeConfirmationModal = () => {
        modal.style.display = 'none';
        deleteAction = null;
    };

    const checkAdminStatus = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || user.role !== 'admin') {
                alert('Access Denied: You must be an admin to view this page.');
                window.location.href = 'HomePage.html';
                return false;
            }
            return true;
        } catch (e) {
            window.location.href = 'LoginPage.html';
            return false;
        }
    };

    const fetchAndRenderAll = () => {
        fetchUsers();
        fetchResources();
        fetchCategories();
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, { credentials: 'include' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to fetch users.');
            
            let tableHtml = `<table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead><tbody>`;
            result.data.forEach(user => {
                tableHtml += `<tr>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        ${user.role !== 'admin' ? `<button class="delete-btn" data-type="user" data-id="${user._id}">Delete</button>` : 'Cannot delete admin'}
                    </td>
                </tr>`;
            });
            tableHtml += '</tbody></table>';
            usersTableContainer.innerHTML = tableHtml;
        } catch (err) {
            usersTableContainer.innerHTML = `<p style="color: red;">Error fetching users: ${err.message}</p>`;
        }
    };

    const fetchResources = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/resources`, { credentials: 'include' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to fetch resources.');

            let tableHtml = `<table><thead><tr><th>Title</th><th>Category</th><th>Uploaded By</th><th>Actions</th></tr></thead><tbody>`;
            result.data.forEach(resource => {
                tableHtml += `<tr>
                    <td>${resource.title}</td>
                    <td>${resource.category?.name || 'N/A'}</td>
                    <td>${resource.uploadedBy?.name || 'N/A'}</td>
                    <td><button class="delete-btn" data-type="resource" data-id="${resource._id}">Delete</button></td>
                </tr>`;
            });
            tableHtml += '</tbody></table>';
            resourcesTableContainer.innerHTML = tableHtml;
        } catch (err) {
            resourcesTableContainer.innerHTML = `<p style="color: red;">Error fetching resources: ${err.message}</p>`;
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories`);
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Failed to fetch categories.');

            let listHtml = '<ul class="category-list">';
            result.data.forEach(category => {
                listHtml += `<li class="category-item">
                    <span>${category.name}</span>
                    <button class="delete-btn" data-type="category" data-id="${category._id}">Delete</button>
                </li>`;
            });
            listHtml += '</ul>';
            categoriesListContainer.innerHTML = listHtml;
        } catch (err) {
            categoriesListContainer.innerHTML = `<p style="color: red;">Error fetching categories: ${err.message}</p>`;
        }
    };

    createCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('category-name').value.trim();
        if (!name) return showMessage('Category name cannot be empty.');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/categories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            
            showMessage('Category created successfully!', 'success');
            document.getElementById('category-name').value = '';
            fetchCategories();
        } catch (err) {
            showMessage(err.message);
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.matches('.delete-btn')) return;
        const id = e.target.dataset.id;
        const type = e.target.dataset.type;
        
        if (type === 'user') {
            openConfirmationModal('Are you sure you want to delete this user and all their content? This is irreversible.', () => handleDelete(type, id));
        } else if (type === 'resource') {
            openConfirmationModal('Are you sure you want to delete this resource?', () => handleDelete(type, id));
        } else if (type === 'category') {
            openConfirmationModal('Are you sure? This only works if no resources are using this category.', () => handleDelete(type, id));
        }
    });
    
    modalCancelBtn.addEventListener('click', closeConfirmationModal);
    modalConfirmBtn.addEventListener('click', () => {
        if (typeof deleteAction === 'function') {
            deleteAction();
        }
    });

    const handleDelete = async (type, id) => {
        try {
            // --- THIS IS THE FIX ---
            // The URL for categories was incorrect ("categorys"). It is now "categories".
            const endpoint = (type === 'category') ? 'categories' : `${type}s`;
            
            const response = await fetch(`${API_BASE_URL}/api/admin/${endpoint}/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            
            showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`, 'success');
            fetchAndRenderAll();
        } catch (err) {
            showMessage(err.message);
        } finally {
            closeConfirmationModal();
        }
    };

    if (checkAdminStatus()) {
        fetchAndRenderAll();
    }
});
