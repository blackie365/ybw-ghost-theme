(function() {
    const POSTS_API = 'https://getmemberposts-qljbqfyowq-uc.a.run.app/posts';
    const MEMBERS_API = 'https://getmembersv2-qljbqfyowq-uc.a.run.app';
    const CREATE_POST_API = 'https://creatememberpost-qljbqfyowq-uc.a.run.app';
    
    let currentView = 'discussions';
    let currentFilter = 'all';
    let allPosts = [];
    let displayedPosts = [];
    const POSTS_PER_PAGE = 10;
    let currentPage = 0;
    let currentMemberEmail = null;
    
    // Load dashboard data on page load
    document.addEventListener('DOMContentLoaded', function() {
        fetchMemberEmail();
        setupNavigation();
        loadPosts();
        loadNewMembers();
        loadCommunityStats();
        loadMyStats();
        setupFilterButtons();
        setupLoadMore();
        setupPageVisibilityRefresh();
    });
    
    // Refresh posts when page becomes visible (user returns from post detail)
    function setupPageVisibilityRefresh() {
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden && currentView === 'discussions') {
                // Page is visible and user is on discussions view - refresh posts
                loadPosts();
            }
        });
    }
    
    // Fetch current member email from Ghost
    function fetchMemberEmail() {
        fetch('/members/api/member/')
            .then(response => {
                if (!response.ok) {
                    window.location.href = '/#/portal/signin';
                    return;
                }
                return response.json();
            })
            .then(data => {
                if (data && data.email) {
                    currentMemberEmail = data.email;
                    // Show dashboard content after auth is verified
                    const dashboardContent = document.getElementById('dashboardContent');
                    if (dashboardContent) {
                        dashboardContent.style.display = 'block';
                    }
                } else {
                    window.location.href = '/#/portal/signin';
                }
            })
            .catch(error => {
                console.error('Error fetching member email:', error);
                window.location.href = '/#/portal/signin';
            });
    }
    
    // Setup navigation - intercept clicks for in-dashboard views
    function setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(link => {
            const href = link.getAttribute('href');
            
            // Keep external links (profile, directory)
            if (href === '/member-portal/' || href === '/members-directory/') {
                return; // Normal link behavior
            }
            
            // Intercept dashboard views
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                if (href === '/members-community/?new=true') {
                    switchView('create-post');
                } else if (href === '/members-community/') {
                    switchView('discussions');
                } else if (href === '/member-offers/') {
                    switchView('offers');
                }
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Switch between views
    function switchView(view) {
        currentView = view;
        const mainContent = document.querySelector('.dashboard-main');
        
        if (view === 'discussions') {
            renderDiscussionsView();
        } else if (view === 'offers') {
            renderOffersView();
        } else if (view === 'create-post') {
            renderCreatePostView();
        }
    }
    
    // Render discussions view (default)
    function renderDiscussionsView() {
        const mainContent = document.querySelector('.dashboard-main');
        mainContent.innerHTML = `
            <div class="feed-header">
                <h2 class="feed-title">Recent Discussions</h2>
                <div class="feed-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="offer">Offers</button>
                    <button class="filter-btn" data-filter="opportunity">Opportunities</button>
                    <button class="filter-btn" data-filter="event">Events</button>
                    <button class="filter-btn" data-filter="networking">Networking</button>
                </div>
            </div>
            <div id="postsContainer" class="posts-container">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading discussions...</p>
                </div>
            </div>
            <div class="load-more-container">
                <button id="loadMorePosts" class="btn-load-more" style="display: none;">
                    Load More Discussions
                </button>
            </div>
        `;
        
        // Re-setup after DOM update
        setupFilterButtons();
        setupLoadMore();
        filterAndDisplayPosts();
    }
    
    // Render offers view
    function renderOffersView() {
        const mainContent = document.querySelector('.dashboard-main');
        mainContent.innerHTML = `
            <div class="feed-header">
                <h2 class="feed-title">Member Offers</h2>
                <p style="margin: 8px 0 0 0; color: var(--text-color-2, #6b7280); font-size: 0.95rem;">
                    Exclusive deals and offers from our members
                </p>
            </div>
            <div id="offersContainer" class="posts-container">
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <p>Loading offers...</p>
                </div>
            </div>
        `;
        
        loadOffers();
    }
    
    // Render create post view
    function renderCreatePostView() {
        const mainContent = document.querySelector('.dashboard-main');
        mainContent.innerHTML = `
            <div class="feed-header">
                <h2 class="feed-title">Create New Post</h2>
            </div>
            <div class="create-post-form">
                <form id="newPostForm">
                    <div class="form-group">
                        <label for="postTitle" class="form-label">Title</label>
                        <input type="text" id="postTitle" class="form-input" placeholder="Give your post a title..." required maxlength="100">
                    </div>
                    
                    <div class="form-group">
                        <label for="postCategory" class="form-label">Category</label>
                        <select id="postCategory" class="form-input" required>
                            <option value="">Select a category</option>
                            <option value="offer">Offer</option>
                            <option value="opportunity">Opportunity</option>
                            <option value="event">Event</option>
                            <option value="networking">Networking</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="postContent" class="form-label">Content</label>
                        <textarea id="postContent" class="form-input" rows="8" placeholder="Share your thoughts..." required></textarea>
                    </div>
                    
                    <div id="postError" class="form-error" style="display: none;"></div>
                    <div id="postSuccess" class="form-success" style="display: none;"></div>
                    
                    <div style="display: flex; gap: 12px; justify-content: flex-end;">
                        <button type="button" class="btn-secondary" onclick="switchView('discussions')">Cancel</button>
                        <button type="submit" class="btn-primary" id="submitPostBtn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            Publish Post
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        // Setup form submission
        document.getElementById('newPostForm').addEventListener('submit', handlePostSubmit);
    }
    
    // Handle post submission
    function handlePostSubmit(e) {
        e.preventDefault();
        
        const title = document.getElementById('postTitle').value.trim();
        const category = document.getElementById('postCategory').value;
        const content = document.getElementById('postContent').value.trim();
        const errorDiv = document.getElementById('postError');
        const successDiv = document.getElementById('postSuccess');
        const submitBtn = document.getElementById('submitPostBtn');
        
        // Validate
        if (!title || !category || !content) {
            errorDiv.textContent = 'Please fill in all fields';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Check if member email is available
        if (!currentMemberEmail) {
            errorDiv.textContent = 'Unable to identify member. Please refresh the page.';
            errorDiv.style.display = 'block';
            return;
        }
        
        // Disable button
        submitBtn.disabled = true;
        submitBtn.textContent = 'Publishing...';
        errorDiv.style.display = 'none';
        
        // Submit to API
        fetch(CREATE_POST_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: currentMemberEmail,
                title, 
                category, 
                content 
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success === true) {
                successDiv.textContent = 'Post published successfully!';
                successDiv.style.display = 'block';
                
                // Redirect to discussions after 1 second
                setTimeout(() => {
                    switchView('discussions');
                    loadPosts(); // Reload posts
                }, 1000);
            } else {
                throw new Error(data.error || data.message || 'Failed to create post');
            }
        })
        .catch(error => {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Publish Post';
        });
    }
    
    // Load offers
    function loadOffers() {
        const container = document.getElementById('offersContainer');
        
        // For now, show placeholder - you can connect to actual offers API
        container.innerHTML = `
            <div class="offers-grid">
                <div class="offer-card">
                    <div class="offer-content">
                        <h3 class="offer-title">Member Offers Coming Soon</h3>
                        <p style="color: var(--text-color-2, #6b7280); margin: 12px 0;">
                            This section will showcase exclusive offers and discounts from our members.
                        </p>
                        <p style="color: var(--text-color-2, #6b7280); font-size: 0.9rem;">
                            Have an offer to share? Contact us at <a href="mailto:rob@topicuk.co.uk" style="color: #B02376;">rob@topicuk.co.uk</a>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
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
        fetch(POSTS_API + '?_t=' + Date.now())  // Add cache buster
            .then(response => response.json())
            .then(data => {
                if (data.posts && Array.isArray(data.posts)) {
                    allPosts = data.posts;
                    
                    if (currentView === 'discussions') {
                        filterAndDisplayPosts();
                    }
                }
            })
            .catch(error => {
                console.error('Error loading posts:', error);
                const container = document.getElementById('postsContainer');
                if (container) {
                    showError('postsContainer', 'Failed to load discussions');
                }
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
        attachPostClickHandlers();
    }
    
    // Attach click handlers to posts
    function attachPostClickHandlers() {
        const postItems = document.querySelectorAll('.post-item');
        postItems.forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', function(e) {
                // Don't navigate if clicking the link itself
                if (e.target.tagName === 'A') {
                    return;
                }
                const postId = this.querySelector('a').getAttribute('href').split('id=')[1];
                if (postId) {
                    window.location.href = `/members-community-post/?id=${postId}`;
                }
            });
        });
    }
    
    // Append posts (for load more)
    function appendPosts(posts) {
        const container = document.getElementById('postsContainer');
        const postsHTML = posts.map(post => createPostHTML(post)).join('');
        container.insertAdjacentHTML('beforeend', postsHTML);
        attachPostClickHandlers();
    }
    
    // Create post HTML
    function createPostHTML(post) {
        const author = post.authorName || 'Anonymous';
        const avatar = post.authorAvatar || generateAvatarFallback(author);
        const company = post.authorCompany || post.companyName || '';
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
                        ${company ? `<div class="post-author-company">${company}</div>` : ''}
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
            const isPremium = member.isPremium || false;
            
            return `
                <a href="/members-directory/?slug=${slug}" class="member-item">
                    <img src="${avatar}" alt="${fullName}" class="member-avatar" onerror="this.src='${generateAvatarFallback(fullName)}'">
                    <div class="member-info">
                        <div class="member-name">
                            ${fullName}
                            ${isPremium ? ' <span class="premium-star" title="Premium Member">★</span>' : ''}
                        </div>
                        ${headline ? `<div class="member-headline">${headline}</div>` : ''}
                    </div>
                </a>
            `;
        }).join('');
    }
    
    // Load my stats (personal)
    function loadMyStats() {
        if (!currentMemberEmail) {
            // Wait for email to be fetched
            setTimeout(loadMyStats, 500);
            return;
        }
        
        // Get my posts count
        fetch(POSTS_API)
            .then(response => response.json())
            .then(data => {
                if (data.posts && Array.isArray(data.posts)) {
                    const myPosts = data.posts.filter(post => 
                        post.authorEmail === currentMemberEmail
                    );
                    document.getElementById('myPostsCount').textContent = myPosts.length;
                    
                    // Calculate my comments (from posts I've interacted with)
                    // Note: This would need a comments API to be accurate
                    // For now, showing 0 as placeholder
                    document.getElementById('myCommentsCount').textContent = '0';
                }
            })
            .catch(error => {
                console.error('Error loading my stats:', error);
                document.getElementById('myPostsCount').textContent = '0';
                document.getElementById('myCommentsCount').textContent = '0';
            });
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
                if (data.posts && Array.isArray(data.posts)) {
                    document.getElementById('totalPosts').textContent = data.posts.length;
                    
                    // Calculate total comments
                    const totalComments = data.posts.reduce((sum, post) => {
                        return sum + (post.commentCount || post.commentsCount || 0);
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
    
    // Expose switchView globally for button clicks
    window.switchView = switchView;
})();
