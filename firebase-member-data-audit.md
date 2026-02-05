# Firebase Member Data Structure Audit

## Current Data Structure (As of January 2026)

### Existing Fields in Firebase

Based on the live API response from `getMembersV2`, the current member document structure includes:

#### Identity & Authentication
- `id` - Document ID
- `UID` - User ID from Circle.so
- `First Name` - Member's first name
- `Last Name` - Member's last name
- `Email` - Member's email address

#### Profile Information
- `Bio` - Short biography (currently ~150 chars)
- `Headline` - Professional headline/title (e.g., "Joy Coach & Life Consultant")
- `Location` - Geographic location (e.g., "Ripon")
- `Avatar URL` - Profile image URL

#### Membership Status
- `Join Date` - ISO timestamp (e.g., "2024-10-24T19:30:26.000Z")
- `Last Active` - ISO timestamp
- `Active (Signed In Last 30 Days)` - "Yes" or "No" string
- `Member [y/N]` - "Yes" or "No" string for membership status
- `Email marketing` - "subscribed" or other status
- `Invitation status` - e.g., "profile_completed"
- `Invitation date` - ISO timestamp or empty string

#### Categorization
- `Tags` - Currently empty string (intended for array?)
- `Location` - Single location string

#### Social & Web Presence
- `Profile URL` - Circle.so profile URL
- `Website` - Personal/business website
- `LinkedIn URL` - LinkedIn profile
- `Twitter URL` - Twitter/X profile
- `Facebook URL` - Facebook profile
- `Instagram URL` - Instagram profile

#### Engagement Metrics
- `No. of Posts` - String number (e.g., "0")
- `No. of Comments` - String number
- `No. of Likes Received` - String number

#### Internal/Computed Fields
- `searchName` - Lowercase full name for search indexing

---

## Proposed Enhancements

### 1. New Fields to Add

#### Featured & Categorization
```javascript
{
  // Spotlight & Featured Members
  featured: false,              // Boolean - Show in spotlight carousel
  featuredPriority: 0,          // Number - Order priority for featured members (0-100)
  
  // Primary categorization
  category: "Member",           // String - Primary category (Member, Partner, Sponsor, etc.)
  
  // Enhanced tagging (convert from string to array)
  tags: [],                     // Array<string> - Multiple tags for filtering
  
  // Services offered
  services: [],                 // Array<string> - Services/expertise offered
  
  // Industries
  industries: [],               // Array<string> - Industry sectors
}
```

#### URL-Friendly Identifiers
```javascript
{
  // SEO-friendly slug for member profile URLs
  memberSlug: "",               // String - Unique URL slug (e.g., "ali-mortimer-joy-coach")
  
  // Slug generation: firstname-lastname-headline-excerpt
  // Must be unique, validated on creation/update
}
```

#### Tracking & Analytics
```javascript
{
  profileViews: 0,              // Number - Total profile page views
  profileViewsThisMonth: 0,     // Number - Views in current month
  lastUpdated: null,            // Timestamp - Last profile update
  lastViewedDate: null,         // Timestamp - Most recent profile view
  
  // Engagement scores (calculated periodically)
  engagementScore: 0,           // Number - Computed from posts, comments, likes, views
}
```

#### Extended Profile Information
```javascript
{
  // Extended bio and portfolio
  extendedBio: "",              // String - Longer biography (up to 2000 chars)
  achievements: [],             // Array<string> - Key achievements/awards
  
  // Business information
  companyName: "",              // String - Business/company name
  jobTitle: "",                 // String - Current job title
  businessType: "",             // String - Sole trader, Ltd, Partnership, etc.
  
  // Gallery/Portfolio
  galleryImages: [],            // Array<{url: string, caption: string, order: number}>
  
  // Testimonials
  testimonials: [],             // Array<{author: string, text: string, date: Timestamp}>
  
  // Contact preferences
  availableForMentoring: false, // Boolean
  openToCollaboration: false,   // Boolean
  seekingSupport: false,        // Boolean
}
```

### 2. Fields to Modify

#### Tags Field
**Current:** `Tags: ""` (empty string)
**Proposed:** `tags: []` (array of strings)

**Migration:** Convert any existing comma-separated string values to arrays

#### Numeric Fields
**Current:** Stored as strings (e.g., `"No. of Posts": "0"`)
**Proposed:** Convert to actual numbers

```javascript
{
  posts: 0,              // Number (was "No. of Posts": "0")
  comments: 0,           // Number (was "No. of Comments": "0")
  likesReceived: 0,      // Number (was "No. of Likes Received": "0")
}
```

#### Boolean Fields
**Current:** String values "Yes"/"No"
**Proposed:** Actual boolean values

```javascript
{
  active: true,           // Boolean (was "Active (Signed In Last 30 Days)": "Yes")
  member: true,           // Boolean (was "Member [y/N]": "Yes")
  emailMarketing: true,   // Boolean (was "Email marketing": "subscribed")
}
```

---

## Implementation Plan

