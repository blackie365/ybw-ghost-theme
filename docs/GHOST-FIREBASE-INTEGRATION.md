# Ghost → Firebase Member Integration
**Goal**: Automatically sync Ghost members to Firebase with enhanced schema  
**Date**: January 12, 2025

## Current State vs. Desired State

### Current (Fragmented) Flow
```
Ghost Member Signup
    ↓
Zapier (unreliable)
    ↓
Circle.so
    ↓
❌ Firebase (manual/missing)
```

### Desired (Unified) Flow
```
Ghost Member Signup
    ↓
Ghost Webhook
    ↓
Firebase Cloud Function
    ↓
Firestore Database (with enhanced schema)
    ↓
Members Directory (auto-updated)
```

## Benefits

✅ **Single source of truth** - Ghost is your member management system  
✅ **Automatic sync** - No manual work, no Zapier  
✅ **Enhanced schema** - Store additional profile data in Firebase  
✅ **Real-time updates** - Member changes sync immediately  
✅ **Deprecate Circle.so** - Eliminate duplicate systems  
✅ **Native Ghost forms** - Use existing signup/profile pages  

## Architecture Overview

### Components

1. **Ghost Webhooks** (built-in)
   - Triggers on member events (created, updated, deleted)
   - Sends member data to your endpoint

2. **Firebase Cloud Function** (new)
   - Receives Ghost webhook
   - Validates data
   - Writes to Firestore with enhanced schema

3. **Firestore Database** (existing)
   - Stores member profiles
   - Powers members directory

4. **Admin Interface** (future)
   - Edit extended profile fields not in Ghost
   - Manage featured status, categories, services

## Implementation Plan

### Phase 1: Set Up Ghost Webhooks

Ghost supports webhooks for member events:
- `member.added` - New member signup
- `member.edited` - Profile updated
- `member.deleted` - Member removed

**Configuration:**
1. Ghost Admin → Settings → Integrations → Add custom integration
2. Create webhook URLs pointing to your Cloud Function
3. Select events to trigger

### Phase 2: Build Firebase Cloud Function

Create a webhook endpoint that:
1. Receives Ghost member data
2. Maps to enhanced schema
3. Writes to Firestore

**Endpoint**: `https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/ghostWebhook`

### Phase 3: Data Mapping

Map Ghost member fields to Firebase enhanced schema:

| Ghost Field | Firebase Field | Notes |
|-------------|----------------|-------|
| `id` | `uid` | Ghost member ID |
| `email` | `email` | Required |
| `name` | `firstName` + `lastName` | Split name |
| `avatar_image` | `avatarUrl` | Profile photo |
| `created_at` | `joinDate` | Signup date |
| `updated_at` | `lastUpdated` | Auto-updated |
| `status` | `active` | "free", "paid" → boolean |
| `labels` | `tags` | Ghost labels → Firebase tags |

### Phase 4: Extended Profile Fields

For fields not in Ghost (category, services, headline, bio), we'll need:

**Option A: Ghost Member Metadata** (Recommended)
- Use Ghost's custom member fields (if available in your version)
- Add fields in Ghost Admin → Settings → Members
- Sync via webhook

**Option B: Separate Profile Completion Form**
- After Ghost signup, redirect to profile form
- Form updates Firebase with additional fields
- Hosted on your site or as Ghost page

**Option C: Admin Dashboard**
- Build admin interface to manually enhance profiles
- Good for curated directory

### Phase 5: Two-Way Sync (Future)

Eventually sync Firebase changes back to Ghost:
- Profile updates in Firebase → Update Ghost member
- Maintains Ghost as single source of truth
- Useful if you build custom member portal

## Implementation Steps

### Step 1: Enable Ghost Webhooks

```bash
# Access Ghost Admin
https://yorkshirebusinesswoman.co.uk/ghost/#/settings/integrations

# Create Custom Integration
Name: Firebase Member Sync
Description: Syncs members to Firebase for directory

# Add Webhooks:
- member.added → https://YOUR-CF-URL/ghostWebhook?action=created
- member.edited → https://YOUR-CF-URL/ghostWebhook?action=updated
- member.deleted → https://YOUR-CF-URL/ghostWebhook?action=deleted
```

### Step 2: Create Cloud Function

