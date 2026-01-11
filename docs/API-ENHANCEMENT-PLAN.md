# API Enhancement Architecture Plan
**Version**: 1.0  
**Date**: January 11, 2025

## Overview

This document outlines the architecture for enhancing the Yorkshire Businesswoman members API. The goal is to add filtering, search, pagination, and single-member lookup capabilities while maintaining backward compatibility with existing implementations.

## Current Architecture

### Existing Endpoint
```
GET https://getdata-bd3qt5x3dq-uc.a.run.app/getData?collection=myCollection
```

**Characteristics**:
- Single endpoint returning all 177 members (~250KB)
- No filtering, pagination, or search
- Deployed on Google Cloud Run
- Connected to Firebase Firestore
- Returns JSON with `{ data: Member[] }` structure

### Hosting Details
- **Platform**: Google Cloud Functions / Cloud Run
- **Region**: us-central (based on URL `uc`)
- **Database**: Firebase Firestore
- **Collection**: `myCollection` (members collection)

## Enhanced API Architecture

### Strategy: Versioned API Endpoints

Instead of modifying the existing `getData` endpoint, create new versioned endpoints to ensure backward compatibility.

```
/api/v1/getData          [EXISTING - Keep unchanged]
/api/v2/members          [NEW - Enhanced with query params]
/api/v2/members/search   [NEW - Full-text search]
/api/v2/members/:slug    [NEW - Single member lookup]
/api/v2/members/featured [NEW - Featured members only]
```

This approach allows:
- Existing Ghost templates continue working without changes
- Gradual migration to new API as features are built
- A/B testing and rollback capability

## New Endpoints Specification

### 1. GET /api/v2/members
**Purpose**: Retrieve members with filtering and pagination

**Query Parameters**:
```typescript
{
  // Filtering
  category?: string;          // e.g., "Digital Marketing"
  location?: string;          // e.g., "Leeds" (matches location.city)
  tags?: string[];            // Array of tags (comma-separated)
  services?: string[];        // Array of services (comma-separated)
  featured?: boolean;         // true/false
  verified?: boolean;         // true/false
  availability?: string;      // "available", "busy", "not-taking-clients"
  active?: boolean;           // true/false (default: true)
  
  // Pagination
  page?: number;              // Page number (default: 1)
  limit?: number;             // Results per page (default: 12, max: 50)
  
  // Sorting
  sort?: string;              // "name", "recent", "popular", "random"
  order?: "asc" | "desc";     // Sort order (default: "asc")
}
```

**Example Requests**:
```
GET /api/v2/members?category=Digital+Marketing&location=Leeds&limit=12&page=1
GET /api/v2/members?featured=true&limit=4
GET /api/v2/members?tags=B2B,Consulting&sort=popular
GET /api/v2/members?availability=available&category=Design+%26+Creative
```

**Response Format**:
```typescript
{
  success: boolean;
  data: Member[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    category?: string;
    location?: string;
    tags?: string[];
    // ... applied filters
  };
}
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "firstName": "Samantha",
      "lastName": "Stones",
      "memberSlug": "samantha-stones",
      "headline": "Web Designer & Brand Strategist",
      "location": {
        "display": "Leeds, UK",
        "city": "Leeds"
      },
      "category": "Design & Creative",
      "featured": false,
      "avatarUrl": "https://...",
      "website": "https://wfwebdesign.co.uk"
    }
    // ... more members
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "category": "Design & Creative",
    "location": "Leeds"
  }
}
```

### 2. GET /api/v2/members/search
**Purpose**: Full-text search across member profiles

**Query Parameters**:
```typescript
{
  q: string;                  // Search query (required)
  fields?: string[];          // Fields to search (default: all)
  limit?: number;             // Results limit (default: 12, max: 50)
  page?: number;              // Page number (default: 1)
}
```

**Search Fields** (when not specified):
- `firstName`, `lastName`, `searchName`
- `headline`
- `bio`
- `category`
- `tags`
- `services`
- `location.city`