### Phase 1: Add New Optional Fields
1. Add `featured`, `category`, `services[]`, `industries[]` as optional fields
2. Add `memberSlug` generation logic
3. Add `profileViews`, `lastUpdated` tracking fields
4. Deploy updated API endpoints to handle new fields

### Phase 2: Data Migration Script
1. Create migration script to:
   - Convert `Tags` string to `tags` array
   - Convert numeric strings to numbers
   - Convert Yes/No strings to booleans
   - Generate `memberSlug` for existing members
   - Initialize tracking fields with default values

### Phase 3: Update API Endpoints
1. Modify `getMembersV2` to return new fields
2. Add filtering by `featured`, `category`, `services`, `industries`
3. Add endpoint for profile view tracking
4. Add endpoint for member profile updates

### Phase 4: Update Frontend
1. Update member directory to show new categories/filters
2. Update spotlight carousel to use `featured` flag
3. Create individual member profile page template
4. Add profile view tracking to member pages

### Phase 5: Admin Interface
1. Create admin interface to mark members as featured
2. Add bulk tagging/categorization tools
3. Add analytics dashboard for profile views

---

## Field Naming Conventions

### Current Convention
- Mixed: Some PascalCase with spaces ("First Name"), some lowercase with spaces ("No. of Posts")

### Proposed Convention
- **camelCase** for all new fields (featured, memberSlug, profileViews)
- Maintain backwards compatibility by keeping original field names
- API response can transform to camelCase for frontend consumption

---

## Database Schema Example

```javascript
{
  // Core Identity (existing)
  "id": "BFhbxRBEU3VeEMbdv06k",
  "UID": "XOhO3kRf",
  "First Name": "Ali",
  "Last Name": "Mortimer",
  "Email": "mortimer_ali@hotmail.co.uk",
  
  // New: URL-friendly identifier
  "memberSlug": "ali-mortimer-joy-coach",
  
  // Profile (existing + extended)
  "Bio": "Short bio...",
  "extendedBio": "Longer biography with more details...",
  "Headline": "Joy Coach & Life Consultant",
  "jobTitle": "Life Consultant",
  "companyName": "Ali Mortimer Coaching",
  "businessType": "Sole Trader",
  "Location": "Ripon",
  "Avatar URL": "https://...",
  
  // New: Featured & Categorization
  "featured": true,
  "featuredPriority": 85,
  "category": "Member",
  "tags": ["coaching", "wellness", "consulting"],
  "services": ["Life Coaching", "Corporate Wellness", "1-to-1 Consulting"],
  "industries": ["Health & Wellness", "Professional Services"],
  
  // Membership (existing)
  "Join Date": "2024-10-24T19:30:26.000Z",
  "Last Active": "2025-02-26T16:05:04.000Z",
  "Active (Signed In Last 30 Days)": "Yes",
  "Member [y/N]": "Yes",
  "Email marketing": "subscribed",
  
  // New: Tracking
  "lastUpdated": "2026-01-15T10:00:00.000Z",
  "profileViews": 127,
  "profileViewsThisMonth": 23,
  "lastViewedDate": "2026-01-15T09:45:00.000Z",
  "engagementScore": 68,
  
  // Social (existing)
  "Website": "https://www.alimortimer.com",
  "LinkedIn URL": "https://linkedin.com/in/ali-mortimer/",
  "Instagram URL": "https://instagram.com/alimortimer_thejoycoach/",
  "Twitter URL": "",
  "Facebook URL": "",
  "Profile URL": "https://businesswoman-network...",
  
  // New: Extended Profile
  "achievements": [
    "Featured in Yorkshire Magazine 2024",
    "ICF Certified Coach"
  ],
  "galleryImages": [
    {
      "url": "https://...",
      "caption": "Workshop 2024",
      "order": 1
    }
  ],
  "testimonials": [
    {
      "author": "Jane Smith",
      "text": "Ali transformed my approach to...",
      "date": "2025-11-15T00:00:00.000Z"
    }
  ],
  
  // New: Preferences
  "availableForMentoring": true,
  "openToCollaboration": true,
  "seekingSupport": false,
  
  // Engagement (existing)
  "No. of Posts": "5",
  "No. of Comments": "12",
  "No. of Likes Received": "34",
  
  // Internal (existing)
  "searchName": "ali mortimer",
  "Invitation status": "profile_completed",
  "Invitation date": ""
}
```

---

## API Changes Required

### New Endpoint: Update Member Profile
```
PUT /api/members/:slug
```

### New Endpoint: Track Profile View
```
POST /api/members/:slug/view
```

### Enhanced Endpoint: Get Members with New Filters
```
GET /api/members?featured=true&category=Member&services=Coaching
```

### New Endpoint: Get Single Member by Slug
```
GET /api/members/:slug
```

---

## Next Steps

1. ✅ Complete this audit document
2. ⬜ Review and approve new fields with stakeholders
3. ⬜ Create database migration script
4. ⬜ Update Firebase Cloud Functions with new endpoints
5. ⬜ Test migration on development database
6. ⬜ Deploy to production
7. ⬜ Update Ghost theme templates to use new fields
8. ⬜ Create admin interface for managing new fields