Create `/api/functions/ghostWebhook.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.ghostWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Verify webhook signature (security)
    const signature = req.headers['x-ghost-signature'];
    if (!verifySignature(signature, req.body)) {
      return res.status(401).send('Unauthorized');
    }
    
    // Parse Ghost webhook data
    const { member } = req.body;
    const action = req.query.action;
    
    // Map to Firebase schema
    const memberData = mapGhostToFirebase(member);
    
    // Write to Firestore
    const db = admin.firestore();
    const memberRef = db.collection('members').doc(member.id);
    
    if (action === 'created') {
      await memberRef.set(memberData);
      console.log(`Created member: ${member.email}`);
    } else if (action === 'updated') {
      await memberRef.update(memberData);
      console.log(`Updated member: ${member.email}`);
    } else if (action === 'deleted') {
      await memberRef.delete();
      console.log(`Deleted member: ${member.email}`);
    }
    
    return res.status(200).send('Success');
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

function mapGhostToFirebase(ghostMember) {
  const nameParts = (ghostMember.name || '').split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return {
    // Core Identity
    uid: ghostMember.id,
    email: ghostMember.email,
    firstName: firstName,
    lastName: lastName,
    searchName: ghostMember.name.toLowerCase(),
    
    // Profile
    avatarUrl: ghostMember.avatar_image || '',
    headline: '', // Populate later via profile form
    bio: '', // Populate later via profile form
    location: {
      display: '',
      city: '',
      county: null,
      country: 'United Kingdom',
      countryCode: 'GB'
    },
    
    // Membership
    joinDate: ghostMember.created_at,
    lastUpdated: new Date().toISOString(),
    active: ghostMember.status !== 'free', // or your logic
    memberStatus: ghostMember.status,
    emailMarketing: ghostMember.subscribed,
    
    // Enhanced Fields (defaults)
    memberSlug: generateSlug(firstName, lastName),
    featured: false,
    category: 'Other',
    services: [],
    tags: ghostMember.labels ? ghostMember.labels.map(l => l.name) : [],
    
    // Social Links (empty by default)
    website: null,
    linkedInUrl: null,
    instagramUrl: null,
    facebookUrl: null,
    twitterUrl: null,
    
    // Analytics
    profileViews: 0,
    
    // Legacy (if needed)
    posts: 0,
    comments: 0,
    likes: 0,
    gamificationLevel: 1
  };
}

function generateSlug(firstName, lastName) {
  const slug = `${firstName}-${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug;
}

function verifySignature(signature, body) {
  // TODO: Implement Ghost webhook signature verification
  // Ghost sends HMAC SHA256 signature
  // Compare with your webhook secret
  return true; // Simplified for now
}
```

### Step 3: Deploy Cloud Function

```bash
# Navigate to project
cd /Users/robertblackwell/ybw-members-platform

# Initialize Firebase Functions
firebase init functions

# Select:
# - TypeScript or JavaScript (JavaScript is simpler)
# - Install dependencies

# Deploy
firebase deploy --only functions:ghostWebhook
```

### Step 4: Test the Integration

**Test 1: Create New Member**
1. Sign up a test member in Ghost
2. Check Firebase Firestore for new document
3. Verify all fields populated correctly

**Test 2: Update Member**
1. Edit member in Ghost Admin
2. Check Firebase for updated data

**Test 3: Delete Member**
1. Delete test member in Ghost
2. Verify removed from Firebase

### Step 5: Migrate Existing Members

For 177 existing members in Firebase, you have options:

**Option A: One-Time Import to Ghost**
- Export Firebase members
- Import to Ghost via Admin or API
- Let webhook sync them back (with Ghost as source)

**Option B: Reverse Sync (Firebase → Ghost)**
- Create script to push existing Firebase members to Ghost
- Then Ghost webhooks maintain sync going forward

**Option C: Keep Existing, Sync New Only**
- Only new signups go through Ghost
- Gradually migrate old members as they update profiles

## Profile Completion Flow

Since Ghost doesn't have all fields (headline, bio, category, services), create a profile completion flow:

### Step 1: After Ghost Signup
Redirect new members to profile completion form:

```
Ghost Signup Complete
    ↓
