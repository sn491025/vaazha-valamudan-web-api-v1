# Security Checklist

Use this as a PR and release checklist.

## Secrets and Config
- [ ] No secrets in code or repo; use environment variables or a secrets manager.
- [ ] Configuration validated at startup; app fails fast on invalid/missing values.
- [ ] Separate envs; production does not read from local files.

## JWT and Public Tokens
- [ ] Strong signing secret/keys; algorithm configured explicitly.
- [ ] Access token short TTL; refresh token longer TTL (mobile > web).
- [ ] Refresh tokens are rotated; previous tokens invalidated.
- [ ] Store only a hash of refresh tokens; compare with bcrypt/argon2 on use.
- [ ] Token payload includes minimal claims; no sensitive data.
- [ ] Add jti (token ID) for revocation lists when needed.
- [ ] Public tokens: short TTL, narrow scope, and strict verification.

## Device Sessions
- [ ] Device sessions upserted on login with deviceId/deviceType/platform and FCM token.
- [ ] Unique or selective indexes (e.g., referenceId + deviceId).
- [ ] Logout invalidates device session and refresh token hash.
- [ ] Track lastLoginAt and lastUsedAt for session hygiene.

## OTP Security
- [ ] Short expiry (e.g., 5 minutes) and max verification attempts enforced.
- [ ] Rate limiting between send requests by purpose and identifier.
- [ ] Consider hashing codes at rest; never log codes in production.
- [ ] Cleanup job removes expired OTPs regularly.

## Transport and Headers
- [ ] HTTPS everywhere; behind a TLS terminator if needed.
- [ ] Secure headers via helmet; content security policy as appropriate.
- [ ] CORS restricted to allowed origins; methods/headers whitelisted.

## Input Validation and Sanitization
- [ ] Global validation pipe (whitelist, transform, forbidNonWhitelisted).
- [ ] Sanitize user-controlled strings to prevent XSS/HTML injection where relevant.

## Authorization and RBAC
- [ ] Guards enforce roles/permissions on protected routes.
- [ ] Least privilege—scopes and roles are minimal and auditable.

## Logging and Monitoring
- [ ] Structured logs; sensitive data redacted (PII, tokens, OTPs).
- [ ] Rate limiter and auth anomalies are logged with context.
- [ ] Health checks and metrics (optional) integrated for monitoring.

## Dependencies and Build
- [ ] Regular dependency updates; vulnerability scans pass.
- [ ] Production images built with multi-stage Docker builds; non-root user where possible.

## Data Protection and Privacy
- [ ] Data retention policy for logs, sessions, and OTPs.
- [ ] PII minimized and handled according to compliance requirements.

Optional Enhancements:
- [ ] Reuse detection for refresh tokens (block on replay).
- [ ] IP allow/deny lists for sensitive endpoints.
- [ ] Brute-force detection and account lockout strategy.
