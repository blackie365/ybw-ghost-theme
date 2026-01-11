# API Documentation

## Current API

### Endpoint
```
GET https://getdata-bd3qt5x3dq-uc.a.run.app/getData?collection=myCollection
```

### Response Format
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "First Name": "string",
      "Last Name": "string",
      "Email": "string",
      "Headline": "string",
      "Bio": "string",
      "Location": "string",
      "Avatar URL": "string",
      "Website": "string",
      "LinkedIn URL": "string",
      "Instagram URL": "string",
      "Facebook URL": "string",
      "Twitter URL": "string",
      "Profile URL": "string",
      "Tags": "string (JSON array as string)",
      "Join Date": "string (ISO 8601)",
      "Last Active": "string (ISO 8601)",
      "Active (Signed In Last 30 Days)": "Yes|No",
      "Member [y/N]": "Yes|No",
      "Email marketing": "subscribed|unsubscribed",
      "UID": "string",
      "searchName": "string (lowercase full name)",
      "No. of Posts": "string (number)",
      "No. of Comments": "string (number)",
      "No. of Likes Received": "string (number)",
      "Gamification level": "string (number)",
      "Invitation date": "string (ISO 8601)",
      "Invitation status": "string",
      "ID": "string (number)"
    }
  ]
}
```

### Current Data Fields Analysis

#### Core Identity
- `id` - Firestore document ID
- `First Name` - Member's first name
- `Last Name` - Member's last name
- `Email` - Contact email
- `searchName` - Lowercase full name for searching

#### Profile Information
- `Headline` - Professional headline/tagline
- `Bio` - Full biography text
- `Location` - Geographic location (e.g., "Leeds", "Wakefield")
- `Avatar URL` - Profile photo URL (Circle.so CDN)

#### Social Links
- `Website` - Personal/business website
- `LinkedIn URL` - LinkedIn profile
- `Instagram URL` - Instagram profile
- `Facebook URL` - Facebook profile
- `Twitter URL` - Twitter profile
- `Profile URL` - Circle.so community profile URL

#### Membership Data
- `Join Date` - When member joined (ISO 8601)
- `Last Active` - Last activity timestamp
- `Active (Signed In Last 30 Days)` - Activity status
- `Member [y/N]` - Membership status
- `Email marketing` - Email subscription status
- `UID` - User ID from Circle.so

#### Engagement Metrics
- `No. of Posts` - Number of posts made
- `No. of Comments` - Number of comments made
- `No. of Likes Received` - Likes received count
- `Gamification level` - Engagement level (1-10+)

#### Administrative
- `Tags` - JSON string of tags (e.g., `["Members"]`)
- `Invitation date` - When invited
- `Invitation status` - Status of invitation
- `ID` - Circle.so numeric ID

### Data Quality Issues Observed
1. **Inconsistent capitalization**: Some location names inconsistent
2. **Empty fields**: Many social media URLs are empty strings
3. **String numbers**: Numeric fields stored as strings
4. **Tags format**: Tags stored as JSON string instead of array
5. **Missing data**: Not all members have Bio, Headline, or Location

## Planned API Enhancements

### 1. Filtered Endpoint
```
GET /api/members?category={category}&location={location}&featured={boolean}
```

**Response:**
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "total": 177,
    "filtered": 25,
    "page": 1,
    "perPage": 12
  }
}
```

### 2. Search Endpoint
```
GET /api/members/search?q={query}&fields={name,bio,headline}
```

**Response:**
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "query": "web designer",
    "results": 5,
    "searchedFields": ["name", "bio", "headline"]
  }
}
```

### 3. Paginated Endpoint
```
GET /api/members?page={page}&limit={limit}
```

**Response:**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 177,
    "totalPages": 15,
    "hasMore": true
  }
}
```

### 4. Single Member Lookup
```
GET /api/member/{slug}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "...",
    "firstName": "...",
    "lastName": "...",
    "slug": "jane-smith",
    "profileViews": 42,
    "...": "..."
  }
}
```

### 5. Featured Members
```
GET /api/members/featured?limit=4
```

**Response:**
```json
{
  "status": "success",
  "data": [...],
  "meta": {
    "featured": true,
    "count": 4
  }
}
```

## Enhanced Data Schema

### New Fields to Add

```typescript
interface EnhancedMember {
  // Existing fields...
  
  // New fields
  featured: boolean;           // Is this member featured?
  category: string;             // Primary category (e.g., "Marketing", "Tech", "Finance")
  tags: string[];              // Array of tags (parsed from existing Tags field)
  services: string[];          // Services offered
  memberSlug: string;          // URL-friendly identifier (e.g., "jane-smith")
  profileViews: number;        // View counter
  lastUpdated: timestamp;      // Last profile update
  
  // Normalized fields (clean up existing data)
  isActive: boolean;           // Parsed from "Active (Signed In Last 30 Days)"
  isMember: boolean;           // Parsed from "Member [y/N]"
  emailSubscribed: boolean;    // Parsed from "Email marketing"
  postsCount: number;          // Parsed from "No. of Posts"
  commentsCount: number;       // Parsed from "No. of Comments"
  likesCount: number;          // Parsed from "No. of Likes Received"
}
```

## Implementation Strategy

### Phase 1: Read-Only Enhancements
1. Add filtering to existing endpoint (server-side)
2. Add search functionality
3. Add pagination
4. Add single member lookup

### Phase 2: Data Enhancement
1. Add new fields to Firebase schema
2. Populate `memberSlug` for all members
3. Initialize `featured`, `profileViews`, `lastUpdated`
4. Normalize existing data

### Phase 3: Write Operations
1. Endpoint to increment profileViews
2. Admin endpoint to update featured status
3. Sync service for bulk updates

## Technical Considerations

### Current Infrastructure
- **Hosting**: Google Cloud Run
- **Database**: Firebase Firestore
- **Language**: Likely Node.js/JavaScript

### Performance
- Current: All 177 members fetched at once (~250KB response)
- Recommended: Server-side pagination to reduce payload
- Consider: Caching strategy for frequently accessed data

### Security
- Current: Public read-only endpoint
- Future: Consider rate limiting
- Future: Admin endpoints need authentication

## Next Steps
1. ✅ Document current API structure
2. Audit all 177 member records for data quality
3. Design migration script for new fields
4. Implement enhanced API endpoints
5. Update frontend to use new API features
