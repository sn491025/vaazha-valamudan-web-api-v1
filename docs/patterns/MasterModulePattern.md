# Master Module Pattern

This document standardizes the folder structure and API responsibilities for the Master module.

## Intent

- Promote reuse by separating concerns:
  - property-category: master data for property categories (e.g., FLAT, VILLA, LAND).
  - feature-category: feature definitions and their options (e.g., BHK with options 1BHK, 2BHK).
  - property-mapping: links property categories to feature categories (e.g., FLAT needs BHK; LAND does not).

## Folder structure

src/modules/master
  ├── entities/
  ├── property-category/
  │   ├── dto/
  │   │   ├── create-property-category.dto.ts
  │   │   ├── update-property-category.dto.ts
  │   │   └── property-category-response.dto.ts
  │   ├── services/
  │   │   └── property-categories.service.ts
  │   └── property-category.controller.ts
  ├── feature-category/
  │   ├── dto/
  │   │   ├── create-feature-category.dto.ts
  │   │   ├── update-feature-category.dto.ts
  │   │   ├── feature-category-response.dto.ts
  │   │   ├── create-feature-option.dto.ts
  │   │   ├── update-feature-option.dto.ts
  │   │   ├── create-feature-category-with-options.dto.ts
  │   │   ├── update-feature-category-with-options.dto.ts
  │   │   └── feature-option-response.dto.ts
  │   ├── services/
  │   │   └── feature-categories.service.ts
  │   └── feature-category.controller.ts
  ├── property-mapping/
  │   ├── dto/
  │   │   ├── create-mapping.dto.ts
  │   │   ├── update-mapping-status.dto.ts
  │   │   └── mapping-response.dto.ts
  │   ├── services/
  │   │   └── property-category-feature-mappings.service.ts
  │   └── property-mapping.controller.ts
  ├── index.ts
  └── master.module.ts

## Design Notes

- Feature options live under feature-category (nested resource under a feature category).
- Batch APIs for feature categories with options:
  - POST /master/feature-categories/with-options
  - PATCH /master/feature-categories/:id/with-options
- Options are only valid for select types:
  - Allowed: single_select, multi_select
  - Not allowed: numeric, text (on update they are ignored and existing options are deactivated)
- Property-to-feature mappings use batch endpoints:
  - GET /master/property-mapping/:propertyCategoryId — returns the snapshot for a property category.
  - POST /master/property-mapping/apply — create/apply mappings in bulk.
  - PATCH /master/property-mapping/apply — idempotent update; behaves like apply for updates.
  - Request/response shape:

    {
      "property_category_id": "a1b2c3d4-1111-2222-3333-444444444444",
      "property_category_name": "Apartment",
      "mappings": [
        {
          "feature_category_id": "f001-bhk-0001",
          "feature_category_name": "BHK",
          "is_mandatory": true,
          "is_filterable": true,
          "sort_order": 1,
          "is_active": true
        }
      ]
    }

  - Semantics:
    - Upserts mappings for provided feature categories.
    - Deactivates mappings for the property category that are omitted from the payload.
    - Syncs feature category attributes (isMandatory, isFilterable, sortOrder) from the payload.
- Controllers are thin; validation is handled via DTOs, and business logic lives in services.

## Barrels (index.ts)

- Provide a minimal index.ts that re-exports the module for ergonomics:
  - export * from './master.module';
- Do NOT re-export every entity to avoid maintenance overhead.

## TypeORM Entity Discovery

- Use a glob in TypeORM config to avoid manually listing entities:
  - entities: [path.join(__dirname, '..', '**', '*.entity.{js,ts}')]

## Swagger Guidance

- Tag controllers as:
  - "Master - Property Categories"
  - "Master - Feature Categories"
  - "Master - Property Category Feature Mappings"
- Provide examples for list, get, create, update, and status endpoints, including nested options and the batch APIs above.

## Security

- Apply appropriate guards for admin-only management of masters.
- Keep read endpoints public or protected per your product requirements.
