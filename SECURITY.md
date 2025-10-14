# Security Guidelines - WMIW Platform

## Overview

This document outlines the security measures, best practices, and guidelines implemented in the WMIW Platform.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Data Protection](#data-protection)
3. [API Security](#api-security)
4. [File Upload Security](#file-upload-security)
5. [Audit & Logging](#audit--logging)
6. [Security Headers](#security-headers)
7. [Rate Limiting](#rate-limiting)
8. [Vulnerability Management](#vulnerability-management)
9. [Deployment Security](#deployment-security)
10. [Incident Response](#incident-response)

---

## Authentication & Authorization

### Password Policy

- **Minimum length**: 8 characters
- **Requirements**:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Maximum length**: 128 characters
- **Storage**: Passwords are hashed using bcrypt with salt rounds of 10

### JWT Tokens

- **Access Token Expiry**: 15 minutes
- **Refresh Token Expiry**: 7 days
- **Algorithm**: HS256
- **Storage**:
  - Access tokens: Memory only (never localStorage)
  - Refresh tokens: HttpOnly cookies (recommended)

### Session Management

- **Maximum concurrent sessions**: 5 per user
- **Absolute timeout**: 24 hours
- **Idle timeout**: 2 hours
- **Session invalidation**: On password change, logout, or security breach

### Multi-Factor Authentication (MFA)

- TOTP-based 2FA available for all accounts
- Backup codes generated during MFA setup
- MFA required for admin roles (recommended)

---

## Data Protection

### Encryption

#### At Rest

- Database: PostgreSQL with encryption enabled
- File storage: MinIO with server-side encryption (SSE-S3)
- Sensitive fields: Additional encryption layer for:
  - OAuth tokens
  - API keys
  - Payment information

#### In Transit

- TLS 1.3 for all API communications
- HTTPS only in production
- Secure WebSocket connections (WSS)

### Data Retention

- **Audit logs**: 90 days
- **Activity feed**: 90 days
- **Deleted resources**: 30 days (soft delete)
- **Session data**: 30 days

### Personal Data Handling

- GDPR compliant data processing
- Right to erasure implemented
- Data export functionality available
- Consent tracking for data collection

---

## API Security

### Authentication

All API endpoints require authentication except:

- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/project-info/slug/:slug` (public project pages)
- `/health`

Use `@Public()` decorator for public endpoints.

### Authorization

Role-based access control (RBAC):

- **Owner**: Full access to organization resources
- **Admin**: Manage users, projects, and settings
- **Member**: Create and manage own projects
- **Viewer**: Read-only access

### Input Validation

- All inputs validated using class-validator
- SQL injection prevention via TypeORM parameterized queries
- XSS prevention via input sanitization
- CSRF protection via tokens

### Output Sanitization

- Sensitive data filtered from responses
- Error messages don't expose system internals
- Stack traces disabled in production

---

## File Upload Security

### Restrictions

- **Maximum file size**: 100 MB
- **Maximum files per upload**: 10
- **Allowed MIME types**:
  - Images: JPEG, PNG, GIF, WebP, SVG
  - Documents: PDF, Word, Excel
  - Audio: MP3, WAV, OGG
  - Video: MP4, QuickTime, AVI
  - Archives: ZIP, RAR

### Validation

1. File type validation (MIME type + extension)
2. File size validation
3. Virus scanning (recommended: ClamAV integration)
4. Image processing to strip metadata
5. Filename sanitization

### Storage

- Files stored in MinIO with random UUIDs
- Original filenames never used in storage
- Access controlled via signed URLs
- Automatic expiry for temporary uploads

---

## Audit & Logging

### Audit Logging

All critical actions are logged:

- User authentication (login, logout, failed attempts)
- Resource creation/modification/deletion
- Permission changes
- Data exports
- Contract signatures
- Payment transactions

### Audit Log Contents

- User ID and name
- Organization ID
- Action type
- Resource type and ID
- Timestamp
- IP address
- User agent
- Changes (before/after)
- Status (success/failure)

### Log Storage

- Audit logs stored in PostgreSQL
- Separate table with indexes for fast querying
- Automatic cleanup after retention period
- Export to external SIEM (recommended)

### Activity Tracking

User activities tracked for:

- Recent activity feed
- Project timeline
- User productivity metrics
- Collaboration insights

---

## Security Headers

### Implemented Headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

### CORS Configuration

- Origin whitelist (configure via `CORS_ORIGIN` env var)
- Credentials allowed for authenticated requests
- Preflight requests cached for 24 hours

---

## Rate Limiting

### Global Rate Limit

- **Window**: 15 minutes
- **Max requests**: 1000 per IP
- **Response**: 429 Too Many Requests

### Authentication Endpoints

- **Window**: 15 minutes
- **Max attempts**: 10 per IP
- **Behavior**: Skip counting successful requests
- **Response**: 429 with retry-after header

### API Endpoints

- **Window**: 1 minute
- **Max requests**: 100 per IP
- **Response**: 429 Too Many Requests

### Bypass for Trusted IPs

Configure `RATE_LIMIT_WHITELIST` env var with comma-separated IPs.

---

## Vulnerability Management

### Dependency Scanning

```bash
# Check for vulnerabilities
pnpm audit

# Fix vulnerabilities
pnpm audit --fix
```

Run weekly or before production deployments.

### Security Updates

- Monitor GitHub security advisories
- Subscribe to NestJS security announcements
- Update dependencies monthly (minor versions)
- Update critical security patches immediately

### Penetration Testing

Recommended schedule:

- Annual comprehensive penetration test
- Quarterly automated vulnerability scans
- After major feature releases

---

## Deployment Security

### Environment Variables

Never commit:

- Database credentials
- JWT secrets
- API keys
- OAuth client secrets
- Encryption keys

Use secret management:

- AWS Secrets Manager (recommended)
- HashiCorp Vault
- Docker secrets
- Kubernetes secrets

### Docker Security

```dockerfile
# Use non-root user
USER node

# Minimize attack surface
FROM node:20-alpine

# Security scanning
RUN npm audit --audit-level=high
```

### Database Security

- Strong passwords (20+ characters)
- Network isolation (private subnet)
- Connection pooling limits
- Regular backups (encrypted)
- Point-in-time recovery enabled

### Redis Security

- Password protected
- Network isolation
- Disable dangerous commands (`CONFIG`, `FLUSHALL`)
- TLS enabled for connections

---

## Incident Response

### Detection

Monitor for:

- Multiple failed login attempts
- Unusual API usage patterns
- Large data exports
- Permission escalation attempts
- Suspicious file uploads

### Response Plan

1. **Identify**: Detect and verify security incident
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat and vulnerabilities
4. **Recover**: Restore normal operations
5. **Review**: Post-incident analysis and improvements

### Notification

- Security team alerted immediately
- Users notified within 72 hours (GDPR requirement)
- Law enforcement contacted if required
- Document all actions taken

### Contact

For security issues, contact:

- Email: security@wmiw.com
- PGP Key: [Link to public key]

---

## Security Checklist

### Pre-Production

- [ ] All secrets moved to environment variables
- [ ] TLS/HTTPS enabled
- [ ] Rate limiting configured
- [ ] Security headers enabled
- [ ] Audit logging active
- [ ] Backup strategy implemented
- [ ] Monitoring and alerts configured
- [ ] Dependency vulnerabilities resolved
- [ ] Security scan completed
- [ ] Incident response plan documented

### Production

- [ ] Regular security audits scheduled
- [ ] Backup restoration tested
- [ ] Access logs reviewed weekly
- [ ] Dependencies updated monthly
- [ ] Security patches applied immediately
- [ ] User access reviewed quarterly
- [ ] Penetration test completed annually

---

## Best Practices for Developers

1. **Never log sensitive data** (passwords, tokens, credit cards)
2. **Use parameterized queries** (prevent SQL injection)
3. **Validate all inputs** (never trust user data)
4. **Sanitize outputs** (prevent XSS attacks)
5. **Use prepared statements** (TypeORM handles this)
6. **Implement proper error handling** (don't expose internals)
7. **Keep dependencies updated** (security patches)
8. **Use TypeScript strict mode** (catch errors early)
9. **Write security tests** (authentication, authorization)
10. **Review code for security** (peer review critical features)

---

## Compliance

### GDPR

- Data processing agreements in place
- Privacy policy published
- Cookie consent implemented
- Right to access implemented
- Right to erasure implemented
- Data portability supported

### CCPA

- Do Not Sell My Personal Information
- Disclosure of data collection
- Opt-out mechanisms

### SOC 2

- Access controls implemented
- Audit logging comprehensive
- Encryption at rest and in transit
- Incident response procedures

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [TypeORM Security](https://typeorm.io/#/select-query-builder/using-parameters-to-escape-data)

---

**Last Updated**: 2025-10-12
**Version**: 1.0.0
