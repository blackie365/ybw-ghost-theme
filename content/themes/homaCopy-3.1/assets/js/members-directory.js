(function () {
    const API_URL = 'https://getmembersv2-qljbqfyowq-uc.a.run.app';
    const LOCATIONS_URL = 'https://getlocations-qljbqfyowq-uc.a.run.app/locations';
    const PAGE_SIZE = 12;

    // Check if slug query parameter exists
    function getSlugFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

    // Render profile from slug
    function renderProfile(member) {
        const container = document.getElementById('memberProfileContainer');
        if (!member) {
            container.innerHTML = `
                <div class="text-center py-20">
                    <h2 class="text-2xl font-bold mb-4">Member Not Found</h2>
                    <p class="text-gray-500 mb-8">The member profile you are looking for does not exist.</p>
                    <a href="/members-directory/" class="profile-btn profile-btn-primary">Back to Directory</a>
                </div>
            `;
            return;
        }

        const firstName = member.firstName || member['First Name'] || '';
        const lastName = member.lastName || member['Last Name'] || '';
        const fullName = (firstName + ' ' + lastName).trim();
        const headline = member.headline || member['Headline'] || '';
        const location = member.location || member['Location'] || '';
        const companyName = member.companyName || member['Company Name'] || '';
        const jobTitle = member.jobTitle || member['Job Title'] || '';
        const bio = member.bio || member['Bio'] || '';
        const extendedBio = member.extendedBio || '';
        const avatarUrl = member.avatarUrl || member['Avatar URL'] || '';
        const linkedinUrl = member.linkedinUrl || member['LinkedIn URL'] || '';
        const instagramUrl = member.instagramUrl || member['Instagram URL'] || '';
        const facebookUrl = member.facebookUrl || member['Facebook URL'] || '';
        const twitterUrl = member.twitterUrl || member['Twitter URL'] || '';
        const websiteUrl = member.website || member['Website'] || '';
        const category = member.category || '';
        const joinDate = member.joinDate || member['Join Date'] || '';
        const logoUrl = member.logoUrl || '';

        // Format join date
        let formattedJoinDate = '';
        if (joinDate) {
            try {
                const date = new Date(joinDate);
                formattedJoinDate = date.toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                });
            } catch (e) {
                formattedJoinDate = '';
            }
        }

        const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
        const fallbackAvatar =
            'https://ui-avatars.com/api/?name=' +
            encodeURIComponent(initials) +
            '&background=B02376&color=fff&size=600';

        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${avatarUrl || fallbackAvatar}" alt="${fullName}" onerror="this.src='${fallbackAvatar}'">
                </div>
                ${logoUrl ? `
                <div style="margin-bottom: 16px;">
                    <img src="${logoUrl}" alt="${companyName} logo" style="max-width: 200px; max-height: 80px; object-fit: contain;" onerror="this.style.display='none'">
                </div>
                ` : ''}
                <h1 class="profile-name">${fullName}</h1>
                ${jobTitle && companyName ? `<div class="profile-headline">${jobTitle} at ${companyName}</div>` : headline ? `<div class="profile-headline">${headline}</div>` : ''}
                 <div class="profile-meta">
                    ${
                        companyName
                            ? `
                        <div class="profile-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="8" y1="10" x2="16" y2="10"></line><line x1="8" y1="14" x2="16" y2="14"></line></svg>
                            ${companyName}
                        </div>
                    `
                            : ''
                    }
                    ${
                        location
                            ? `
                        <div class="profile-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            ${location}
                        </div>
                    `
                            : ''
                    }
                    ${
                        category
                            ? `
                        <div class="profile-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                            ${category}
                        </div>
                    `
                            : ''
                    }
                    ${
                        formattedJoinDate
                            ? `
                        <div class="profile-meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            Member since ${formattedJoinDate}
                        </div>
                    `
                            : ''
                    }
                </div>

                <div class="profile-actions">
                    ${
                        websiteUrl
                            ? `
                        <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="profile-btn profile-btn-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            Visit Website
                        </a>
                    `
                            : ''
                    }
                    ${
                        linkedinUrl
                            ? `
                        <a href="${linkedinUrl}" target="_blank" rel="noopener noreferrer" class="profile-btn profile-btn-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                            LinkedIn
                        </a>
                    `
                            : ''
                    }
                </div>
            </div>

            ${
                bio
                    ? `
                <div class="profile-section">
                    <h2 class="profile-section-title">About</h2>
                    <div class="profile-bio">
                        ${bio.replace(/\n/g, '<br>')}
                        ${extendedBio ? `<br><br>${extendedBio.replace(/\n/g, '<br>')}` : ''}
                    </div>
                </div>
            `
                    : ''
            }

            <div class="profile-section" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                <a href="/member-portal/" class="profile-btn profile-btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    Edit Profile
                </a>
                <a href="/members-directory/" class="profile-btn profile-btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Member Directory
                </a>
            </div>
        `;
    }

    // Load and display profile if slug exists
    function loadProfileIfSlugExists() {
        const slug = getSlugFromURL();
        if (!slug) {
            return false; // No slug, load directory
        }

        // Hide directory, show profile
        const directorySection = document.getElementById('membersDirectorySection');
        const profileSection = document.getElementById('memberProfileSection');
        const postHeader = document.querySelector('.post-header');
        const divider = document.querySelector('hr');
        const firstSection = document.querySelector('.section:first-of-type');

        if (directorySection) directorySection.style.display = 'none';
        if (profileSection) profileSection.style.display = 'block';
        if (postHeader) postHeader.style.display = 'none';
        if (divider) divider.style.display = 'none';
        if (firstSection) firstSection.style.display = 'none';

        // Fetch member profile
        const apiUrl = API_URL + '?slug=' + encodeURIComponent(slug);
        console.log('Fetching profile from:', apiUrl);

        fetch(apiUrl)
            .then((response) => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then((data) => {
                if (!data.members || data.members.length === 0) {
                    console.error('No members found in response');
                    renderProfile(null);
                    return;
                }
                // Find the member matching the slug
                const member = data.members.find((m) => m.memberSlug === slug || m['memberSlug'] === slug);
                if (!member) {
                    console.error('No member found with slug:', slug);
                    renderProfile(null);
                    return;
                }
                renderProfile(member);
            })
            .catch((error) => {
                console.error('Error loading member:', error);
                renderProfile(null);
            });

        return true; // Slug found, showing profile
    }

    let currentPage = 0;
    let currentSearch = '';
    let currentLocation = '';
    let currentKeyword = '';
    let currentFeatured = false;
    let currentSort = 'newest';
    let isLoading = false;
    let hasMore = true;
    let allLoadedMembers = [];

    // DOM elements
    const searchInput = document.getElementById('memberSearch');
    const locationFilter = document.getElementById('locationFilter');
    const keywordSearch = document.getElementById('keywordSearch');
    const featuredFilter = document.getElementById('featuredFilter');
    const sortFilter = document.getElementById('sortFilter');
    const membersGrid = document.getElementById('membersDirectoryList');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadingMore = document.getElementById('loadingMore');
    const resultsInfo = document.getElementById('resultsInfo');

    // Debounce function
    function debounce(func, wait) {
        let timeout;
        return function executedFunction() {
            const args = arguments;
            const later = function () {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Load locations on startup
    function loadLocations() {
        fetch(LOCATIONS_URL)
            .then(function (response) {
                if (response.ok) return response.json();
                throw new Error('Failed to load locations');
            })
            .then(function (data) {
                const locations = data.locations || [];
                locations.forEach(function (location) {
                    const option = document.createElement('option');
                    option.value = location;
                    option.textContent = location;
                    if (locationFilter) {
                        locationFilter.appendChild(option);
                    }
                });
            })
            .catch(function (error) {
                console.error('Error loading locations:', error);
            });
    }

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener(
            'input',
            debounce(function (e) {
                currentSearch = e.target.value.trim();
                resetAndLoad();
            }, 500)
        );
    }

    if (locationFilter) {
        locationFilter.addEventListener('change', function (e) {
            currentLocation = e.target.value;
            resetAndLoad();
        });
    }

    if (keywordSearch) {
        keywordSearch.addEventListener(
            'input',
            debounce(function (e) {
                currentKeyword = e.target.value.trim();
                resetAndLoad();
            }, 500)
        );
    }

    if (featuredFilter) {
        featuredFilter.addEventListener('change', function (e) {
            currentFeatured = e.target.checked;
            resetAndLoad();
        });
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', function (e) {
            currentSort = e.target.value;
            resetAndLoad();
        });
    }

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', function () {
            currentPage++;
            loadMembers(false);
        });
    }

    // Reset and load from beginning
    function resetAndLoad() {
        currentPage = 0;
        allLoadedMembers = [];
        hasMore = true;
        loadMembers(true);
    }

    // Main load function
    function loadMembers(isReset) {
        if (isLoading) return;

        isReset = isReset || false;
        isLoading = true;

        if (isReset) {
            membersGrid.innerHTML = '<div class="text-center py-8 col-span-full">Loading...</div>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        } else {
            if (loadingMore) loadingMore.style.display = 'block';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        }

        // Build API URL
        const offset = currentPage * PAGE_SIZE;
        let apiUrl = API_URL + '?limit=' + PAGE_SIZE + '&offset=' + offset;
        
        // Always require avatars (filter out members without Firebase Storage images)
        apiUrl += '&requireAvatar=true';

        // Map sort values to API parameters
        if (currentSort === 'alphabetical') {
            apiUrl += '&sortBy=firstName&sortOrder=asc';
        } else if (currentSort === 'newest') {
            apiUrl += '&sortBy=joinDate&sortOrder=desc';
        } else if (currentSort === 'featured') {
            apiUrl += '&sortBy=featuredPriority&sortOrder=desc';
        }

        if (currentSearch) {
            apiUrl += '&search=' + encodeURIComponent(currentSearch);
        }
        if (currentLocation) {
            apiUrl += '&location=' + encodeURIComponent(currentLocation);
        }
        if (currentKeyword) {
            apiUrl += '&keyword=' + encodeURIComponent(currentKeyword);
        }
        if (currentFeatured) {
            apiUrl += '&featured=true';
        }

        // Log API URL for debugging
        console.log('Fetching members from:', apiUrl);

        // Fetch data
        fetch(apiUrl)
            .then(function (response) {
                console.log('Response status:', response.status);
                if (!response.ok) throw new Error('HTTP error! status: ' + response.status);
                return response.json();
            })
            .then(function (result) {
                console.log('Received data:', result);
                const members = result.members || [];
                const metadata = result.metadata || {};

                hasMore = metadata.hasMore || false;

                if (isReset) {
                    allLoadedMembers = members;
                    renderMembers(members, true);
                } else {
                    allLoadedMembers = allLoadedMembers.concat(members);
                    renderMembers(members, false);
                }

                updateResultsInfo(metadata);
                updateLoadMoreButton();
            })
            .catch(function (error) {
                console.error('Error loading members:', error);
                console.error('Failed URL was:', apiUrl);
                if (isReset) {
                    membersGrid.innerHTML =
                        '<div class="text-center py-8 col-span-full text-red-500">Error loading members. Please try again. Check console for details.</div>';
                }
            })
            .finally(function () {
                isLoading = false;
                if (loadingMore) loadingMore.style.display = 'none';
            });
    }

    // Render members
    function renderMembers(members, isReset) {
        if (isReset) {
            membersGrid.innerHTML = '';
        }

        if (members.length === 0 && isReset) {
            membersGrid.innerHTML =
                '<div class="text-center py-8 col-span-full text-gray-500">No members found matching your criteria.</div>';
            return;
        }

        members.forEach(function (member) {
            // Use new API field names (camelCase)
            const firstName = member.firstName || member['First Name'] || '';
            const lastName = member.lastName || member['Last Name'] || '';
            const fullName = (firstName + ' ' + lastName).trim() || 'Member';
            const headline = member.headline || member['Headline'] || '';
            const location = member.location || member['Location'] || 'Yorkshire';
            const bio = member.bio || member['Bio'] || '';
            const avatarUrl = member.avatarUrl || member['Avatar URL'] || '';
            const linkedinUrl = member.linkedinUrl || member['LinkedIn URL'] || '';
            const websiteUrl = member.website || member['Website'] || '';
            const category = member.category || 'Other';
            const featured = member.featured || false;
            const isPremium = member.isPremium || false;
            const memberSlug = member.memberSlug || '';
            const profileLink = memberSlug ? '/members-directory/?slug=' + encodeURIComponent(memberSlug) : '#';

            const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
            const fallbackAvatar =
                'https://ui-avatars.com/api/?name=' +
                encodeURIComponent(initials) +
                '&background=B02376&color=fff&size=600';

            const memberCard = document.createElement('article');
            memberCard.className = 'member-card';
            memberCard.style.cssText = 'cursor: pointer; display: flex; flex-direction: column;';
            memberCard.addEventListener('click', function () {
                if (profileLink && profileLink !== '#') {
                    window.location.href = profileLink;
                }
            });

            let cardHTML = '<figure class="member-image relative">';
            if (featured) cardHTML += '<div class="member-badge">Featured</div>';
            if (isPremium) cardHTML += '<div class="premium-badge" title="Premium Member">★</div>';
            cardHTML += '<a href="' + profileLink + '" class="block w-full h-full">';
            cardHTML += `<img src="${avatarUrl || fallbackAvatar}" alt="${fullName}" loading="lazy" onerror="this.src='${fallbackAvatar}'">`;
            cardHTML += '</a>';
            cardHTML += '</figure>';
            cardHTML += '<div class="post-card-content">';
            cardHTML += '<div class="member-tag">' + category + '</div>';
            cardHTML +=
                '<h3 class="member-name mt-0"><a href="' +
                profileLink +
                '" style="text-decoration: none; color: inherit;">' +
                fullName +
                '</a></h3>';
            if (headline) cardHTML += '<div class="member-headline">' + headline + '</div>';
            cardHTML += '<div class="member-location">' + location + '</div>';
            if (bio) {
                cardHTML += '<div class="member-bio truncated">' + bio + '</div>';
            }
            cardHTML += '<div class="member-links">';
            cardHTML += '<a href="' + profileLink + '" class="read-more-btn" style="margin-right: auto;">View Profile</a>';
            cardHTML += '</div></div>';

            memberCard.innerHTML = cardHTML;
            membersGrid.appendChild(memberCard);
        });
    }

    // Update results info
    function updateResultsInfo(metadata) {
        if (!resultsInfo) return;

        const total = metadata.total || 0;
        const showing = allLoadedMembers.length;

        let text = 'Showing ' + showing + ' of ' + total + ' members';
        if (currentSearch || currentLocation || currentKeyword || currentFeatured) {
            text += ' (filtered)';
        }

        resultsInfo.textContent = text;
    }

    // Update load more button
    function updateLoadMoreButton() {
        if (!loadMoreBtn) return;

        if (hasMore && allLoadedMembers.length > 0) {
            loadMoreBtn.style.display = 'inline-block';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    // Initial load - check if showing profile or directory
    function init() {
        const isProfile = loadProfileIfSlugExists();
        if (!isProfile) {
            loadLocations();
            loadMembers(true);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