**Example Requests**:
```
GET /api/v2/members/search?q=marketing&limit=20
GET /api/v2/members/search?q=Leeds&fields=location,bio
GET /api/v2/members/search?q=web+design&page=2
```

**Response Format**: Same as `/api/v2/members` (with pagination)

**Search Strategy**:
1. **Phase 1**: Simple text matching using Firestore queries
2. **Phase 2**: Implement Algolia or Typesense for advanced search
3. **Phase 3**: Add fuzzy matching, relevance scoring

### 3. GET /api/v2/members/:slug
**Purpose**: Retrieve a single member by their unique slug

**Path Parameter**:
- `slug` (string): URL-friendly identifier (e.g., "samantha-stones")

**Example Requests**:
```
GET /api/v2/members/samantha-stones
GET /api/v2/members/john-smith
```

**Response Format**:
```typescript
{
  success: boolean;
  data: Member;  // Full member object with all fields
}
```

**Behavior**:
- Returns 200 with full member data if found
- Returns 404 if member not found
- Increments `profileViews` counter on successful lookup
- Updates `lastActive` timestamp (optional)

### 4. GET /api/v2/members/featured
**Purpose**: Retrieve featured members only (optimized for widgets)

**Query Parameters**:
```typescript
{
  limit?: number;             // Number of featured members (default: 4)
  random?: boolean;           // Randomize selection (default: false)
}
```

**Example Requests**:
```
GET /api/v2/members/featured?limit=4
GET /api/v2/members/featured?limit=8&random=true
```

**Response Format**:
```typescript
{
  success: boolean;
  data: Member[];  // Array of featured members
}
```

## Implementation Strategy

### Option 1: Enhance Existing Cloud Function (Recommended)
**Pros**:
- Single codebase for all member API logic
- Easier to maintain
- Shared utilities and database connections
- Can use Cloud Functions routing

**Cons**:
- Larger function size
- Slightly longer cold start times

**Structure**:
```
/functions
  /src
    /api
      /v1
        getData.js          // Legacy endpoint (unchanged)
      /v2
        members.js          // GET /api/v2/members
        search.js           // GET /api/v2/members/search
        memberDetail.js     // GET /api/v2/members/:slug
        featured.js         // GET /api/v2/members/featured
    /utils
      db.js                 // Firestore connection
      filters.js            // Query building utilities
      pagination.js         // Pagination logic
      validation.js         // Input validation
    index.js                // Main entry point with routing
  package.json
  .env
```

### Option 2: Separate Cloud Functions
**Pros**:
- Smaller individual functions
- Faster cold starts
- Independent scaling
- Can deploy/rollback individually

**Cons**:
- More complex deployment
- Duplicated code across functions
- More difficult to maintain consistency

**Not recommended** for this project due to increased complexity.

### Recommended Approach: Option 1 with Express Router

Use Express.js routing within a single Cloud Function:

```javascript
// functions/src/index.js
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));

// V1 API (legacy)
app.get('/api/v1/getData', require('./api/v1/getData'));

// V2 API (enhanced)
app.get('/api/v2/members', require('./api/v2/members'));
app.get('/api/v2/members/search', require('./api/v2/members/search'));
app.get('/api/v2/members/featured', require('./api/v2/members/featured'));
app.get('/api/v2/members/:slug', require('./api/v2/members/memberDetail'));

exports.api = functions.https.onRequest(app);
```

## Database Query Optimization

### Firestore Composite Indexes

