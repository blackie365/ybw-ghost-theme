# Yorkshire Businesswoman Members Platform

A comprehensive member engagement platform for Yorkshire Businesswoman, integrated with Ghost CMS and Firebase.

## Overview

This platform enhances the Yorkshire Businesswoman website with advanced member directory features, search, filtering, individual profiles, and analytics. The system connects Firebase Firestore data with Ghost CMS templates to create a dynamic member showcase.

**Current Members**: 177  
**Tech Stack**: Ghost CMS, Firebase Firestore, Cloud Functions, Handlebars  
**Live Site**: https://yorkshirebusinesswoman.co.uk

## Project Structure

```
/ybw-members-platform
├── /docs                    # Documentation and planning
│   ├── API.md               # Current API documentation
│   ├── DATA-AUDIT.md        # Member data audit report
│   ├── SCHEMA.md            # Enhanced database schema design
│   └── API-ENHANCEMENT-PLAN.md  # API v2 architecture
├── /templates               # Ghost Handlebars templates
│   ├── custom-members-directory-fixed.hbs
│   └── home-hbs-members-widget.hbs
├── /api                     # API endpoints (future)
├── /assets                  # CSS, JS, images (future)
└── /scripts                 # Utility scripts (future)
```

## Current Status

### Phase 1: Foundation & Architecture ✅ (95% Complete)

**Completed**:
- ✅ Git repository initialized with version control
- ✅ API structure documented ([docs/API.md](docs/API.md))
- ✅ Comprehensive data audit completed ([docs/DATA-AUDIT.md](docs/DATA-AUDIT.md))
- ✅ Enhanced schema designed v2.0 ([docs/SCHEMA.md](docs/SCHEMA.md))
- ✅ API enhancement architecture planned ([docs/API-ENHANCEMENT-PLAN.md](docs/API-ENHANCEMENT-PLAN.md))

**In Progress**:
- 🔄 API endpoint implementation (Phase 1.3)

**Key Findings from Data Audit**:
- 177 members with 98-100% completeness on core fields
- 64% have LinkedIn, 62% have Website
- 14 location variations for "Leeds" alone (needs normalization)
- Tags present but mostly generic (`["Members"]`)
- Engagement tracking inactive (all zeros)

### Next Phase: API Implementation

**Upcoming**: Implement enhanced API v2 with:
- `/api/v2/members` - Filtered & paginated member listing
- `/api/v2/members/search` - Full-text search
- `/api/v2/members/:slug` - Individual member profiles
- `/api/v2/members/featured` - Featured members widget

## Existing Features

### Members Directory Page
- **Location**: `/members-directory/`
- **Features**: 177 members in responsive 4-column grid, pagination (12 per page), read more/less for bios
- **Template**: `custom-members-directory-fixed.hbs`
- **Styling**: Ghost theme variables (light/dark mode support)

### Homepage Members Widget
- **Location**: Homepage (before footer)
- **Features**: 4 member thumbnails with circular photos, "View All Members" button
- **Template**: `home-hbs-members-widget.hbs`
- **Styling**: Responsive (4→2→1 columns), hover effects

## Documentation

- **[API Documentation](docs/API.md)** - Current API endpoint, data fields, response format
- **[Data Audit Report](docs/DATA-AUDIT.md)** - Analysis of 177 member records, data quality issues
- **[Enhanced Schema](docs/SCHEMA.md)** - Database schema v2.0 with new fields and migration plan
- **[API Enhancement Plan](docs/API-ENHANCEMENT-PLAN.md)** - Architecture for v2 API with filtering, search, pagination

## Development Environment

### Ghost CMS
- **Location**: `/var/www/ghost`
- **Service**: `ghost_topicuk-woman-co-uk`
- **Restart**: `sudo systemctl restart ghost_topicuk-woman-co-uk`

### Firebase
- **Database**: Firestore
- **Collection**: `myCollection`
- **Current API**: `https://getdata-bd3qt5x3dq-uc.a.run.app/getData?collection=myCollection`
- **Platform**: Google Cloud Functions / Cloud Run

## Roadmap

See the full 8-phase enhancement roadmap in the project plan.

### Completed Phases
- ✅ **Phase 1.1**: Project Structure & Git Setup
- ✅ **Phase 1.2**: Data Schema Analysis & Design

### Current Phase
- 🔄 **Phase 1.3**: API Enhancement Implementation

### Upcoming Phases
- **Phase 2**: Enhanced Directory Features (search, filtering, categories)
- **Phase 3**: Individual Member Profiles
- **Phase 4**: Ghost Native Integration
- **Phase 5**: Events Integration
- **Phase 6**: Business Directory Enhancements
- **Phase 7**: Analytics & Engagement
- **Phase 8**: Content Integration

## Contributing

This is a private project for Yorkshire Businesswoman.

---

**Project Start**: January 2025  
**Last Updated**: January 11, 2025  
**Maintainer**: Robert Blackwell  
**AI Assistant**: Warp
