(function() {
    const POSTS_API = 'https://getmemberposts-qljbqfyowq-uc.a.run.app/posts';
    const MEMBERS_API = 'https://getmembersv2-qljbqfyowq-uc.a.run.app';
    
    let currentFilter = 'all';
    let allPosts = [];
    let displayedPosts = [];
    const POSTS_PER_PAGE = 10;
    let currentPage = 0;
    
    // Load dashboard data on page load
    document.addEventListener('DOMContentLoaded', function() {
        loadPosts();
        loadNewMembers();
        loadCommunityStats();
        setupFilterButtons();
        setupLoadMore();
    });
    
    // Setup filter buttons
    function setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Filter posts
                currentFilter = this.dataset.filter;
                currentPage = 0;
                filterAndDisplayPosts();
            });
        });
    }
    
    // Setup load more button
    function setupLoadMore() {
        const loadMoreBtn = document.getElementById('loadMorePosts');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                currentPage++;
                displayMorePosts();
            });
        }
    }
    
    // Load posts from API
    function loadPosts() {
        fetch(POSTS_API)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    allPosts = data.data;
                    filterAndDisplayPosts();
                }
            })
            .catch(error => {
                console.error('Error loading posts:', error);
                showError('postsContainer', 'Failed to load discussions');
            });
    }
    
    // Filter and display posts
    function filterAndDisplayPosts() {
        let filtered = allPosts;
        
        if (currentFilter !== 'all') {
            filtered = allPosts.filter(post => {
                const category = (post.category || '').toLowerCase();
                return category === currentFilter;
            });
        }
        
        displayedPosts = filtered;
        currentPage = 0;
        renderPosts(displayedPosts.slice(0, POSTS_PER_PAGE));
        updateLoadMoreButton();
    }
    
    // Display more posts (pagination)
    function displayMorePosts() {
        const start = currentPage * POSTS_PER_PAGE;
        const end = start + POSTS_PER_PAGE;
        const newPosts = displayedPosts.slice(start, end);
        
        appendPosts(newPosts);
        updateLoadMoreButton();
    }
    
    // Render posts
    function renderPosts(posts) {
        const container = document.getElementById('postsContainer');
        
        if (!posts || posts.length === 0) {
            container.innerHTML = `
                <div class="loading-state">
                    <p>No discussions found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = posts.map(post => createPostHTML(post)).join('');
    }
    
    // Append posts (for load more)
    function appendPosts(posts) {
        const container = document.getElementById('postsContainer');
        const postsHTML = posts.map(post => createPostHTML(post)).join('');
        container.insertAdjacentHTML('beforeend', postsHTML);
    }
    
    // Create post HTML
    function createPostHTML(post) {
        const author = post.authorName || 'Anonymous';
        const avatar = post.authorAvatar || generateAvatarFallback(author);
        const headline = post.authorHeadline || '';
        const title = post.title || 'Untitled';
        const content = post.content || '';
        const excerpt = content.length > 150 ? content.substring(0, 150) + '...' : content;
        const createdAt = formatDate(post.createdAt);
        const commentsCount = post.commentsCount || 0;
        const category = post.category || '';
        const postId = post.id;
        
        return `
            <div class="post-item">
                <div class="post-header">
                    <img src="${avatar}" alt="${author}" class="post-avatar" onerror="this.src='${generateAvatarFallback(author)}'">
                    <div class="post-author-info">
                        <h4>${author}</h4>
                        <div class="post-meta">
                            ${createdAt}
                            ${category ? `<span class="post-category">${category}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="post-content">
                    <h3><a href="/members-community-post/?id=${postId}">${title}</a></h3>
                    <p class="post-excerpt">${excerpt}</p>
                    <div class="post-footer">
                        <div class="post-stat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            ${commentsCount} ${commentsCount === 1 ? 'comment' : 'comments'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Update load more button visibility
    function updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('loadMorePosts');
        const totalPages = Math.ceil(displayedPosts.length / POSTS_PER_PAGE);
        
        if (loadMoreBtn) {
            if (currentPage + 1 < totalPages) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
    }
    
    // Load new members
    function loadNewMembers() {
        fetch(`${MEMBERS_API}?limit=5&sortBy=joinDate&sortOrder=desc&requireAvatar=true`)
            .then(response => response.json())
            .then(data => {
                if (data.members) {
                    renderNewMembers(data.members);
                }
            })
            .catch(error => {
                console.error('Error loading new members:', error);
                document.getElementById('newMembersContainer').innerHTML = '<p style="text-align: center; color: #999;">Failed to load</p>';
            });
    }
    
    // Render new members
    function renderNewMembers(members) {
        const container = document.getElementById('newMembersContainer');
        
        if (!members || members.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">No new members</p>';
            return;
        }
        
        container.innerHTML = members.map(member => {
            const firstName = member.firstName || member['First Name'] || '';
            const lastName = member.lastName || member['Last Name'] || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Member';
            const avatar = member.avatarUrl || member['Avatar URL'] || generateAvatarFallback(fullName);
            const headline = member.headline || member['Headline'] || '';
            const slug = member.memberSlug || '';
            
            return `
                <a href="/members-directory/?slug=${slug}" class="member-item">
                    <img src="${avatar}" alt="${fullName}" class="member-avatar" onerror="this.src='${generateAvatarFallback(fullName)}'">
                    <div class="member-info">
                        <div class="member-name">${fullName}</div>
                        ${headline ? `<div class="member-headline">${headline}</div>` : ''}
                    </div>
                </a>
            `;
        }).join('');
    }
    
    // Load community stats
    function loadCommunityStats() {
        // Get total members count
        fetch(`${MEMBERS_API}?limit=1`)
            .then(response => response.json())
            .then(data => {
                if (data.metadata && data.metadata.total) {
                    document.getElementById('totalMembers').textContent = data.metadata.total;
                }
            })
            .catch(error => console.error('Error loading member count:', error));
        
        // Get total posts
        fetch(POSTS_API)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    document.getElementById('totalPosts').textContent = data.data.length;
                    
                    // Calculate total comments
                    const totalComments = data.data.reduce((sum, post) => {
                        return sum + (post.commentsCount || 0);
                    }, 0);
                    document.getElementById('totalComments').textContent = totalComments;
                }
            })
            .catch(error => console.error('Error loading posts count:', error));
    }
    
    // Format date
    function formatDate(timestamp) {
        if (!timestamp) return 'Recently';
        
        const date = timestamp._seconds ? 
            new Date(timestamp._seconds * 1000) : 
            new Date(timestamp);
        
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
    
    // Generate avatar fallback
    function generateAvatarFallback(name) {
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=B02376&color=fff&size=100`;
    }
    
    // Show error message
    function showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="loading-state">
                    <p style="color: #e53e3e;">${message}</p>
                </div>
            `;
        }
    }
})();
