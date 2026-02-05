(function () {
    var apiUrl = 'https://getmembersv2-qljbqfyowq-uc.a.run.app/members?limit=4&sortBy=joinDate&sortOrder=desc';

    function loadHomepageMembers() {
        fetch(apiUrl)
            .then(function (response) {
                if (!response.ok) throw new Error('Failed to load members');
                return response.json();
            })
            .then(function (result) {
                var members = result.members || [];
                var container = document.getElementById('homepageMembersWidget');

                if (!container) {
                    return;
                }

                if (members.length === 0) {
                    container.innerHTML =
                        '<div style="text-align: center; padding: 40px; grid-column: 1 / -1; color: #6b7280;">No members found</div>';
                    return;
                }

                container.innerHTML = '';

                members.forEach(function (member) {
                    var firstName = member.firstName || member['First Name'] || '';
                    var lastName = member.lastName || member['Last Name'] || '';
                    var fullName = (firstName + ' ' + lastName).trim() || 'Member';
                    var headline = member.headline || member['Headline'] || '';
                    var avatarUrl = member.avatarUrl || member['Avatar URL'] || '';

                    var initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
                    var fallbackAvatar =
                        'https://ui-avatars.com/api/?name=' +
                        encodeURIComponent(initials) +
                        '&background=B02376&color=fff&size=400';

                    var memberThumb = document.createElement('a');
                    memberThumb.className = 'member-thumb';
                    memberThumb.href = '/members-directory/';

                    memberThumb.innerHTML = `
                        <div class="member-thumb-image">
                            <img src="${avatarUrl || fallbackAvatar}" alt="${fullName}" loading="lazy" onerror="this.src='${fallbackAvatar}'">
                        </div>
                        <div class="member-thumb-name">${fullName}</div>
                        ${headline ? `<div class="member-thumb-headline">${headline}</div>` : ''}
                    `;

                    container.appendChild(memberThumb);
                });
            })
            .catch(function (error) {
                console.error('Error loading homepage members:', error);
                var container = document.getElementById('homepageMembersWidget');
                if (container) {
                    container.innerHTML =
                        '<div style="text-align: center; padding: 40px; grid-column: 1 / -1; color: #6b7280;">Unable to load members</div>';
                }
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHomepageMembers);
    } else {
        loadHomepageMembers();
    }
})();