Create indexes for common query patterns:

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "featured", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "location.city", "order": "ASCENDING" },
        { "fieldPath": "active", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tags", "arrayConfig": "CONTAINS" },
        { "fieldPath": "active", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### Caching Strategy

Implement caching to reduce Firestore reads:

1. **Featured Members**: Cache for 1 hour (rarely changes)
2. **Category Listings**: Cache for 15 minutes
3. **Individual Member**: Cache for 5 minutes
4. **Search Results**: Cache for 5 minutes per query

**Implementation**:
```javascript
// Use Cloud Functions memory cache or Redis
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // 5 min default

async function getFeaturedMembers(limit = 4) {
  const cacheKey = `featured_${limit}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;
  
  const members = await db.collection('members')
    .where('featured', '==', true)
    .where('active', '==', true)
    .limit(limit)
    .get();
  
  const data = members.docs.map(doc => doc.data());
  cache.set(cacheKey, data, 3600); // 1 hour
  return data;
}
```

## Error Handling

Standardized error responses:

```typescript
{
  success: false;
  error: {
    code: string;           // "INVALID_QUERY", "NOT_FOUND", "SERVER_ERROR"
    message: string;        // User-friendly error message
    details?: any;          // Optional debug info (dev only)
  }
}
```

**Example**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_QUERY",
    "message": "Invalid category parameter. Must be one of: Digital Marketing, Design & Creative, ..."
  }
}
```

## Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
// 100 requests per minute per IP
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,        // 1 minute
  max: 100,                   // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  }
});

app.use('/api/v2', limiter);
```

## Security Considerations

1. **CORS**: Allow requests only from yorkshirebusinesswoman domains
2. **Input Validation**: Sanitize all query parameters
3. **SQL/NoSQL Injection**: Use Firestore parameterized queries
4. **Rate Limiting**: Prevent API abuse
5. **API Keys** (future): Implement API key authentication for advanced usage

## Deployment Strategy

### Phase 1: Deploy V2 alongside V1
1. Deploy new Cloud Function with both `/api/v1` and `/api/v2` routes
2. Test V2 endpoints in development
3. Update Cloud Run to route to new function
4. Keep V1 endpoint unchanged for backward compatibility

### Phase 2: Migrate Templates
1. Update homepage widget to use `/api/v2/members/featured`
2. Update directory page to use `/api/v2/members` with pagination
3. Test thoroughly before going live

### Phase 3: Monitor & Optimize
1. Monitor API performance with Cloud Logging
2. Track usage metrics (requests/min, response times)
3. Optimize slow queries
4. Add more indexes if needed

## Testing Plan

### Unit Tests
- Query building functions
- Pagination logic
- Input validation
- Error handling

### Integration Tests
- End-to-end API requests
- Database queries
- Cache behavior
- Rate limiting

### Load Testing
- Simulate 100+ concurrent users
- Measure response times under load
- Test cache effectiveness

## Cost Estimation

**Current Cost**: ~$0/month (minimal usage)

**Projected Cost with Enhancements**:
- Cloud Functions: ~$5/month (assuming 100k requests/month)
- Firestore Reads: ~$2/month (with caching)
- Cloud Run: ~$3/month
- **Total**: ~$10/month

**Optimization**: Caching reduces Firestore reads by 70-80%, keeping costs minimal.

## Migration Checklist

- [ ] Set up Cloud Functions project structure
- [ ] Implement `/api/v2/members` endpoint
- [ ] Implement `/api/v2/members/search` endpoint
- [ ] Implement `/api/v2/members/:slug` endpoint
- [ ] Implement `/api/v2/members/featured` endpoint
- [ ] Create Firestore composite indexes
- [ ] Add input validation and error handling
- [ ] Implement caching layer
- [ ] Add rate limiting
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Deploy to staging environment
- [ ] Test with staging Ghost site
- [ ] Deploy to production
- [ ] Update Ghost templates to use V2 API
- [ ] Monitor performance and errors
- [ ] Document API for external developers (future)

## Next Steps

1. **Review & Approve** - Get stakeholder approval for architecture
2. **Set up Firebase Project** - Ensure Cloud Functions are enabled
3. **Initialize Functions Codebase** - Create project structure
4. **Implement V2 Endpoints** - Build the enhanced API
5. **Test & Deploy** - Thorough testing before production deployment

---

**Architecture Version**: 1.0  
**Author**: Robert Blackwell + Warp AI  
**Date**: January 11, 2025  
**Status**: Draft - Pending Approval
