# Shared Module

The Shared module is independent and reusable across projects. It hosts cross-cutting services like authorization helpers, email, OTP, and logger setup.

Design rules:
- No imports from app-specific feature modules or domain entities.
- All configuration via DI tokens or a generic ConfigService; avoid hardcoded project constants.
- Export providers via SharedModule and re-export them in `index.ts` for consumers.
- Prefer no controllers; keep optional/diagnostic endpoints minimal.

Typical structure:
