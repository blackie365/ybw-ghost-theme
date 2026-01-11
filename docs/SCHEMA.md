# Enhanced Member Schema Design
**Version**: 2.0  
**Date**: January 11, 2025

## Overview

This document defines the enhanced schema for the Yorkshire Businesswoman members database. The design is informed by the [Data Audit](./DATA-AUDIT.md) findings and aims to:

1. Fix data type inconsistencies
2. Add new fields for enhanced functionality
3. Normalize location data
4. Enable better categorization and filtering
5. Support future features (profiles, search, analytics)

## Core Schema

### Member Document Structure

```typescript
interface Member {
  // === EXISTING FIELDS (Enhanced) ===
  
  // Core Identity
  id: string;                    // Unique Firebase document ID
  uid: string;                   // User authentication ID
  email: string;                 // Required, validated format
  firstName: string;             // Formerly "First Name"
  lastName: string;              // Formerly "Last Name"
  searchName: string;            // Lowercase concatenation for search
  
  // Profile
  headline: string;              // Professional title/tagline
  bio: string;                   // Full biography (rich text)
  location: Location;            // Structured location (see below)
  avatarUrl: string;             // Profile photo URL
  profileUrl: string;            // Link to external profile (if any)
  
  // Social Links
  website: string | null;        // Personal/business website
  linkedInUrl: string | null;    // LinkedIn profile
  instagramUrl: string | null;   // Instagram profile
  facebookUrl: string | null;    // Facebook profile
  twitterUrl: string | null;     // Twitter/X profile
  
  // Membership Data
  joinDate: string;              // ISO 8601 format (YYYY-MM-DD)
  lastActive: string;            // ISO 8601 timestamp
  active: boolean;               // Active membership status (not string!)
  memberStatus: string;          // "active", "inactive", "pending", etc.
  emailMarketing: boolean;       // Opt-in for email marketing
  
  // Engagement (Currently Inactive)
  posts: number;                 // Number of posts created (not string!)
  comments: number;              // Number of comments made (not string!)
  likes: number;                 // Number of likes received (not string!)
  gamificationLevel: number;     // Gamification/reward level
  
  // Administrative
  tags: string[];                // Categorization tags (not JSON string!)
  invitationData: any;           // Legacy invitation data
  
  // === NEW FIELDS (v2.0) ===
  
  // Enhanced Profile
  memberSlug: string;            // URL-friendly identifier (e.g., "samantha-stones")
  featured: boolean;             // Featured member flag
  category: string;              // Primary business category
  services: string[];            // Services offered
  
  // Analytics
  profileViews: number;          // Number of profile page views
  lastUpdated: string;           // ISO 8601 timestamp of last update
  
  // Future-Ready Fields
  verified: boolean;             // Verified business/profile badge
  testimonials: Testimonial[];   // Customer testimonials (optional)
  availability: string | null;   // "available", "busy", "not-taking-clients"
}
```

### Location Structure

Instead of storing location as a free-text string, use a structured format:

```typescript
interface Location {
  display: string;               // Display format: "Leeds, UK"
  city: string;                  // Normalized city name: "Leeds"
  county: string | null;         // County/region: "West Yorkshire"
  country: string;               // Country: "United Kingdom"
  countryCode: string;           // ISO country code: "GB"
}
```

**Example**:
```json
{
  "display": "Leeds, UK",
  "city": "Leeds",
  "county": "West Yorkshire",
  "country": "United Kingdom",
  "countryCode": "GB"
}
```

### Testimonial Structure (Optional)

```typescript
interface Testimonial {
  id: string;                    // Unique testimonial ID
  author: string;                // Name of person providing testimonial
  role: string;                  // Their role/company
  text: string;                  // Testimonial content
  rating: number;                // 1-5 star rating (optional)
  date: string;                  // ISO 8601 date
  approved: boolean;             // Moderation flag
}
```

## Field Definitions

### New Fields Detail

#### `memberSlug` (string)
- **Purpose**: URL-friendly unique identifier for member profile pages
- **Format**: Lowercase, hyphen-separated (e.g., "samantha-stones")
- **Generation**: `firstName-lastName` with collision handling (add number suffix if needed)
- **Validation**: Regex `^[a-z0-9-]+$`, max 100 characters
- **Example**: `/member/samantha-stones/`

