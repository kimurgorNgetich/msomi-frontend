document.addEventListener('DOMContentLoaded', async () => {
    console.log('categories.js loaded');
    const categoryContainer = document.getElementById('categoryContainer');
    if (!categoryContainer) {
        console.error('categoryContainer not found');
        return;
    }

    // --- UPDATED: A more robust helper function to map names to classes ---
    const getCategoryClass = (name) => {
        const normalizedName = name.toLowerCase().replace(/\s*&\s*/g, ' & '); // Normalize spacing around '&'
        
        // This mapping is safer than using .includes()
        const categoryMap = {
            'business & economics': 'category-business',
            'ict': 'category-ict',
            'law': 'category-law',
            'education': 'category-education',
            'music': 'category-music',
            'health sciences': 'category-health',
            'mathematics': 'category-mathematics',
            'physics & engineering': 'category-physics',
            'hospitality': 'category-hospitality'
        };
        // Return the matching class, or the default if no match is found
        return categoryMap[normalizedName] || 'category-default';
    };

     try {
        // --- THIS IS THE ONLY LINE THAT HAS CHANGED ---
        // The URL now correctly points to the /api/categories endpoint.
        const response = await fetch('https://msomi-backend.onrender.com/api/categories');
        const data = await response.json();
        
        if (response.ok) {
            if (data.data.length === 0) {
                categoryContainer.innerHTML = '<p style="color: white; text-align: center;">No categories found</p>';
                return;
            }

            let currentRow = document.createElement('div');
            currentRow.className = 'button-row';
            let count = 0;

            data.data.forEach(category => {
                // Use the new, more reliable helper function
                const categoryClass = getCategoryClass(category.name);
                
                const button = document.createElement('a');
                button.href = `DocList.html?categoryId=${category._id}`;
                button.target = '_top'; 
                button.className = `big-button ${categoryClass}`;
                button.innerHTML = `
                    <div class="button-bg"></div>
                    <div class="button-overlay">
                        <h2 class="button-title">${category.name}</h2>
                    </div>
                `;
                currentRow.appendChild(button);
                count++;

                if (count % 3 === 0) {
                    categoryContainer.appendChild(currentRow);
                    currentRow = document.createElement('div');
                    currentRow.className = 'button-row';
                }
            });

            if (currentRow.childElementCount > 0) {
                categoryContainer.appendChild(currentRow);
            }

        } else {
            categoryContainer.innerHTML = `<p style="color: red;">Error: ${data.error || 'Failed to load categories'}</p>`;
        }
    } catch (err) {
        console.error('Fetch Categories Error:', err);
        categoryContainer.innerHTML = `<p style="color: red;">Error: ${err.message}</p>`;
    }
});
