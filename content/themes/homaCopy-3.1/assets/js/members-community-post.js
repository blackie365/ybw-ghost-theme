(function() {
    const API_BASE = 'https://us-central1-newmembersdirectory130325.cloudfunctions.net';
    const POSTS_API = `${API_BASE}/getMemberPosts`;
    const COMMENTS_API = `${API_BASE}/getPostComments`;
    const CREATE_COMMENT_API = `${API_BASE}/createComment`;
    const UPDATE_POST_API = `${API_BASE}/updateMemberPost`;
    const DELETE_POST_API = `${API_BASE}/deleteMemberPost`;
    
    let currentPost = null;
    let memberEmail = null;
    let currentMember = null;
    let commentsPage = 0;
    let hasMoreComments = false;
    const COMMENTS_PER_PAGE = 20;

    // Check authentication
    function checkAuth() {
        const memberData = localStorage.getItem('ybw_member');
        
        if (!memberData) {
            document.getElementById('authCheck').style.display = 'block';
            document.getElementById('postContent').style.display = 'none';
            document.getElementById('loadingState').style.display = 'none';
            return false;
        }

        try {
            const member = JSON.parse(memberData);
            memberEmail = member.email;
            currentMember = member;
            return true;
        } catch (e) {
            document.getElementById('authCheck').style.display = 'block';
            document.getElementById('postContent').style.display = 'none';
            document.getElementById('loadingState').style.display = 'none';
            return false;
        }
    }

    // Get post ID from URL
    function getPostId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // Load single post
    async function loadPost() {
        const postId = getPostId();
        
        if (!postId) {
            showError();
            return;
        }

        try {
            const response = await fetch(`${POSTS_API}?postId=${encodeURIComponent(postId)}`);
            const data = await response.json();

            if (!response.ok || !data.post) {
                throw new Error('Post not found');
            }

            currentPost = data.post;
            renderPost();
            loadComments();
            loadRelatedPosts();
            setupCommentForm();
            setupPostActions();
        } catch (error) {
            console.error('Error loading post:', error);
            showError();
        }
    }

    // Render post
    function renderPost() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('postContent').style.display = 'block';
        document.getElementById('errorState').style.display = 'none';

        // Category badge
        const categoryClass = `category-${currentPost.category}`;
        const categoryLabel = {
            'offer': 'Offer',
            'opportunity': 'Opportunity',
            'event': 'Event',
            'networking': 'Networking'
        }[currentPost.category] || currentPost.category;

        const categoryBadge = document.getElementById('categoryBadge');
        categoryBadge.className = `post-category-badge ${categoryClass}`;
        categoryBadge.textContent = categoryLabel;

        // Title
        document.getElementById('postTitle').textContent = currentPost.title;

        // Author
        document.getElementById('postAuthor').textContent = currentPost.authorName;

        // Date
        const date = new Date(currentPost.createdAt);
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        document.getElementById('postDate').textContent = formattedDate;

        // Views
        document.getElementById('postViews').textContent = `${currentPost.viewCount || 0} views`;

        // Content (preserve line breaks)
        document.getElementById('postBody').textContent = currentPost.content;

        // Display image if it exists
        if (currentPost.imageUrl) {
            const imageContainer = document.getElementById('postImageContainer');
            const postImage = document.getElementById('postImage');
            postImage.src = currentPost.imageUrl;
            postImage.alt = currentPost.title;
            imageContainer.style.display = 'block';
        }

        // Author info
        const authorAvatar = document.getElementById('authorAvatar');
        const initials = getInitials(currentPost.authorName);
        authorAvatar.innerHTML = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;">${initials}</div>`;
        
        document.getElementById('authorName').textContent = currentPost.authorName;
        
        // Link to author profile (if we have their slug)
        const profileLink = document.getElementById('authorProfileLink');
        if (currentPost.authorSlug) {
            profileLink.href = `/members-directory/?slug=${currentPost.authorSlug}`;
        } else {
            profileLink.style.display = 'none';
        }

        // Show edit/delete buttons if current user is the author
        if (currentMember && currentPost.authorEmail === currentMember.email) {
            document.getElementById('postActions').style.display = 'flex';
        }
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

    // Load related posts (same category)
    async function loadRelatedPosts() {
        if (!currentPost) return;

        try {
            const response = await fetch(`${POSTS_API}?category=${encodeURIComponent(currentPost.category)}&limit=4`);
            const data = await response.json();

            if (!response.ok) return;

            // Filter out current post
            const related = data.posts.filter(p => p.id !== currentPost.id).slice(0, 3);

            if (related.length > 0) {
                renderRelatedPosts(related);
            }
        } catch (error) {
            console.error('Error loading related posts:', error);
        }
    }

    // Render related posts
    function renderRelatedPosts(posts) {
        const container = document.getElementById('relatedPostsGrid');
        container.innerHTML = '';

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'related-post-card';
            card.onclick = () => {
                window.location.href = `/members-community/post/?id=${post.id}`;
            };

            const excerpt = post.content.length > 100 
                ? post.content.substring(0, 100) + '...' 
                : post.content;

            card.innerHTML = `
                <div class="related-post-title">${escapeHtml(post.title)}</div>
                <div class="related-post-author">by ${escapeHtml(post.authorName)}</div>
            `;

            container.appendChild(card);
        });

        document.getElementById('relatedPosts').style.display = 'block';
    }

    // Show error state
    function showError() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('postContent').style.display = 'none';
        document.getElementById('errorState').style.display = 'block';
    }

    // Escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load comments
    async function loadComments(append = false) {
        if (!currentPost) return;

        try {
            const offset = append ? commentsPage * COMMENTS_PER_PAGE : 0;
            const response = await fetch(
                `${COMMENTS_API}?postId=${currentPost.id}&limit=${COMMENTS_PER_PAGE}&offset=${offset}`
            );
            const data = await response.json();

            if (!response.ok) {
                console.error('Error loading comments:', data.message);
                return;
            }

            hasMoreComments = data.metadata.hasMore;
            
            if (!append) {
                commentsPage = 0;
            }

            renderComments(data.comments, append);
            updateCommentCount(data.metadata.total);
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    // Render comments
    function renderComments(comments, append = false) {
        const container = document.getElementById('commentsList');
        
        if (!append) {
            container.innerHTML = '';
        }

        if (comments.length === 0 && !append) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>';
            document.getElementById('loadMoreComments').style.display = 'none';
            return;
        }

        comments.forEach(comment => {
            const commentEl = document.createElement('div');
            commentEl.className = 'comment';
            
            const initials = getInitials(comment.authorName);
            const date = new Date(comment.createdAt);
            const formattedDate = formatCommentDate(date);

            commentEl.innerHTML = `
                <div class="comment-header">
                    <div class="comment-avatar">${initials}</div>
                    <div>
                        <div class="comment-author">${escapeHtml(comment.authorName)}</div>
                        <div class="comment-date">${formattedDate}</div>
                    </div>
                </div>
                <div class="comment-content">${escapeHtml(comment.content)}</div>
            `;

            container.appendChild(commentEl);
        });

        // Update load more button
        const loadMoreBtn = document.getElementById('loadMoreComments');
        if (hasMoreComments) {
            loadMoreBtn.style.display = 'inline-block';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Format comment date (relative time)
    function formatCommentDate(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Update comment count
    function updateCommentCount(count) {
        document.getElementById('commentCount').textContent = `(${count})`;
    }

    // Setup comment form
    function setupCommentForm() {
        const form = document.getElementById('commentForm');
        const textarea = document.getElementById('commentContent');
        const charCount = document.getElementById('commentCharCount');
        const submitBtn = document.getElementById('submitComment');
        const errorDiv = document.getElementById('commentError');
        const loadMoreBtn = document.getElementById('loadMoreComments');

        // Character counter
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
            errorDiv.style.display = 'none';
        });

        // Submit comment
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const content = textarea.value.trim();
            
            if (content.length < 1) {
                errorDiv.textContent = 'Comment cannot be empty';
                errorDiv.style.display = 'block';
                return;
            }

            // Disable form
            submitBtn.disabled = true;
            document.getElementById('commentSubmitText').style.display = 'none';
            document.getElementById('commentSubmitSpinner').style.display = 'inline';
            errorDiv.style.display = 'none';

            try {
                const response = await fetch(CREATE_COMMENT_API, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        postId: currentPost.id,
                        email: memberEmail,
                        content: content
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to post comment');
                }

                // Success - clear form and reload comments
                textarea.value = '';
                charCount.textContent = '0';
                commentsPage = 0;
                await loadComments(false);

            } catch (error) {
                console.error('Error posting comment:', error);
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                document.getElementById('commentSubmitText').style.display = 'inline';
                document.getElementById('commentSubmitSpinner').style.display = 'none';
            }
        });

        // Load more comments
        loadMoreBtn.addEventListener('click', () => {
            commentsPage++;
            loadComments(true);
        });
    }

    // Setup post edit/delete actions
    function setupPostActions() {
        const editBtn = document.getElementById('editPostBtn');
        const deleteBtn = document.getElementById('deletePostBtn');
        const editModal = document.getElementById('editPostModal');
        const editForm = document.getElementById('editPostForm');
        const closeEditModal = document.getElementById('closeEditModal');
        const cancelEdit = document.getElementById('cancelEdit');

        // Edit post
        editBtn.addEventListener('click', () => {
            // Populate form with current values
            document.getElementById('editPostTitle').value = currentPost.title;
            document.getElementById('editPostCategory').value = currentPost.category;
            document.getElementById('editPostContent').value = currentPost.content;
            document.getElementById('editPostFeatured').checked = currentPost.featured || false;
            
            editModal.style.display = 'flex';
        });

        // Close modal
        closeEditModal.addEventListener('click', () => {
            editModal.style.display = 'none';
        });

        cancelEdit.addEventListener('click', () => {
            editModal.style.display = 'none';
        });

        // Submit edit
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('editPostTitle').value.trim();
            const category = document.getElementById('editPostCategory').value;
            const content = document.getElementById('editPostContent').value.trim();
            const featured = document.getElementById('editPostFeatured').checked;
            const errorDiv = document.getElementById('editError');
            const submitBtn = document.getElementById('submitEdit');

            // Validation
            if (title.length < 3 || title.length > 200) {
                errorDiv.textContent = 'Title must be between 3 and 200 characters';
                errorDiv.style.display = 'block';
                return;
            }

            if (content.length < 10) {
                errorDiv.textContent = 'Content must be at least 10 characters';
                errorDiv.style.display = 'block';
                return;
            }

            // Disable form
            submitBtn.disabled = true;
            document.getElementById('editSubmitText').style.display = 'none';
            document.getElementById('editSubmitSpinner').style.display = 'inline';
            errorDiv.style.display = 'none';

            try {
                const response = await fetch(UPDATE_POST_API, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        postId: currentPost.id,
                        email: memberEmail,
                        title,
                        category,
                        content,
                        featured
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update post');
                }

                // Success - reload page to show updated post
                window.location.reload();

            } catch (error) {
                console.error('Error updating post:', error);
                errorDiv.textContent = error.message;
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                document.getElementById('editSubmitText').style.display = 'inline';
                document.getElementById('editSubmitSpinner').style.display = 'none';
            }
        });

        // Delete post
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
                return;
            }

            try {
                const response = await fetch(DELETE_POST_API, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        postId: currentPost.id,
                        email: memberEmail
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to delete post');
                }

                // Success - redirect to community
                alert('Post deleted successfully');
                window.location.href = '/members-community/';

            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post: ' + error.message);
            }
        });
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        if (checkAuth()) {
            loadPost();
        }
    });
})();
