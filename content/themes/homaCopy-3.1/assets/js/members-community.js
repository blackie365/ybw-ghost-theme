(function() {
    const API_BASE = 'https://us-central1-newmembersdirectory130325.cloudfunctions.net';
    const POSTS_API = `${API_BASE}/getMemberPosts`;
    const CREATE_POST_API = `${API_BASE}/createMemberPost`;
    const UPLOAD_IMAGE_API = 'https://uploadmemberimage-qljbqfyowq-uc.a.run.app';
    const PAGE_SIZE = 12;

    let currentPage = 0;
    let currentCategory = '';
    let currentSearch = '';
    let hasMore = true;
    let allPosts = [];
    let memberEmail = null;
    let uploadedImageUrl = null;

    // Check authentication
    function checkAuth() {
        // Check localStorage for member session
        const memberData = localStorage.getItem('ybw_member');
        
        if (!memberData) {
            document.getElementById('authCheck').style.display = 'block';
            document.getElementById('communityContent').style.display = 'none';
            return false;
        }

        try {
            const member = JSON.parse(memberData);
            memberEmail = member.email;
            
            document.getElementById('authCheck').style.display = 'none';
            document.getElementById('communityContent').style.display = 'block';
            return true;
        } catch (e) {
            document.getElementById('authCheck').style.display = 'block';
            document.getElementById('communityContent').style.display = 'none';
            return false;
        }
    }

    // Load posts
    async function loadPosts(isReset = false) {
        if (isReset) {
            currentPage = 0;
            allPosts = [];
        }

        const offset = currentPage * PAGE_SIZE;
        let url = `${POSTS_API}?limit=${PAGE_SIZE}&offset=${offset}`;

        if (currentCategory) {
            url += `&category=${encodeURIComponent(currentCategory)}`;
        }

        if (currentSearch) {
            url += `&search=${encodeURIComponent(currentSearch)}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load posts');
            }

            if (isReset) {
                allPosts = data.posts;
            } else {
                allPosts = allPosts.concat(data.posts);
            }

            hasMore = data.metadata.hasMore;
            renderPosts(isReset);
            updateInfo(data.metadata);
        } catch (error) {
            console.error('Error loading posts:', error);
            document.getElementById('postsGrid').innerHTML = 
                '<div class="text-center py-8 col-span-full text-red-500">Error loading posts. Please try again.</div>';
        }
    }

    // Render posts
    function renderPosts(isReset) {
        const grid = document.getElementById('postsGrid');
        
        if (isReset) {
            grid.innerHTML = '';
        }

        if (allPosts.length === 0 && isReset) {
            grid.innerHTML = '<div class="text-center py-8 col-span-full text-gray-500">No posts found. Be the first to share!</div>';
            document.getElementById('loadMoreBtn').style.display = 'none';
            return;
        }

        const postsToRender = isReset ? allPosts : allPosts.slice(-PAGE_SIZE);

        postsToRender.forEach(post => {
            const card = document.createElement('article');
            card.className = 'post-card';
            card.onclick = () => viewPost(post.id);

            const categoryClass = `category-${post.category}`;
            const categoryLabel = {
                'offer': 'Offer',
                'opportunity': 'Opportunity',
                'event': 'Event',
                'networking': 'Networking'
            }[post.category] || post.category;

            const excerpt = post.content.length > 150 
                ? post.content.substring(0, 150) + '...' 
                : post.content;

            const date = new Date(post.createdAt);
            const formattedDate = date.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const imageHtml = post.imageUrl ? `
                <div class="post-card-image">
                    <img src="${post.imageUrl}" alt="${escapeHtml(post.title)}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px 4px 0 0;">
                </div>
            ` : '';

            const avatarHtml = post.authorAvatar ? `
                <img src="${post.authorAvatar}" alt="${escapeHtml(post.authorName)}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
            ` : `
                <div style="width: 36px; height: 36px; border-radius: 50%; background: #B02376; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.875rem;">${getInitials(post.authorName)}</div>
            `;

            card.innerHTML = `
                ${imageHtml}
                <div class="post-card-content">
                    <div class="post-category-badge ${categoryClass}">${categoryLabel}</div>
                    <h3 class="post-title">${escapeHtml(post.title)}</h3>
                    <p class="post-excerpt">${escapeHtml(excerpt)}</p>
                    <div class="post-meta">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            ${avatarHtml}
                            <span class="post-author">${escapeHtml(post.authorName)}</span>
                        </div>
                        <span class="post-date">${formattedDate}</span>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        // Update load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (hasMore && allPosts.length > 0) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Update info text
    function updateInfo(metadata) {
        const info = document.getElementById('postsInfo');
        let text = `Showing ${allPosts.length}`;
        
        if (metadata.total && metadata.total > allPosts.length) {
            text += ` of ${metadata.total}`;
        }
        
        text += ' posts';
        
        if (currentCategory || currentSearch) {
            text += ' (filtered)';
        }

        info.textContent = text;
    }

    // View single post (navigate to post page)
    function viewPost(postId) {
        window.location.href = `/members-community/post/?id=${postId}`;
    }

    // Show create post modal
    function showCreateModal() {
        document.getElementById('postModal').style.display = 'flex';
        document.getElementById('postForm').reset();
        document.getElementById('postError').style.display = 'none';
        uploadedImageUrl = null;
        document.getElementById('postImagePreview').style.display = 'none';
        document.getElementById('postImageStatus').style.display = 'none';
    }

    // Hide modal
    function hideModal() {
        document.getElementById('postModal').style.display = 'none';
        uploadedImageUrl = null;
    }

    // Handle image upload
    async function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) {
            uploadedImageUrl = null;
            document.getElementById('postImagePreview').style.display = 'none';
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showImageStatus('❌ Image too large. Max 5MB.', 'error');
            uploadedImageUrl = null;
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showImageStatus('❌ Please select an image file.', 'error');
            uploadedImageUrl = null;
            return;
        }

        showImageStatus('Uploading image...', 'pending');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('email', memberEmail);

            const response = await fetch(UPLOAD_IMAGE_API, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            if (result.imageUrl) {
                uploadedImageUrl = result.imageUrl;
                // Show preview
                const previewImg = document.getElementById('postImagePreviewImg');
                previewImg.src = uploadedImageUrl;
                document.getElementById('postImagePreview').style.display = 'block';
                showImageStatus('✅ Image uploaded successfully', 'success');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            showImageStatus(`❌ ${error.message}`, 'error');
            uploadedImageUrl = null;
        }
    }

    // Show image upload status
    function showImageStatus(message, type) {
        const statusDiv = document.getElementById('postImageStatus');
        statusDiv.textContent = message;
        if (type === 'success') {
            statusDiv.style.display = 'none';
            return;
        }
        statusDiv.style.display = 'block';
        statusDiv.style.backgroundColor = type === 'error' ? '#fee2e2' : '#fef3c7';
        statusDiv.style.color = type === 'error' ? '#991b1b' : '#92400e';
        statusDiv.style.borderRadius = '4px';
    }

    // Submit post
    async function submitPost(e) {
        e.preventDefault();

        const title = document.getElementById('postTitle').value.trim();
        const category = document.getElementById('postCategory').value;
        const content = document.getElementById('postContent').value.trim();
        const featured = document.getElementById('postFeatured').checked;

        // Validate
        if (!title || !category || !content) {
            showError('Please fill in all required fields');
            return;
        }

        if (title.length < 3 || title.length > 200) {
            showError('Title must be between 3 and 200 characters');
            return;
        }

        if (content.length < 10) {
            showError('Content must be at least 10 characters');
            return;
        }

        // Show loading
        document.getElementById('submitText').style.display = 'none';
        document.getElementById('submitSpinner').style.display = 'inline';
        document.getElementById('submitPost').disabled = true;

        try {
            const postData = {
                email: memberEmail,
                title: title,
                category: category,
                content: content,
                status: 'published',
                featured: featured
            };

            // Add image URL if one was uploaded
            if (uploadedImageUrl) {
                postData.imageUrl = uploadedImageUrl;
            }

            const response = await fetch(CREATE_POST_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create post');
            }

            // Success!
            hideModal();
            
            // Reload posts to show new one
            await loadPosts(true);

            // Show success message (optional)
            alert('Post published successfully!');

        } catch (error) {
            console.error('Error creating post:', error);
            showError(error.message || 'Failed to create post. Please try again.');
        } finally {
            document.getElementById('submitText').style.display = 'inline';
            document.getElementById('submitSpinner').style.display = 'none';
            document.getElementById('submitPost').disabled = false;
        }
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.getElementById('postError');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // Get initials from name
    function getInitials(name) {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', () => {
        // Check auth and load posts
        if (checkAuth()) {
            loadPosts(true);
        }

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                currentCategory = e.target.value;
                loadPosts(true);
            });
        }

        // Search
        const searchInput = document.getElementById('postSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                currentSearch = e.target.value.trim();
                loadPosts(true);
            }, 500));
        }

        // Create post button
        const createBtn = document.getElementById('createPostBtn');
        if (createBtn) {
            createBtn.addEventListener('click', showCreateModal);
        }

        // Close modal
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideModal);
        }

        const cancelBtn = document.getElementById('cancelPost');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideModal);
        }

        // Close modal on outside click
        const modal = document.getElementById('postModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    hideModal();
                }
            });
        }

        // Image upload
        const imageInput = document.getElementById('postImage');
        if (imageInput) {
            imageInput.addEventListener('change', handleImageUpload);
        }

        // Submit form
        const form = document.getElementById('postForm');
        if (form) {
            form.addEventListener('submit', submitPost);
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                loadPosts(false);
            });
        }
    });
})();
