(function () {
    const API_URL = 'https://getmembersv2-qljbqfyowq-uc.a.run.app/members/';

    function getSlug() {
        const params = new URLSearchParams(window.location.search);
        return params.get('slug');
    }

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

        // Data mapping
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
        const logoUrl = member.logoUrl || member['Logo URL'] || '';
        const linkedinUrl = member.linkedinUrl || member['LinkedIn URL'] || '';
        const instagramUrl = member.instagramUrl || member['Instagram URL'] || '';
        const facebookUrl = member.facebookUrl || member['Facebook URL'] || '';
        const twitterUrl = member.twitterUrl || member['Twitter URL'] || '';
        const websiteUrl = member.website || member['Website'] || '';
        const category = member.category || '';
        const joinDate = member.joinDate || member['Join Date'] || '';

        // Format join date (just date, no time)
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

        // Render HTML
        container.innerHTML = `
            <div class="profile-header">
                <div class="profile-avatar">
                    <img src="${avatarUrl || fallbackAvatar}" alt="${fullName}" onerror="this.src='${fallbackAvatar}'">
                </div>
                <h1 class="profile-name">${fullName}</h1>
                ${headline ? `<div class="profile-headline">${headline}</div>` : ''}
                ${(jobTitle || companyName) ? `<div class="profile-job-company">${jobTitle}${jobTitle && companyName ? ' at ' : ''}${companyName}</div>` : ''}

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
                    ${
                        instagramUrl
                            ? `
                        <a href="${instagramUrl}" target="_blank" rel="noopener noreferrer" class="profile-btn profile-btn-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                            Instagram
                        </a>
                    `
                            : ''
                    }
                    ${
                        facebookUrl
                            ? `
                        <a href="${facebookUrl}" target="_blank" rel="noopener noreferrer" class="profile-btn profile-btn-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                            Facebook
                        </a>
                    `
                            : ''
                    }
                    ${
                        twitterUrl
                            ? `
                        <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="profile-btn profile-btn-secondary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                            Twitter
                        </a>
                    `
                            : ''
                    }
                </div>
            </div>

            ${
                logoUrl
                    ? `
                <div class="profile-section">
                    <h2 class="profile-section-title">Company</h2>
                    <div class="company-logo-container">
                        <img src="${logoUrl}" alt="${companyName} logo" class="company-logo" />
                    </div>
                </div>
            `
                    : ''
            }

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

            <div class="profile-section">
                <a href="/members-directory/" class="profile-btn profile-btn-secondary" style="width: 100%; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Member Directory
                </a>
            </div>
        `;
    }

    function init() {
        const slug = getSlug();
        if (!slug) {
            console.error('No member slug found');
            renderProfile(null);
            return;
        }

        const apiUrl = API_URL + '?slug=' + encodeURIComponent(slug);
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
                const member = data.members.find((m) => m.memberSlug === slug || m['memberSlug'] === slug);
                if (!member) {
                    console.error('No member found with slug:', slug);
                    renderProfile(null);
                    return;
                }
                renderProfile(member);
                fetch(API_URL + '?slug=' + encodeURIComponent(slug) + '&action=view', { method: 'POST' }).catch(console.error);
            })
            .catch((error) => {
                console.error('Error loading member:', error);
                renderProfile(null);
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
