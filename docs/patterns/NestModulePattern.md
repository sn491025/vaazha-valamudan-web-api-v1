# Nest Module Pattern (Project Standard)

This project follows a feature-first module structure for NestJS. Each domain/feature module encapsulates controllers, DTOs, services, and tests under a single folder.

## Folder structure

- Feature modules live under `src/modules/<feature>` (e.g., `users`, `auth`, `shared`, `master`).
- Sub-features are nested under the feature (e.g., `users/profile`, `users/roles`, `auth/login`, `auth/register`, `auth/forgot-password`).
- Each sub-feature groups:
  - `*.controller.ts` and `*.controller.spec.ts`
  - `dto/` for request/response DTOs
  - `services/` for business logic
- Each top-level feature exports a `*.module.ts` and may include:
  - `entities/` for TypeORM entities
  - `index.ts` barrel for public exports

## Complex feature example: Master

- See `docs/patterns/MasterModulePattern.md` for the canonical structure:
  - `master/property-category`
  - `master/feature-category` (owns feature options)
  - `master/property-mapping`
  - `master/index.ts` (barrel exporting MasterModule)

## TypeORM Entities

- Prefer glob-based entity discovery to avoid listing every entity by hand:
  - entities: [path.join(__dirname, '..', '**', '*.entity.{js,ts}')]
