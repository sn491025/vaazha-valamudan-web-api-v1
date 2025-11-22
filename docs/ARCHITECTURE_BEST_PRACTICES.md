# Architecture Best Practices

This document captures the project-wide best practices to guide implementation and reviews.

## 1) Modules and Boundaries
- Feature-first structure: keep domain logic in feature modules, avoid cross-feature deep imports.
- Shared module is independent and reusable; expose contracts via tokens/interfaces and re-export in a controlled barrel.
- Keep controllers thin; push business logic into services; avoid fat entities.

## 2) DTOs, Validation, and API
- Use class-validator on all input DTOs; enable global ValidationPipe with whitelist, transform, forbidNonWhitelisted.
- Keep response DTOs explicit and stable; avoid leaking internal entities.
- Maintain OpenAPI docs (Swagger) with proper models and security schemes (JWT bearer + public token).

## 3) Configuration Management
- Centralize configuration via a ConfigModule/factory; validate env vars with a schema (e.g., Joi).
- Separate envs: development, staging, production; no hardcoded secrets or file paths.
- Provide a .env.example and document required variables.

## 4) Authentication and Authorization
- Private users: JWT access/refresh token pair, rotate refresh tokens, hash and store refresh token per device session.
- Mobile sessions: longer refresh TTL; short access TTL; deviceType included in claims.
- Public pages: use a signed public token or a lightweight strategy; scope it narrowly (read-only) and short TTL.
- Guards and strategies: create dedicated guards (JwtAuthGuard, PublicTokenGuard) and decorators for roles/scopes.
- RBAC: add a RolesGuard based on roles/permissions in JWT; keep authorization checks in guards, not controllers.

## 5) Device Sessions and Notifications
- Upsert device session on login; store deviceId, deviceType, platform, FCM token, lastLoginAt.
- Support logout per device and global logout; revoke refresh token by invalidating the stored hash.
- Expose a notification service interface in Shared to send push to saved FCM tokens.

## 6) OTP and Login Hygiene
- Rate limit OTP requests and verification attempts; invalidate on max attempts or expiry.
- Use purpose-specific OTPs with short TTL; avoid reusing codes.
- Consider hashing OTP codes at rest.
- Periodic cleanup job for expired OTPs via a scheduler.

## 7) Persistence and Migrations
- Define explicit column types; add indexes and unique constraints where appropriate (e.g., device sessions).
- No synchronize in production; migrations only.
- Prefer snake_case naming strategy for DB columns and indexes for consistency.
- Entity nullability convention:
  - Do NOT use union types with nullable: true (e.g., `@Column({ nullable: true }) password: string | null;`).
  - Instead, make the property optional with a standard decorator (e.g., `@Column() password?: string;`).
  - Avoid union types in entity fields; prefer optional properties to indicate nullability in the domain model.

## 8) Observability, Logging, and Errors
- Use a structured logger (e.g., pino) via a centralized logger service; add request correlation IDs.
- Avoid logging PII (email/phone/full tokens); redact secrets.
- Add a global exception filter to enforce a consistent error shape.
- Health endpoints and graceful shutdown; optionally add metrics (Prometheus) and tracing (OpenTelemetry).

## 9) Security and HTTP
- Enable CORS with explicit origins; set secure headers (helmet).
- If cookies are used, set httpOnly, secure, sameSite; consider CSRF for browser-based sessions.
- Throttle login and OTP endpoints; consider IP/device fingerprint checks.

## 10) Testing
- Unit tests for services (auth, OTP, device sessions).
- E2E tests for critical flows (email login, phone+OTP login, refresh, logout, device registration).
- Mock external services (email/SMS/FCM) with contract tests.

## 11) CI/CD and Quality
- Lint + format in CI; add pre-commit hooks (husky + lint-staged).
- Build, run tests, and run migrations in CI pipelines.
- Regular dependency updates and vulnerability scans.

## 12) Documentation
- Keep pattern docs up-to-date (NestModulePattern, SharedModulePattern).
- Document authentication flows and token rotation.
- Maintain API change logs and migration notes.
