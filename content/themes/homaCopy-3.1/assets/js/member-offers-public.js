(function() {
    const API_BASE = 'https://us-central1-newmembersdirectory130325.cloudfunctions.net';
    const PUBLIC_POSTS_API = `${API_BASE}/getMemberPostsPublic`;
    const PAGE_SIZE = 12;

    let currentPage = 0;
    let currentCategory = '';
    let currentSearch = '';
    let hasMore = true;
    let allPosts = [];

    // Load posts
    async function loadPosts(isReset = false) {
        if (isReset) {
            currentPage = 0;
            allPosts = [];
        }

        const offset = currentPage * PAGE_SIZE;
        let url = `${PUBLIC_POSTS_API}?limit=${PAGE_SIZE}&offset=${offset}`;

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
                throw new Error(data.message || 'Failed to load offers');
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
                '<div class="text-center py-8 col-span-full text-red-500">Error loading offers. Please try again.</div>';
        }
    }

    // Render posts
    function renderPosts(isReset) {
        const grid = document.getElementById('postsGrid');
        
        if (isReset) {
            grid.innerHTML = '';
        }

        if (allPosts.length === 0 && isReset) {
            grid.innerHTML = `
                <div class="text-center py-12 col-span-full">
                    <p class="text-xl text-gray-600 mb-4">No public offers available yet.</p>
                    <p class="text-gray-500">Members can make their posts public when creating or editing them.</p>
                </div>
            `;
            document.getElementById('loadMoreBtn').style.display = 'none';
            return;
        }

        const postsToRender = isReset ? allPosts : allPosts.slice(-PAGE_SIZE);

        postsToRender.forEach(post => {
            const card = document.createElement('article');
            card.className = 'post-card';
            card.onclick = () => viewPost(post);

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

            card.innerHTML = `
                <div class="post-category-badge ${categoryClass}">${categoryLabel}</div>
                <h3 class="post-title">${escapeHtml(post.title)}</h3>
                <p class="post-excerpt">${escapeHtml(excerpt)}</p>
                <div class="post-meta">
                    <span class="post-author">${escapeHtml(post.authorName)}</span>
                    <span class="post-date">${formattedDate}</span>
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
        
        text += ' public offers';
        
        if (currentCategory || currentSearch) {
            text += ' (filtered)';
        }

        info.textContent = text;
    }

    // View post (show modal or navigate)
    function viewPost(post) {
        // Create a modal to show full post content
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        `;

        const categoryClass = `category-${post.category}`;
        const categoryLabel = {
            'offer': 'Offer',
            'opportunity': 'Opportunity',
            'event': 'Event',
            'networking': 'Networking'
        }[post.category] || post.category;

        const date = new Date(post.createdAt);
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        modal.innerHTML = `
            <div style="background: white; border-radius: 8px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 40px;">
                <div style="margin-bottom: 24px;">
                    <div class="post-category-badge ${categoryClass}" style="margin-bottom: 16px;">${categoryLabel}</div>
                    <h2 style="font-size: 2rem; font-weight: bold; margin: 0 0 16px 0; color: #15171A;">${escapeHtml(post.title)}</h2>
                    <div style="display: flex; gap: 16px; font-size: 0.875rem; color: #6b7280; margin-bottom: 24px;">
                        <span style="font-weight: 500; color: #374151;">${escapeHtml(post.authorName)}</span>
                        <span>${formattedDate}</span>
                    </div>
                </div>
                <div style="line-height: 1.8; color: #374151; white-space: pre-wrap; margin-bottom: 32px;">
                    ${escapeHtml(post.content)}
                </div>
                <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center;">
                    <p style="margin-bottom: 16px; color: #6b7280;">
                        Want to connect with ${escapeHtml(post.authorName.split(' ')[0])} and other YBW members?
                    </p>
                    <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <a href="/member-portal/" class="profile-btn profile-btn-primary" style="display: inline-flex;">
                            Login to Comment
                        </a>
                        <button onclick="this.closest('div[style*=\\\"position: fixed\\\"]').remove()" class="profile-btn profile-btn-secondary" style="display: inline-flex; background: white; border: 1px solid #ddd;">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };

        document.body.appendChild(modal);
    }

    // Escape HTML
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
        // Initial load
        loadPosts(true);

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
