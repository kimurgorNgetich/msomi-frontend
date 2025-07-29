document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMENT SELECTORS ---
    const homeButton = document.querySelector('.title-bar-home');
    const searchButton = document.querySelector('.search-btn');
    const menuButton = document.querySelector('.menu-btn');
    const categoriesButton = document.querySelector('.categories-btn');
    const titleBar = document.querySelector('.title-bar');
    const resourcesContainer = document.getElementById('resources-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    // --- DEFINE THE LIVE BACKEND URL ---
    const API_BASE_URL = 'https://msomi-backend.onrender.com';

    // --- SEARCH BAR SETUP ---
    const searchBar = document.createElement('div');
    searchBar.className = 'search-bar';
    searchBar.style.display = 'none';
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'search-input';
    searchInput.placeholder = "I'm looking for...";
    const closeSearch = document.createElement('button');
    closeSearch.className = 'close-search';
    closeSearch.innerHTML = '×';
    const searchResultsContainer = document.createElement('div');
    searchResultsContainer.className = 'search-results-container';
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchResultsContainer);
    searchBar.appendChild(searchContainer);
    searchBar.appendChild(closeSearch);
    titleBar.parentNode.insertBefore(searchBar, titleBar.nextSibling);
    
    // --- MENU PANEL SETUP ---
    const menuPanel = document.createElement('div');
    menuPanel.className = 'menu-panel';
    const menuContent = document.createElement('div');
    menuContent.className = 'menu-content';
    const closeMenu = document.createElement('button');
    closeMenu.className = 'close-menu';
    closeMenu.innerHTML = '×';
    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    const menuItems = [
        { text: 'Upload', url: 'UploadPage.html' },
        { text: 'Account', url: 'Account.html' },
        { text: 'Log out', action: logout }
    ];
    try {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            if (user.role === 'admin') {
                menuItems.unshift({ text: 'Admin Dashboard', url: 'AdminDashboard.html' });
            }
        }
    } catch (e) {
        console.error("Error reading user data from localStorage:", e);
    }
    menuItems.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.url || '#';
        a.textContent = item.text;
        if (item.action) {
            a.addEventListener('click', (e) => { e.preventDefault(); item.action(); });
        } else {
            a.addEventListener('click', (e) => { e.preventDefault(); window.location.href = item.url; });
        }
        li.appendChild(a);
        ul.appendChild(li);
    });
    nav.appendChild(ul);
    menuContent.appendChild(closeMenu);
    menuContent.appendChild(nav);
    menuPanel.appendChild(menuContent);
    document.body.appendChild(menuPanel);

    // --- CATEGORIES PANEL SETUP ---
    const categoriesPanel = document.createElement('div');
    categoriesPanel.className = 'categories-panel';
    const closeCategories = document.createElement('button');
    closeCategories.className = 'close-categories';
    closeCategories.innerHTML = '×';
    const iframe = document.createElement('iframe');
    iframe.className = 'categories-iframe';
    iframe.src = 'categories.html';
    iframe.frameBorder = '0';
    categoriesPanel.appendChild(closeCategories);
    categoriesPanel.appendChild(iframe);
    document.body.appendChild(categoriesPanel);

    // --- EVENT LISTENERS AND CORE FUNCTIONS ---
    function resetToDefault() {
        searchBar.style.display = 'none';
        searchResultsContainer.style.display = 'none';
        menuPanel.classList.remove('active');
        categoriesPanel.classList.remove('active');
        document.body.classList.remove('menu-open', 'categories-open');
    }
    homeButton.addEventListener('click', () => window.location.reload());
    searchButton.addEventListener('click', () => { resetToDefault(); searchBar.style.display = 'block'; searchInput.focus(); });
    closeSearch.addEventListener('click', () => { searchBar.style.display = 'none'; searchResultsContainer.style.display = 'none'; });
    menuButton.addEventListener('click', () => { resetToDefault(); menuPanel.classList.add('active'); document.body.classList.add('menu-open'); });
    closeMenu.addEventListener('click', () => { menuPanel.classList.remove('active'); document.body.classList.remove('menu-open'); });
    categoriesButton.addEventListener('click', () => { resetToDefault(); categoriesPanel.classList.add('active'); document.body.classList.add('categories-open'); });
    closeCategories.addEventListener('click', () => { categoriesPanel.classList.remove('active'); document.body.classList.remove('categories-open'); });
    document.body.addEventListener('click', (e) => { if (e.target === document.body) resetToDefault(); });
    
    // --- RESOURCE DISPLAY FUNCTIONS ---

    async function fetchAndDisplayResources(page = 1) {
        if (!resourcesContainer) return;
        resourcesContainer.innerHTML = `<div class="loader" style="grid-column: 1 / -1;"></div>`;
        paginationContainer.innerHTML = '';

        try {
            // --- FIX: Corrected URL for fetching resources ---
            const response = await fetch(`${API_BASE_URL}/api/resources?page=${page}&limit=6`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch resources');
            }
            const { data, pagination } = await response.json();
            renderResources(data);
            renderPagination(pagination);
        } catch (error) {
            resourcesContainer.innerHTML = `<p style="color: #ffdddd; background: #982c2c; padding: 10px; border-radius: 5px; grid-column: 1 / -1;">Error: ${error.message}</p>`;
        }
    }

    function renderResources(resources) {
        resourcesContainer.innerHTML = '';
        if (resources.length === 0) {
            resourcesContainer.innerHTML = `<p style="color: white; grid-column: 1 / -1; text-align: center;">No resources have been uploaded yet.</p>`;
            return;
        }
        resources.forEach(resource => {
            const card = document.createElement('div');
            card.className = 'document-card';
            card.innerHTML = `
                <h3>${resource.title}</h3>
                <p>Description: ${resource.description}</p>
                <p>Category: ${resource.category?.name || 'N/A'}</p>
                <p>Uploaded by: ${resource.uploadedBy?.name || 'Unknown'}</p>
                <p><strong>Rating: ${resource.averageRating || 0} / 5</strong></p>
                <button class="download-btn" data-id="${resource._id}" data-filename="${resource.fileName}">Download</button>
            `;
            // Make the text part of the card a link to the detail page
            card.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') { // Don't navigate if the download button was clicked
                    window.location.href = `ResourceDetail.html?resourceId=${resource._id}`;
                }
            });
            resourcesContainer.appendChild(card);
        });

        document.querySelectorAll('.download-btn').forEach(button => {
            button.addEventListener('click', handleDownload);
        });
    }

    function renderPagination(pagination) {
        paginationContainer.innerHTML = '';
        if (pagination.totalPages <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = pagination.currentPage === 1;
        prevButton.addEventListener('click', () => fetchAndDisplayResources(pagination.currentPage - 1));

        const pageInfo = document.createElement('span');
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = pagination.currentPage === pagination.totalPages;
        nextButton.addEventListener('click', () => fetchAndDisplayResources(pagination.currentPage + 1));

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextButton);
    }
    
    async function handleDownload(event) {
        const resourceId = event.target.getAttribute('data-id');
        const filename = event.target.getAttribute('data-filename');
        try {
            const response = await fetch(`${API_BASE_URL}/api/resources/${resourceId}/download`, {
                credentials: 'include'
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Download failed');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Download error:', error);
            alert(`Error: ${error.message}`);
        }
    }

    // --- LOGOUT AND SEARCH FUNCTIONS ---
    async function logout() {
        try {
            // --- FIX: Corrected URL for logout ---
            await fetch(`${API_BASE_URL}/api/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });
        } finally {
            localStorage.clear();
            window.location.href = 'LoginPage.html';
        }
    }
    
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    
    searchInput.addEventListener('input', debounce(async function() {
        const query = searchInput.value.trim();
        searchResultsContainer.style.display = 'none';
        searchResultsContainer.innerHTML = '';
        if (query.length === 0) return;
        
        searchResultsContainer.innerHTML = '<div class="loader"></div>';
        searchResultsContainer.style.display = 'block';
        
        try {
            // --- FIX: Corrected URL for search ---
            const response = await fetch(`${API_BASE_URL}/api/resources/search?q=${encodeURIComponent(query)}`);
            const results = await response.json();
            searchResultsContainer.innerHTML = ''; 
            if (!response.ok) throw new Error(results.error || 'Search failed');
            
            if (results.data.length === 0) {
                searchResultsContainer.innerHTML = '<div style="padding: 10px; color: #666;">No results found</div>';
            } else {
                results.data.forEach(result => {
                    const resultDiv = document.createElement('div');
                    resultDiv.style = "padding: 10px; border-bottom: 1px solid #ddd; cursor: pointer;";
                    resultDiv.textContent = `${result.title} - ${result.description}`;
                    resultDiv.onclick = () => { window.location.href = `ResourceDetail.html?resourceId=${result._id}`; };
                    searchResultsContainer.appendChild(resultDiv);
                });
            }
        } catch (error) {
            console.error('Search error:', error);
            searchResultsContainer.innerHTML = `<div style="padding: 10px; color: #c62828;">Error: ${error.message}</div>`;
        }
    }, 300));

    // --- INITIAL DATA LOAD ---
    fetchAndDisplayResources();
});
