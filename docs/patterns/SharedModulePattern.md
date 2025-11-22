# Shared Module Pattern (Independent & Reusable)

The Shared module provides cross-cutting, reusable capabilities that can be consumed within this project and reused across other projects with minimal or no changes.

Core principles:
- Independence: Must not depend on app-specific modules, entities, or business rules.
- Reusability: Export stable interfaces/tokens and keep implementation swappable.
- Minimal assumptions: Configuration comes via environment variables or DI tokens, not project-specific constants.
- Clear API: Consumers import SharedModule and depend on documented interfaces/providers.

Responsibilities (examples):
- Authorization helpers (token verification, password hashing abstractions, current-user extraction helpers)
- Email delivery (provider-agnostic interface with swappable implementations)
- OTP generation/validation
- Logger setup and helper utilities
- Other generic infrastructure/services that are not domain-specific

Non-responsibilities:
- Domain entities or business logic that belongs to features (e.g., Users, Orders)
- Feature-specific controllers or DTOs
- Project-specific workflows

## Folder structure