#### `featured` (boolean)
- **Purpose**: Flag members for homepage/featured sections
- **Default**: `false`
- **Usage**: Filter featured members for widgets, hero sections
- **Access**: Admin-controlled via member management interface

#### `category` (string)
- **Purpose**: Primary business category for filtering and organization
- **Values**: Predefined list (see Categories section below)
- **Required**: Yes (defaults to "Other" if not set)
- **Usage**: `/members/?category=marketing`

#### `services` (string[])
- **Purpose**: Array of services the member offers
- **Format**: Array of strings, max 10 services
- **Example**: `["Web Design", "Branding", "SEO"]`
- **Usage**: Filter members by service type, search
- **Validation**: Each service max 50 characters

#### `profileViews` (number)
- **Purpose**: Track how many times member profile has been viewed
- **Default**: `0`
- **Increment**: +1 on each unique profile page view
- **Usage**: Analytics, "popular members" ranking

#### `lastUpdated` (string)
- **Purpose**: Track when member last updated their profile
- **Format**: ISO 8601 timestamp
- **Auto-update**: Set automatically on any profile edit
- **Usage**: Show "recently updated" members, data freshness indicator

#### `verified` (boolean)
- **Purpose**: Verified business/profile badge
- **Default**: `false`
- **Usage**: Trust indicator, filter verified members
- **Access**: Admin-controlled after verification process

#### `availability` (string | null)
- **Purpose**: Current availability status for new clients/projects
- **Values**: `"available"`, `"busy"`, `"not-taking-clients"`, `null`
- **Default**: `null`
- **Usage**: Help members find available service providers

## Categories

Predefined business categories for the `category` field:

```typescript
const CATEGORIES = [
  "Accounting & Finance",
  "Business Coaching",
  "Consulting",
  "Design & Creative",
  "Digital Marketing",
  "Events & Hospitality",
  "Health & Wellness",
  "HR & Recruitment",
  "Legal Services",
  "Manufacturing",
  "Property & Real Estate",
  "PR & Communications",
  "Retail & Ecommerce",
  "Technology & IT",
  "Training & Education",
  "Writing & Content",
  "Other"
];
```

These categories align with common business sectors in the Yorkshire business community.

## Tags vs. Category

- **Category**: Single primary classification (required)
- **Tags**: Multiple secondary classifications (optional, up to 10)

**Example**:
```json
{
  "category": "Digital Marketing",
  "tags": ["SEO", "B2B", "Leeds", "Social Media", "Content Strategy"]
}
```

## Data Migration Strategy

### Phase 1: Add New Fields (Non-Breaking)
Add new fields to schema without removing old ones:
- `memberSlug`, `featured`, `category`, `services`
- `profileViews`, `lastUpdated`, `verified`, `availability`
- Set defaults for all existing records

### Phase 2: Field Renames (Breaking)
Rename fields to match camelCase convention:
- `First Name` → `firstName`
- `Last Name` → `lastName`
- `Avatar URL` → `avatarUrl`
- `LinkedIn URL` → `linkedInUrl`
- etc.

### Phase 3: Data Type Conversions
Convert field types:
- `active`: string → boolean
- `posts`, `comments`, `likes`: string → number
- `tags`: JSON string → array
- `location`: string → Location object

### Phase 4: Location Normalization
Convert free-text locations to structured format:
1. Parse existing location strings
2. Map to standard city/county/country
3. Store as Location object

### Phase 5: Data Cleaning
- Remove empty string social URLs
- Standardize location values
- Add meaningful tags (replace `["Members"]`)
- Generate `memberSlug` for all members

## Validation Rules

### Required Fields
- `id`, `uid`, `email`
- `firstName`, `lastName`
- `headline`, `bio`
- `location` (or location.city at minimum)
- `avatarUrl`
- `category`

### Format Validation
```typescript
const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  memberSlug: /^[a-z0-9-]+$/,
  url: /^https?:\/\/.+/,
  dateISO: /^\d{4}-\d{2}-\d{2}$/,
  timestampISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
};
```

### Length Limits
- `firstName`, `lastName`: 1-100 characters
- `headline`: 5-150 characters
- `bio`: 10-2000 characters
- `memberSlug`: 3-100 characters
- `category`: Must be from CATEGORIES list
- `tags`: Array of 0-10 strings, each 1-50 characters
- `services`: Array of 0-10 strings, each 1-50 characters

### URL Validation
All URL fields must:
- Start with `http://` or `https://`
- Be valid URL format
- Be `null` if not provided (not empty string!)

## Database Indexes

For optimal query performance, create indexes on:

```typescript
// Firestore Index Definitions
{
  collection: "members",
  indexes: [
    { fields: ["active", "featured"], order: "desc" },
    { fields: ["category", "active"] },
    { fields: ["memberSlug"], unique: true },
    { fields: ["location.city", "active"] },
    { fields: ["lastUpdated"], order: "desc" },
    { fields: ["profileViews"], order: "desc" },
    { fields: ["tags"], arrayContains: true },
    { fields: ["services"], arrayContains: true }
  ]
}
```

## API Field Mapping

When returning member data via API, use the enhanced field names:

```typescript
// API Response Format
{
  "id": "abc123",
  "firstName": "Samantha",
  "lastName": "Stones",
  "memberSlug": "samantha-stones",
  "headline": "Web Designer & Brand Strategist",
  "bio": "...",
  "location": {
    "display": "Leeds, UK",
    "city": "Leeds",
    "county": "West Yorkshire",
    "country": "United Kingdom",
    "countryCode": "GB"
  },
  "category": "Design & Creative",
  "tags": ["Web Design", "Branding", "B2B"],
  "services": ["Website Design", "Logo Design", "Brand Strategy"],
  "featured": false,
  "verified": true,
  "avatarUrl": "https://...",
  "website": "https://wfwebdesign.co.uk",
  "linkedInUrl": "https://linkedin.com/in/...",
  // ... social links
  "profileViews": 127,
  "lastUpdated": "2025-01-10T14:30:00Z",
  "joinDate": "2023-06-15",
  "active": true
}
```

## Migration Script Pseudocode

```javascript
// Migration script outline
async function migrateMembers() {
  const members = await firestore.collection('members').get();
  
  for (const doc of members.docs) {
    const data = doc.data();
    const updates = {};
    
    // Add new fields with defaults
    updates.memberSlug = generateSlug(data['First Name'], data['Last Name']);
    updates.featured = false;
    updates.category = inferCategory(data.Headline, data.Bio) || 'Other';
    updates.services = [];
    updates.profileViews = 0;
    updates.lastUpdated = new Date().toISOString();
    updates.verified = false;
    updates.availability = null;
    
    // Convert data types
    updates.active = data.Active === 'true';
    updates.posts = parseInt(data.Posts || '0');
    updates.comments = parseInt(data.Comments || '0');
    updates.likes = parseInt(data.Likes || '0');
    updates.tags = JSON.parse(data.Tags || '[]');
    
    // Normalize location
    updates.location = normalizeLocation(data.Location);
    
    // Clean social URLs
    updates.website = cleanUrl(data.Website);
    updates.linkedInUrl = cleanUrl(data['LinkedIn URL']);
    updates.instagramUrl = cleanUrl(data['Instagram URL']);
    updates.facebookUrl = cleanUrl(data['Facebook URL']);
    updates.twitterUrl = cleanUrl(data['Twitter URL']);
    
    await doc.ref.update(updates);
  }
}
```

## Next Steps

1. **Review & Approve** - Get stakeholder approval for schema design
2. **Create Migration Script** - Implement the data migration logic
3. **Test on Staging** - Run migration on test data first
4. **Update API** - Enhance Cloud Functions to use new schema
5. **Update Frontend** - Modify templates to use new field names
6. **Deploy** - Run migration on production database

---

**Schema Version**: 2.0  
**Author**: Robert Blackwell + Warp AI  
**Date**: January 11, 2025  
**Status**: Draft - Pending Approval
