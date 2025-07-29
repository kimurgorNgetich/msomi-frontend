document.addEventListener('DOMContentLoaded', () => {
    const resourceContainer = document.getElementById('resource-container');
    const backButton = document.getElementById('back-button');
    let resourceId = null;

    backButton.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.back();
    });

    const getResourceId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('resourceId');
    };

    const fetchResource = async () => {
        resourceId = getResourceId();
        if (!resourceId) {
            resourceContainer.innerHTML = '<p style="color: red;">Error: No resource ID provided.</p>';
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/resources/${resourceId}`);
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch resource details.');
            }
            const { data } = await response.json();
            renderResource(data);
        } catch (error) {
            resourceContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        }
    };

    const renderResource = (resource) => {
        resourceContainer.innerHTML = `
            <h1>${resource.title}</h1>
            <div class="detail"><strong>Description:</strong> ${resource.description}</div>
            <div class="detail"><strong>Category:</strong> ${resource.category?.name || 'N/A'}</div>
            <div class="detail"><strong>Uploaded by:</strong> ${resource.uploadedBy?.name || 'Unknown'}</div>
            <div class="detail"><strong>Average Rating:</strong> ${resource.averageRating} / 5</div>
            <a href="#" class="download-btn" id="download-button">Download</a>

            <div class="rating-section">
                <h2>Rate this resource</h2>
                <div class="star-rating">
                    <input type="radio" id="star5" name="rating" value="5" /><label for="star5" title="5 stars">★</label>
                    <input type="radio" id="star4" name="rating" value="4" /><label for="star4" title="4 stars">★</label>
                    <input type="radio" id="star3" name="rating" value="3" /><label for="star3" title="3 stars">★</label>
                    <input type="radio" id="star2" name="rating" value="2" /><label for="star2" title="2 stars">★</label>
                    <input type="radio" id="star1" name="rating" value="1" /><label for="star1" title="1 star">★</label>
                </div>
                <div id="rating-message" class="message"></div>
            </div>
        `;

        // Add event listeners after rendering
        document.getElementById('download-button').addEventListener('click', (e) => {
            e.preventDefault();
            handleDownload(resource._id, resource.fileName);
        });

        document.querySelectorAll('.star-rating input').forEach(star => {
            star.addEventListener('change', handleRatingSubmit);
        });
    };

    const handleRatingSubmit = async (event) => {
        const rating = parseInt(event.target.value, 10);
        const messageDiv = document.getElementById('rating-message');

        try {
            const response = await fetch(`http://localhost:5000/api/resources/${resourceId}/rate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ rating }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'Failed to submit rating.');
            }
            
            messageDiv.textContent = 'Thank you for your rating!';
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';
            
            // Refresh the resource details to show the new average rating
            await fetchResource();

        } catch (error) {
            messageDiv.textContent = `Error: ${error.message}`;
            messageDiv.className = 'message error';
            messageDiv.style.display = 'block';
        }
    };

    const handleDownload = async (id, filename) => {
        try {
            const response = await fetch(`http://localhost:5000/api/resources/${id}/download`, {
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
    };

    // Initial load
    fetchResource();
});