Redirect to: /complete-profile?email=user@example.com
    ↓
Profile Form (headline, bio, category, services, location, social links)
    ↓
Submit to Firebase Cloud Function
    ↓
Update Firestore with extended fields
    ↓
Redirect to Members Directory or Dashboard
```

### Step 2: Profile Form Page

Create a Ghost page `/complete-profile/` with form:

```html
<!-- Complete Your Profile -->
<form id="profile-form">
    <input type="text" name="headline" placeholder="Professional Headline" required>
    <textarea name="bio" placeholder="Tell us about yourself" required></textarea>
    
    <select name="category" required>
        <option value="">Select Category</option>
        <option value="Digital Marketing">Digital Marketing</option>
        <option value="Design & Creative">Design & Creative</option>
        <!-- ... all 17 categories -->
    </select>
    
    <input type="text" name="location" placeholder="Location (e.g., Leeds, UK)" required>
    
    <input type="text" name="services" placeholder="Services (comma-separated)">
    
    <input type="url" name="website" placeholder="Website URL">
    <input type="url" name="linkedInUrl" placeholder="LinkedIn URL">
    <input type="url" name="instagramUrl" placeholder="Instagram URL">
    
    <button type="submit">Complete Profile</button>
</form>

<script>
// Submit to Firebase Cloud Function endpoint
// /api/completeProfile
</script>
```

## Admin Dashboard (Phase 2)

Build a simple admin interface to:
- View all members
- Edit extended profile fields
- Mark members as featured
- Manage categories and tags
- Bulk operations

This can be:
- Custom Ghost page with admin-only access
- Separate web app authenticated with Firebase
- Ghost Admin integration (advanced)

## Migration Path from Circle.so

Once Ghost → Firebase sync is working:

1. **Export Circle.so members** (if any additional data needed)
2. **Update Ghost member profiles** with any Circle data
3. **Redirect Circle.so URLs** to Ghost/Firebase directory
4. **Cancel Circle.so subscription**
5. **Use Firebase for all member features**:
   - Directory
   - Profiles
   - Search/filtering
   - Featured members
   - Events (future)

## Security Considerations

1. **Webhook Signature Verification**
   - Verify Ghost webhook signature
   - Prevent unauthorized writes to Firebase

2. **Firebase Rules**
   - Restrict Firestore writes to Cloud Functions only
   - Allow public reads for directory

3. **Rate Limiting**
   - Prevent webhook spam
   - Implement exponential backoff

4. **Error Handling**
   - Log webhook failures
   - Retry failed syncs
   - Alert on critical errors

## Cost Estimate

**Firebase Costs** (100 new signups/month):
- Cloud Functions: ~$0.50/month
- Firestore Writes: ~$0.20/month
- Total: **< $1/month**

**Savings**:
- Cancel Circle.so: ~$79-199/month
- Cancel Zapier Pro (if only for this): ~$20/month

**Net Savings**: $100-220/month 💰

## Next Steps

### Immediate (Phase 1.3)
1. ✅ Document Ghost → Firebase integration (this doc)
2. ⬜ Initialize Firebase Functions in this project
3. ⬜ Build `ghostWebhook` Cloud Function
4. ⬜ Configure Ghost webhooks
5. ⬜ Test with new member signup

### Short-term (Phase 2)
6. ⬜ Create profile completion form
7. ⬜ Build `completeProfile` Cloud Function
8. ⬜ Test full signup → profile → directory flow

### Medium-term (Phase 3)
9. ⬜ Migrate existing 177 members
10. ⬜ Build admin dashboard for member management
11. ⬜ Deprecate Circle.so

### Long-term (Phase 4+)
12. ⬜ Two-way sync (Firebase → Ghost updates)
13. ⬜ Member self-service profile editing
14. ⬜ Advanced features (testimonials, availability, booking)

## Success Metrics

- ✅ New Ghost signups automatically appear in directory
- ✅ Profile updates sync within 5 seconds
- ✅ Zero manual data entry required
- ✅ 100% profile completion rate (via onboarding flow)
- ✅ Circle.so successfully deprecated

---

**Integration Version**: 1.0  
**Author**: Robert Blackwell + Warp AI  
**Last Updated**: January 12, 2025  
**Status**: Ready for Implementation
