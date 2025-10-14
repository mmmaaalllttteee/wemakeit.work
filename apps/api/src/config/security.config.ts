import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

/**
 * Security configuration type
 */
export interface SecurityConfig {
  helmet: ReturnType<typeof helmet>;
  cors: {
    origin: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
  };
  compression: ReturnType<typeof compression>;
  rateLimit: {
    global: ReturnType<typeof rateLimit>;
    auth: ReturnType<typeof rateLimit>;
    api: ReturnType<typeof rateLimit>;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxLength: number;
  };
  jwt: {
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    algorithm: string;
  };
  session: {
    maxSessions: number;
    absoluteTimeout: number;
    idleTimeout: number;
  };
  fileUpload: {
    maxFileSize: number;
    maxFiles: number;
    allowedMimeTypes: string[];
  };
  apiKey: {
    length: number;
    prefix: string;
    expiryDays: number;
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    criticalActions: string[];
  };
  retention: {
    auditLogs: number;
    activities: number;
    deletedResources: number;
    sessions: number;
  };
  headers: Record<string, string>;
}

/**
 * Security configuration for the application
 */
export const securityConfig = (configService: ConfigService): SecurityConfig => ({
  // Helmet configuration for security headers
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),

  // CORS configuration
  cors: {
    origin: configService.get('CORS_ORIGIN', '*').split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
    maxAge: 86400, // 24 hours
  },

  // Compression configuration
  compression: compression({
    level: 6,
    threshold: 1024, // Only compress responses larger than 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
  }),

  // Rate limiting configuration
  rateLimit: {
    global: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // Limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),

    auth: rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Limit each IP to 10 login/register attempts per windowMs
      message: 'Too many authentication attempts, please try again later.',
      skipSuccessfulRequests: true,
    }),

    api: rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 100, // Limit each IP to 100 API requests per minute
      message: 'Too many API requests, please slow down.',
    }),
  },

  // Password policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxLength: 128,
  },

  // JWT configuration
  jwt: {
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    algorithm: 'HS256',
  },

  // Session configuration
  session: {
    maxSessions: 5, // Maximum concurrent sessions per user
    absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours
    idleTimeout: 2 * 60 * 60 * 1000, // 2 hours
  },

  // File upload restrictions
  fileUpload: {
    maxFileSize: 100 * 1024 * 1024, // 100 MB
    maxFiles: 10,
    allowedMimeTypes: [
      // Images
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      // Video
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
    ],
  },

  // API key configuration
  apiKey: {
    length: 32,
    prefix: 'wmiw_',
    expiryDays: 365,
  },

  // Audit configuration
  audit: {
    enabled: true,
    retentionDays: 90,
    criticalActions: [
      'user.deleted',
      'project.deleted',
      'contract.signed',
      'permission.changed',
      'data.exported',
    ],
  },

  // Data retention policies
  retention: {
    auditLogs: 90, // days
    activities: 90, // days
    deletedResources: 30, // days (soft delete)
    sessions: 30, // days
  },

  // Security headers
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  },
});

/**
 * Validate password against policy
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const policy = securityConfig(null as any).password;
  const errors: string[] = [];

  if (password.length < policy.minLength) {
    errors.push(`Password must be at least ${policy.minLength} characters long`);
  }

  if (password.length > policy.maxLength) {
    errors.push(`Password must not exceed ${policy.maxLength} characters`);
  }

  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (policy.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if file type is allowed
 */
export function isFileTypeAllowed(mimeType: string): boolean {
  const config = securityConfig(null as any);
  return config.fileUpload.allowedMimeTypes.includes(mimeType);
}

/**
 * Check if file size is within limits
 */
export function isFileSizeAllowed(size: number): boolean {
  const config = securityConfig(null as any);
  return size <= config.fileUpload.maxFileSize;
}
