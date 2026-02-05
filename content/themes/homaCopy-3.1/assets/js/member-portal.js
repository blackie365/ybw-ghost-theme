/**
 * Member Portal
 * Handles authentication, profile editing, and syncing with Firebase
 */

(function () {
  // Prefer Cloud Functions v2 run.app URLs to avoid 404s on cloudfunctions.net proxy
  const ENDPOINTS = {
    getMembers: 'https://getmembersv2-qljbqfyowq-uc.a.run.app',
    getByEmail: 'https://us-central1-newmembersdirectory130325.cloudfunctions.net/getMemberByEmail',
    updateProfile: 'https://updatememberprofile-qljbqfyowq-uc.a.run.app',
    uploadImage: 'https://uploadmemberimage-qljbqfyowq-uc.a.run.app',
    sendPin: 'https://us-central1-newmembersdirectory130325.cloudfunctions.net/sendMemberPin',
    verifyPin: 'https://us-central1-newmembersdirectory130325.cloudfunctions.net/verifyMemberPin',
  };
  const VERIFICATION_LINK_TTL = 15 * 60 * 1000; // 15 minutes

  // DOM Elements
  const authSection = document.getElementById('authSection');
  const authForm = document.getElementById('authForm');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authError = document.getElementById('authError');
  const authSuccess = document.getElementById('authSuccess');
  const verifyEmailSpan = document.getElementById('verifyEmail');

  const editorSection = document.getElementById('editorSection');
  const profileForm = document.getElementById('profileForm');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const formError = document.getElementById('formError');
  const formSuccess = document.getElementById('formSuccess');

  // Form fields
  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const headline = document.getElementById('headline');
  const location = document.getElementById('location');
  const companyName = document.getElementById('companyName');
  const jobTitle = document.getElementById('jobTitle');
  const category = document.getElementById('category');
  const bio = document.getElementById('bio');
  const website = document.getElementById('website');
  const linkedinUrl = document.getElementById('linkedinUrl');
  const instagramUrl = document.getElementById('instagramUrl');
  const facebookUrl = document.getElementById('facebookUrl');
  const twitterUrl = document.getElementById('twitterUrl');
  const profileImage = document.getElementById('profileImage');
  const imageUploadStatus = document.getElementById('imageUploadStatus');
  const companyLogo = document.getElementById('companyLogo');
  const logoUploadStatus = document.getElementById('logoUploadStatus');

  // Preview elements
  const previewAvatar = document.getElementById('previewAvatar');
  const previewName = document.getElementById('previewName');
  const previewHeadline = document.getElementById('previewHeadline');
  const previewLocation = document.getElementById('previewLocation');
  const previewCategory = document.getElementById('previewCategory');
  const previewBio = document.getElementById('previewBio');
  const previewWebsite = document.getElementById('previewWebsite');
  const previewLinkedin = document.getElementById('previewLinkedin');
  const previewInstagram = document.getElementById('previewInstagram');

  // Character counters
  const headlineCount = document.getElementById('headlineCount');
  const bioCount = document.getElementById('bioCount');

  // State
  let currentMember = null;
  let authToken = null;
  let isLoading = false;
  let pendingEmail = null;
  let resendCooldown = null;

  // Initialization
  function init() {
    // Check if email is in URL query (?email=...) or hash (#email=...)
    const emailFromQuery = new URLSearchParams(
        window.location.search,
    ).get('email');
    const emailFromHash = new URLSearchParams(
        window.location.hash.substring(1),
    ).get('email');
    const memberEmail = (emailFromQuery || emailFromHash || '').trim();

    if (memberEmail) {
      // User accessed via query or hash parameter
      loadMemberProfile(memberEmail, null);
      // Clean up URL to remove email parameter
      const url = new URL(window.location);
      url.searchParams.delete('email');
      window.history.replaceState({}, document.title, url.pathname);
    }

    // Event listeners
    authForm.addEventListener('submit', handleAuthSubmit);
    profileForm.addEventListener('submit', handleSaveProfile);
    cancelBtn.addEventListener('click', handleCancel);
    if (profileImage) {
      profileImage.addEventListener('change', handleImageUpload);
    }
    if (companyLogo) {
      companyLogo.addEventListener('change', handleLogoUpload);
    }

    // Character counter listeners
    headline.addEventListener('input', updateCounters);
    bio.addEventListener('input', updateCounters);

    // Preview sync listeners
    [headline, location, companyName, jobTitle, category, bio, website, linkedinUrl, instagramUrl, facebookUrl, twitterUrl].forEach((field) => {
      if (field) {
        field.addEventListener('input', updatePreview);
        field.addEventListener('change', updatePreview);
      }
    });
  }

  /**
   * Validate email format
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle auth form submission - send PIN
   */
  async function handleAuthSubmit(e) {
    e.preventDefault();
    const userEmail = document.getElementById('emailInput').value.trim();

    // Validate email is not empty
    if (!userEmail) {
      showError(authError, '❌ Please enter your email address');
      return;
    }

    // Validate email format
    if (!isValidEmail(userEmail)) {
      showError(authError, '❌ Please enter a valid email address (example: name@example.com)');
      return;
    }

    authError.style.display = 'none';
    authSubmitBtn.disabled = true;
    authSubmitBtn.innerHTML = '<span class="spinner"></span>Sending...';

    try {
      const response = await fetch(ENDPOINTS.sendPin, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: userEmail}),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send PIN');
      }

      pendingEmail = userEmail;
      showPinBox(userEmail);
    } catch (error) {
      console.error('Send PIN error:', error);
      let friendlyMessage = 'Failed to send PIN. Please try again.';
      
      // Provide specific, helpful error messages
      if (error.message.includes('Member not found') || error.message.includes('404')) {
        friendlyMessage = '❌ Email not found in our database. Please contact support at hello@yorkshirebusinesswoman.co.uk';
      } else if (error.message.includes('Rate limit') || error.message.includes('429')) {
        friendlyMessage = '⏱ Too many requests. Please wait a few minutes and try again.';
      } else if (error.message.includes('Invalid email')) {
        friendlyMessage = '📧 Please enter a valid email address (e.g., name@example.com)';
      } else if (error.message.includes('Email service not configured')) {
        friendlyMessage = '⚙️ Email service is temporarily unavailable. Please try again later or contact support.';
      }
      
      showError(authError, friendlyMessage);
      authSubmitBtn.disabled = false;
      authSubmitBtn.innerHTML = 'Continue';
    }
  }

  /**
   * Show PIN entry box - replaces login form
   */
  function showPinBox(userEmail) {
    if (!authSection) return;
    authSection.style.display = 'block';
    authSection.innerHTML = `
      <div id="pinContainer" style="width:100%; max-width:640px; margin:0 auto; padding:20px; text-align:center;">
        <div style="margin-bottom:20px; font-size:16px; color:#333;">
          Enter the 6-digit code we sent to<br/><strong style="color:#B02376;">${userEmail}</strong>
        </div>
        <div style="display:flex; gap:12px; align-items:center; justify-content:center; flex-wrap:wrap;">
          <input id="pinInput" type="text" inputmode="numeric" maxlength="6" placeholder="123456" 
            style="width:160px; padding:12px 16px; border:2px solid #ddd; border-radius:8px; font-size:18px; text-align:center; letter-spacing:4px; font-weight:600;" />
          <button id="pinVerifyBtn" class="btn btn-primary" type="button">Verify</button>
        </div>
        <div style="margin-top:16px;">
          <button id="pinResendBtn" type="button" style="background:none; border:none; color:#B02376; cursor:pointer; font-size:14px; text-decoration:underline; padding:8px; display:inline-block;">Resend Code</button>
        </div>
        <div id="pinMsg" style="display:none; margin-top:12px; text-align:center; padding:12px; border-radius:6px;"></div>
      </div>`;

    const holder = authSection.querySelector('#pinContainer');
    const pinInput = holder.querySelector('#pinInput');
    const pinVerifyBtn = holder.querySelector('#pinVerifyBtn');
    const pinResendBtn = holder.querySelector('#pinResendBtn');
    const pinMsg = holder.querySelector('#pinMsg');

    console.log('PIN box elements:', {pinInput, pinVerifyBtn, pinResendBtn, pinMsg});

    pinInput.focus();

    pinInput.addEventListener('input', () => {
      pinMsg.style.display = 'none';
      pinInput.style.borderColor = '#ddd';
    });

    pinVerifyBtn.addEventListener('click', () => handlePinVerify(userEmail, pinInput, pinMsg, pinVerifyBtn));
    if (pinResendBtn) {
      pinResendBtn.addEventListener('click', () => {
        console.log('Resend button clicked');
        handleResendPin(userEmail, pinMsg, pinResendBtn);
      });
    }

    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handlePinVerify(userEmail, pinInput, pinMsg, pinVerifyBtn);
    });
  }

  /**
   * Handle PIN verification
   */
  async function handlePinVerify(userEmail, pinInput, pinMsg, pinVerifyBtn) {
    const pin = pinInput.value.trim();
    if (!/^\d{6}$/.test(pin)) {
      pinMsg.textContent = '❌ Please enter a 6-digit code';
      pinMsg.style.display = 'block';
      pinInput.style.borderColor = '#ef4444';
      return;
    }

    pinMsg.style.display = 'none';
    pinVerifyBtn.disabled = true;
    pinVerifyBtn.innerHTML = '<span class="spinner"></span>Verifying...';

    try {
      const response = await fetch(ENDPOINTS.verifyPin, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: userEmail, pin}),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Invalid or expired PIN');
      }

      authToken = result.token;
      await loadMemberProfile(userEmail, result.token);
    } catch (error) {
      console.error('PIN verify error:', error);
      pinMsg.textContent = error.message || 'Invalid PIN. Please try again.';
      pinMsg.style.display = 'block';
      pinInput.style.borderColor = '#ef4444';
      pinVerifyBtn.disabled = false;
      pinVerifyBtn.innerHTML = 'Verify';
    }
  }

  /**
   * Handle resend PIN with cooldown
   */
  async function handleResendPin(userEmail, pinMsg, pinResendBtn) {
    if (resendCooldown) {
      pinMsg.textContent = '⏱ Please wait before requesting another code';
      pinMsg.style.display = 'block';
      return;
    }

    pinMsg.style.display = 'none';
    pinResendBtn.disabled = true;
    pinResendBtn.textContent = 'Sending...';

    try {
      const response = await fetch(ENDPOINTS.sendPin, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({email: userEmail}),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to resend PIN');
      }

      pinMsg.textContent = '✅ New code sent! Check your email.';
      pinMsg.style.display = 'block';
      pinMsg.style.color = '#16a34a';

      resendCooldown = setTimeout(() => {
        resendCooldown = null;
        pinResendBtn.disabled = false;
        pinResendBtn.textContent = 'Resend';
      }, 60000);

      setTimeout(() => {
        pinMsg.style.display = 'none';
        pinMsg.style.color = '';
      }, 3000);
    } catch (error) {
      console.error('Resend error:', error);
      pinMsg.textContent = error.message || 'Failed to resend PIN';
      pinMsg.style.display = 'block';
      pinResendBtn.disabled = false;
      pinResendBtn.textContent = 'Resend';
    }
  }

  /**
   * Load member profile from Firebase
   */
  async function loadMemberProfile(userEmail, token) {
    try {
      // Query single member by email (normalized)
      const response = await fetch(`${ENDPOINTS.getByEmail}?email=${encodeURIComponent(userEmail)}`);
      if (response.status === 404) {
        // Member not found - create empty profile shell
        currentMember = {
          email: userEmail,
          firstName: userEmail.split('@')[0],
          lastName: '',
          headline: '',
          location: '',
          companyName: '',
          jobTitle: '',
          category: '',
          bio: '',
          website: '',
          linkedinUrl: '',
          instagramUrl: '',
          avatarUrl: generateFallbackAvatar(userEmail.split('@')[0], ''),
        };
      } else {
        if (!response.ok) throw new Error('Failed to fetch member');
        const data = await response.json();
        currentMember = data.member || null;
      }

      if (!currentMember) {
        // Member not found - might be a new signup
        // Create empty profile
        currentMember = {
          email: userEmail,
          firstName: userEmail.split('@')[0],
          lastName: '',
          headline: '',
          location: '',
          companyName: '',
          jobTitle: '',
          category: '',
          bio: '',
          website: '',
          linkedinUrl: '',
          instagramUrl: '',
          avatarUrl: generateFallbackAvatar(userEmail.split('@')[0], ''),
        };
      }

      authToken = token;
      
      // Save member session to localStorage for community access
      try {
        localStorage.setItem('ybw_member', JSON.stringify({
          email: currentMember.email,
          firstName: currentMember.firstName,
          lastName: currentMember.lastName,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Failed to save member session:', e);
      }
      
      showEditorSection();
      populateForm();
      updatePreview();
    } catch (error) {
      console.error('Error loading profile:', error);
      showError(authError, 'Failed to load profile. Please try again.');
    }
  }

  /**
   * Show editor section and hide auth
   */
  function showEditorSection() {
    authSection.style.display = 'none';
    editorSection.style.display = 'block';
  }

  /**
   * Populate form with current member data
   * Assumes all fields are normalized to camelCase by the API
   */
  function populateForm() {
    if (!currentMember) return;

    console.log('populateForm called with currentMember:', currentMember);
    console.log('firstName element:', firstName, 'currentMember.firstName:', currentMember.firstName);
    console.log('bio element:', bio, 'currentMember.bio:', currentMember.bio);
    console.log('bio.nodeName:', bio ? bio.nodeName : 'null');

    if (firstName) {firstName.value = currentMember.firstName || ''; console.log('Set firstName:', firstName.value);}
    if (lastName) {lastName.value = currentMember.lastName || ''; console.log('Set lastName:', lastName.value);}
    if (email) {email.value = currentMember.email || ''; console.log('Set email:', email.value);}
    if (headline) {headline.value = currentMember.headline || ''; console.log('Set headline:', headline.value);}
    if (location) {location.value = currentMember.location || ''; console.log('Set location:', location.value);}
    if (companyName) {companyName.value = currentMember.companyName || ''; console.log('Set companyName:', companyName.value);}
    if (jobTitle) {jobTitle.value = currentMember.jobTitle || ''; console.log('Set jobTitle:', jobTitle.value);}
    if (category) {category.value = currentMember.category || ''; console.log('Set category:', category.value);}
    if (bio) {bio.value = currentMember.bio || ''; console.log('Set bio.value:', bio.value);}
    if (website) {website.value = currentMember.website || ''; console.log('Set website:', website.value);}
    if (linkedinUrl) {linkedinUrl.value = currentMember.linkedinUrl || ''; console.log('Set linkedinUrl:', linkedinUrl.value);}
    if (instagramUrl) {instagramUrl.value = currentMember.instagramUrl || ''; console.log('Set instagramUrl:', instagramUrl.value);}
    if (facebookUrl) {facebookUrl.value = currentMember.facebookUrl || ''; console.log('Set facebookUrl:', facebookUrl.value);}
    if (twitterUrl) {twitterUrl.value = currentMember.twitterUrl || ''; console.log('Set twitterUrl:', twitterUrl.value);}

    console.log('Form values after population:', {
      firstName: firstName ? firstName.value : 'element missing',
      bio: bio ? bio.value : 'element missing',
      headline: headline ? headline.value : 'element missing',
    });
    
    // Also log the actual HTML of the bio field to verify
    if (bio) {
      console.log('Bio field HTML:', bio.outerHTML);
      console.log('Bio field value attribute:', bio.getAttribute('value'));
    }
    
    // Display avatar image
    if (previewAvatar && currentMember.avatarUrl) {
      previewAvatar.src = currentMember.avatarUrl;
    }

    updateCounters();
  }

  /**
   * Update character counters
   */
  function updateCounters() {
    headlineCount.textContent = headline.value.length;
    bioCount.textContent = (bio.textContent || bio.value || '').length;
  }

  /**
   * Update preview as user types
   */
  function updatePreview() {
    if (!currentMember) return;

    const displayName = `${firstName.value} ${lastName.value}`.trim();
    previewName.textContent = displayName || 'Your Name';

    previewHeadline.textContent = headline.value || '';
    previewLocation.textContent = location.value || '';
    
    if (category.value) {
      previewCategory.textContent = category.value;
      previewCategory.style.display = 'inline-block';
    } else {
      previewCategory.style.display = 'none';
    }

    previewBio.textContent = (bio.textContent || bio.value || '') || '';

    // Update links
    updatePreviewLink(previewWebsite, website.value, 'Website');
    updatePreviewLink(previewLinkedin, linkedinUrl.value, 'LinkedIn');
    updatePreviewLink(previewInstagram, instagramUrl.value, 'Instagram');

    // Update avatar
    previewAvatar.src = currentMember.avatarUrl || generateFallbackAvatar(firstName.value, lastName.value);
  }

  /**
   * Update individual preview link
   */
  function updatePreviewLink(linkElement, url, label) {
    if (url && isValidUrl(url)) {
      linkElement.href = url;
      linkElement.textContent = label;
      linkElement.style.display = 'inline-block';
    } else {
      linkElement.style.display = 'none';
    }
  }

  /**
   * Validate URL
   */
  function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  /**
   * Generate fallback avatar using canvas
   */
  function generateFallbackAvatar(firstName, lastName) {
    const initials = `${(firstName[0] || '')}${(lastName[0] || '')}`.toUpperCase() || '?';
    
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#B02376';
    ctx.fillRect(0, 0, 400, 400);
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 140px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 200, 200);
    
    // Convert to data URL
    return canvas.toDataURL('image/png');
  }

  /**
   * Handle save profile
   */
  async function handleSaveProfile(e) {
    e.preventDefault();

    if (isLoading) return;
    isLoading = true;

    // Clear messages
    formError.style.display = 'none';
    formSuccess.style.display = 'none';
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner"></span>Saving...';

    try {
      const profileData = {
        headline: headline.value.trim(),
        location: location.value.trim(),
        companyName: companyName.value.trim(),
        jobTitle: jobTitle.value.trim(),
        category: category.value.trim(),
        bio: (bio.textContent || bio.value || '').trim(),
        website: website.value.trim(),
        linkedinUrl: linkedinUrl.value.trim(),
        instagramUrl: instagramUrl.value.trim(),
        facebookUrl: facebookUrl.value.trim(),
        twitterUrl: twitterUrl.value.trim(),
        ...(currentMember.avatarUrl ? { avatarUrl: currentMember.avatarUrl } : {}),
        ...(currentMember.logoUrl ? { logoUrl: currentMember.logoUrl } : {}),
      };

      // Call update API
      const requestBody = {
        email: currentMember.email,
        ...profileData,
      };
      
      console.log('Saving profile with data:', requestBody);
      console.log('Update URL:', ENDPOINTS.updateProfile);
      
      const response = await fetch(ENDPOINTS.updateProfile, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const result = await response.json();
      
      // Reload member data from Firebase to get all fields
      if (currentMember && currentMember.email) {
        await loadMemberProfile(currentMember.email, authToken);
      }
      // Success - data updated silently
    } catch (error) {
      console.error('Save error:', error);
      showError(formError, error.message || 'Failed to save profile. Please try again.');
    } finally {
      isLoading = false;
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Save Changes';
    }
  }

  /**
   * Handle cancel
   */
  function handleCancel() {
    if (confirm('Discard changes?')) {
      populateForm();
      formError.style.display = 'none';
      formSuccess.style.display = 'none';
    }
  }

  /**
   * Handle image upload
   */
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showImageStatus('❌ Image too large. Max 5MB.', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showImageStatus('❌ Please select an image file.', 'error');
      return;
    }

    showImageStatus('Uploading...', 'pending');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', currentMember.email);

      const response = await fetch(ENDPOINTS.uploadImage, {
        method: 'POST',
        body: formData,
        // Let the browser set the correct Content-Type with boundary
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      if (result.imageUrl) {
        currentMember.avatarUrl = result.imageUrl;
        if (previewAvatar) {
          previewAvatar.src = result.imageUrl;
        }
        // Update main preview in right column
        const mainPreviewImg = document.querySelector('.preview-avatar img');
        if (mainPreviewImg) {
          mainPreviewImg.src = result.imageUrl;
        }
        showImageStatus('✅ Image uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      showImageStatus(`❌ ${error.message}`, 'error');
    }
  }

  /**
   * Handle logo upload
   */
  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showLogoStatus('❌ Logo too large. Max 2MB.', 'error');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showLogoStatus('❌ Please select an image file.', 'error');
      return;
    }

    showLogoStatus('Uploading...', 'pending');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', currentMember.email);
      formData.append('type', 'logo');

      const response = await fetch(ENDPOINTS.uploadImage, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      if (result.imageUrl) {
        currentMember.logoUrl = result.imageUrl;
        const logoPreview = document.getElementById('logoPreview');
        const previewLogoSmall = document.getElementById('previewLogoSmall');
        if (logoPreview && previewLogoSmall) {
          logoPreview.style.display = 'block';
          previewLogoSmall.src = result.imageUrl;
        }
        showLogoStatus('✅ Logo uploaded successfully', 'success');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      showLogoStatus(`❌ ${error.message}`, 'error');
    }
  }

  /**
   * Show image upload status
   */
  function showImageStatus(message, type) {
    if (!imageUploadStatus) return;
    imageUploadStatus.textContent = message;
    if (type === 'success') {
      imageUploadStatus.style.display = 'none';
      return;
    }
    imageUploadStatus.style.display = 'block';
    imageUploadStatus.style.backgroundColor = type === 'error' ? '#fee2e2' : '#fef3c7';
    imageUploadStatus.style.color = type === 'error' ? '#991b1b' : '#92400e';
    imageUploadStatus.style.borderRadius = '4px';
  }

  /**
   * Show logo upload status
   */
  function showLogoStatus(message, type) {
    if (!logoUploadStatus) return;
    logoUploadStatus.textContent = message;
    if (type === 'success') {
      logoUploadStatus.style.display = 'none';
      return;
    }
    logoUploadStatus.style.display = 'block';
    logoUploadStatus.style.backgroundColor = type === 'error' ? '#fee2e2' : '#fef3c7';
    logoUploadStatus.style.color = type === 'error' ? '#991b1b' : '#92400e';
    logoUploadStatus.style.borderRadius = '4px';
  }

  /**
   * Show error message
   */
  function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
