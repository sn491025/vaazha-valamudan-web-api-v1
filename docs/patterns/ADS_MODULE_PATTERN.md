# Ads Management Module

## Overview
The Ads Management Module handles all ad-related functionality for the application, including ad creation, boosting options, approval workflow, reporting system, and publication management.

## Folder Structure
```
AdsModule/
├── entities/
│   ├── ad.entity.ts
│   ├── ad-category.entity.ts
│   ├── ad-image.entity.ts
│   ├── ad-boost.entity.ts
│   ├── ad-report.entity.ts
│   └── ad-approval.entity.ts
├── constants/
│   ├── ad-status.enum.ts
│   ├── ad-boost-type.enum.ts
│   ├── ad-report-reason.enum.ts
│   └── ad-report-status.enum.ts
│   └── ad-approval-status.enum.ts
├── interfaces/
│   ├── ad-boosting-options.interface.ts
│   └── ad-report-response.interface.ts
├── ads/
│   ├── dto/
│   │   ├── create-ad.dto.ts
│   │   ├── update-ad.dto.ts
│   │   └── ad-response.dto.ts
│   ├── services/
│   │   ├── ad.service.ts
│   │   └── ad-image.service.ts
│   └── ad.controller.ts
├── ad-boosting/
│   ├── dto/
│   │   ├── create-boost.dto.ts
│   │   └── boost-response.dto.ts
│   ├── services/
│   │   └── ad-boost.service.ts
│   └── ad-boost.controller.ts
├── ad-approval/
│   ├── dto/
│   │   ├── approval-request.dto.ts
│   │   └── approval-response.dto.ts
│   ├── services/
│   │   └── ad-approval.service.ts
│   └── ad-approval.controller.ts
└── ad-reports/
    ├── dto/
    │   ├── create-report.dto.ts
    │   └── report-response.dto.ts
    ├── services/
    │   └── ad-report.service.ts
    └── ad-report.controller.ts
```



## API Endpoints

### Ads Controller
```
// Create a new ad (initially as draft)
POST /api/ads

// Update an ad
PUT /api/ads/:id

// Get ad details
GET /api/ads/:id

// List ads with filtering options
GET /api/ads

// Upload ad images
POST /api/ads/:id/images

// Delete ad image
DELETE /api/ads/:id/images/:imageId

// Submit ad for approval
POST /api/ads/:id/submit

// Delete/remove ad
DELETE /api/ads/:id
```

### Ad Boosting Controller
```
// Get available boost options
GET /api/ad-boosting/options

// Create a boost for an ad
POST /api/ad-boosting/ads/:adId/boosts

// Get boosts for an ad
GET /api/ad-boosting/ads/:adId/boosts

// Cancel a boost
DELETE /api/ad-boosting/boosts/:id
```

### Ad Approval Controller
```
// List ads pending approval
GET /api/ad-approval/pending

// Approve an ad
POST /api/ad-approval/ads/:adId/approve

// Reject an ad
POST /api/ad-approval/ads/:adId/reject

// Request changes for an ad
POST /api/ad-approval/ads/:adId/request-changes
```

### Ad Reports Controller
```
// Report an ad
POST /api/ad-reports/ads/:adId/report

// List reported ads
GET /api/ad-reports

// Review a report
PUT /api/ad-reports/:id/review

// Get reports for an ad
GET /api/ad-reports/ads/:adId
```

## Key Components

### Entities

#### Ad Category Entity
Categorizes ads for better organization and searchability:
- Hierarchical structure with parent-child relationships
- Active status control
- Icon for UI display

#### Ad Entity
Stores the main ad information:
- Basic details (title, description)
- Category assignment
- Status tracking
- Location information
- Pricing details
- Contact information
- Analytics tracking (views, clicks)
- Publication and expiry dates
- **Direct boost fields for efficient querying**:
  - isBoosted flag
  - activeBoostType
  - boostExpiresAt
  - boostAmount
  - boostPriority

#### Ad Image Entity
Manages images associated with ads:
- Image URLs and thumbnails
- Sorting order
- Primary image designation
- Image metadata (size, dimensions)

#### Ad Boost Entity
Handles promotion and boosting options:
- Boost type (premium placement, featured, etc.)
- Duration settings
- Cost tracking
- Payment link
- Historical record of all boosts

#### Ad Report Entity
Tracks user reports about problematic ads:
- Reporting reason
- Status tracking
- Administrative review process
- Evidence data

#### Ad Approval Entity
Manages the approval workflow:
- Approval status
- Review information
- Rejection reasons
- Moderation notes

### Services

#### Ad Service
Core business logic for ads:
- Creating and updating ads
- Status management
- Submission for approval
- Basic analytics
- **Synchronization between ad_boosts table and ad boost fields**

#### Ad Image Service
Handles image processing and storage:
- Image upload and validation
- Thumbnail generation
- Image sorting
- Integration with S3StorageService from shared module

#### Ad Boost Service
Manages ad promotion options:
- Available boost types
- Pricing calculations
- Boost application
- Integration with payment module

#### Ad Approval Service
Handles the approval workflow:
- Queue management
- Review process
- Status changes
- Notification triggers

#### Ad Report Service
Processes user reports:
- Report submission
- Review workflow
- Action recommendations
- Tracking and analytics

## Boost Management - Hybrid Approach

The system uses a hybrid approach for managing ad boosts:

1. **Direct Fields in Ad Entity**:
   - `isBoosted`: Flag indicating if ad has any active boost
   - `activeBoostType`: Current active boost type
   - `boostExpiresAt`: When the boost expires
   - `boostAmount`: Cost of the current boost
   - `boostPriority`: Calculated priority for sorting

2. **Separate AdBoost Entity**:
   - Maintains historical record of all boosts
   - Tracks detailed boost settings
   - Links to payment records
   - Allows for multiple boost types tracking

3. **Synchronization Process**:
   - When boosts are created/updated/canceled, the system syncs boost information to the Ad entity
   - Priority calculations determine which boost is considered the "primary" one
   - Database queries for public pages can use the direct fields for efficient sorting and filtering

### Benefits:
- Efficient queries for public pages (no joins needed to determine boost status)
- Complete historical record of all boosts
- Proper relationship to payments
- Ability to generate boost-related reports
- Support for multiple boost types with different priorities

## Integration with Other Modules

### Shared Module Integration
- Uses S3StorageService for image upload and management
- Leverages other shared utilities and services

### User Module Integration
- User-based ad creation
- User permissions for ad management
- User reporting system

### Payment Module Integration
- Payment for ad boosting
- Invoice generation for boost purchases
- Payment tracking for premium features

## Configuration

### Environment Variables
```
AD_MAX_IMAGE_SIZE=5242880
AD_MAX_IMAGES_PER_AD=10
AD_APPROVAL_REQUIRED=true
AD_DEFAULT_EXPIRY_DAYS=30
```

## Testing Strategy

### Unit Tests
- Service layer functionality
- Ad validation logic
- Report handling
- Boost calculations

### Integration Tests
- API endpoint functionality
- Image upload and processing
- Approval workflows
- Payment integration

### Functional Tests
- Complete ad lifecycle
- Reporting and moderation flow
- Boosting functionality

