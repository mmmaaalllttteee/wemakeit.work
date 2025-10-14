import { ConfigService } from '@nestjs/config';

/**
 * Performance and monitoring configuration
 */
export const performanceConfig = (configService: ConfigService) => ({
  // Database connection pool
  database: {
    poolSize: parseInt(configService.get('DB_POOL_SIZE', '10')),
    connectionTimeout: 5000,
    idleTimeout: 30000,
    maxQueryExecutionTime: 10000, // Log slow queries > 10s
  },

  // Redis connection pool
  redis: {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
    keepAlive: 30000,
    connectTimeout: 10000,
  },

  // Cache configuration
  cache: {
    ttl: 300, // 5 minutes default TTL
    max: 1000, // Maximum items in cache
    strategies: {
      // User data cache
      user: {
        ttl: 900, // 15 minutes
        max: 500,
      },
      // Project data cache
      project: {
        ttl: 300, // 5 minutes
        max: 1000,
      },
      // File metadata cache
      file: {
        ttl: 600, // 10 minutes
        max: 2000,
      },
      // Analytics cache
      analytics: {
        ttl: 1800, // 30 minutes
        max: 500,
      },
    },
  },

  // Query optimization
  query: {
    // Pagination limits
    maxPageSize: 100,
    defaultPageSize: 20,

    // Relation loading strategy
    eagerLoadingThreshold: 10, // Use join for < 10 items, separate query for more

    // Query timeout
    timeout: 30000, // 30 seconds

    // Indexing recommendations
    indexes: [
      // Users
      { table: 'users', columns: ['email'], unique: true },
      { table: 'users', columns: ['orgId', 'createdAt'] },

      // Projects
      { table: 'projects', columns: ['orgId', 'status'] },
      { table: 'projects', columns: ['createdBy', 'createdAt'] },

      // Files
      { table: 'files', columns: ['projectId', 'type'] },
      { table: 'files', columns: ['uploadedBy', 'uploadedAt'] },

      // Audit logs
      { table: 'audit_logs', columns: ['orgId', 'createdAt'] },
      { table: 'audit_logs', columns: ['userId', 'action'] },
      { table: 'audit_logs', columns: ['resourceType', 'resourceId'] },

      // Activities
      { table: 'activities', columns: ['orgId', 'createdAt'] },
      { table: 'activities', columns: ['projectId', 'createdAt'] },
      { table: 'activities', columns: ['userId', 'createdAt'] },
    ],
  },

  // API response optimization
  api: {
    // Compression
    compressionThreshold: 1024, // 1KB
    compressionLevel: 6,

    // Pagination
    maxPageSize: 100,
    defaultPageSize: 20,

    // Response caching
    cacheControl: {
      public: 'public, max-age=300', // 5 minutes for public data
      private: 'private, max-age=60', // 1 minute for user data
      noCache: 'no-cache, no-store, must-revalidate',
    },
  },

  // WebSocket optimization
  websocket: {
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 10000,
    maxPayload: 1048576, // 1MB
    compression: true,
  },

  // File upload optimization
  fileUpload: {
    // Multipart streaming
    streamingThreshold: 10485760, // 10MB - stream files larger than this

    // Chunk size for uploads
    chunkSize: 5242880, // 5MB

    // Concurrent uploads
    maxConcurrentUploads: 3,

    // Thumbnail generation
    thumbnail: {
      enabled: true,
      sizes: [
        { width: 150, height: 150, name: 'thumb' },
        { width: 300, height: 300, name: 'small' },
        { width: 800, height: 600, name: 'medium' },
      ],
      quality: 80,
      format: 'webp',
    },
  },

  // Background job optimization
  jobs: {
    // Queue priorities
    priorities: {
      critical: 10,
      high: 5,
      normal: 0,
      low: -5,
    },

    // Concurrency
    concurrency: {
      email: 5,
      fileProcessing: 3,
      analytics: 2,
      notifications: 10,
    },

    // Retry strategy
    retry: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },

    // Job timeouts
    timeout: {
      email: 30000, // 30 seconds
      fileProcessing: 300000, // 5 minutes
      analytics: 60000, // 1 minute
      notifications: 10000, // 10 seconds
    },
  },

  // Metrics collection
  metrics: {
    enabled: true,
    collectInterval: 10000, // 10 seconds

    // What to collect
    collect: {
      cpu: true,
      memory: true,
      eventLoop: true,
      gc: true,
      http: true,
      database: true,
      cache: true,
    },

    // Thresholds for alerts
    thresholds: {
      cpuUsage: 80, // %
      memoryUsage: 85, // %
      eventLoopDelay: 100, // ms
      responseTime: 1000, // ms
      errorRate: 5, // %
    },
  },

  // Monitoring and alerts
  monitoring: {
    // Health check endpoint
    healthCheck: {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      checks: ['database', 'redis', 'minio', 'memory', 'disk'],
    },

    // APM (Application Performance Monitoring)
    apm: {
      enabled: configService.get('APM_ENABLED', 'false') === 'true',
      serviceName: 'wmiw-api',
      environment: configService.get('NODE_ENV', 'development'),

      // Sampling
      transactionSampleRate: 0.1, // 10% of transactions

      // Trace collection
      captureBody: 'errors', // Only capture body on errors
      captureHeaders: true,
    },

    // Logging
    logging: {
      level: configService.get('LOG_LEVEL', 'info'),
      pretty: configService.get('NODE_ENV') === 'development',

      // Structured logging
      format: 'json',

      // Log rotation
      rotation: {
        enabled: true,
        maxFiles: 10,
        maxSize: '20m',
      },
    },
  },

  // Memory optimization
  memory: {
    // Garbage collection hints
    gc: {
      enabled: true,
      threshold: 0.8, // Trigger GC at 80% memory usage
    },

    // Memory limits
    limits: {
      heapUsed: 512 * 1024 * 1024, // 512MB
      rss: 1024 * 1024 * 1024, // 1GB
    },

    // Leak detection
    leakDetection: {
      enabled: configService.get('NODE_ENV') === 'development',
      threshold: 100 * 1024 * 1024, // 100MB growth
      interval: 60000, // Check every minute
    },
  },
});

/**
 * Performance best practices
 */
export const performanceBestPractices = {
  // Database queries
  database: [
    'Use indexes on frequently queried columns',
    'Avoid N+1 queries - use eager loading or DataLoader',
    'Use pagination for large result sets',
    'Cache frequently accessed data',
    'Use connection pooling',
    'Monitor slow queries and optimize',
  ],

  // API endpoints
  api: [
    'Implement response caching with appropriate TTL',
    'Use compression for responses > 1KB',
    'Implement pagination for list endpoints',
    'Use ETags for conditional requests',
    'Minimize payload size - only return needed fields',
    'Use HTTP/2 for better performance',
  ],

  // Caching
  caching: [
    'Cache user sessions',
    'Cache static configuration',
    'Cache database query results',
    'Implement cache warming for critical data',
    'Use cache invalidation strategies',
    'Monitor cache hit rates',
  ],

  // WebSockets
  websocket: [
    'Use room-based broadcasting',
    'Implement reconnection logic',
    'Compress large messages',
    'Throttle high-frequency events',
    'Clean up disconnected clients',
    'Monitor active connections',
  ],

  // Background jobs
  jobs: [
    'Use appropriate queue priorities',
    'Implement job timeouts',
    'Use exponential backoff for retries',
    'Monitor job completion rates',
    'Process jobs in batches when possible',
    'Clean up completed jobs regularly',
  ],
};

/**
 * Performance monitoring helper
 */
export class PerformanceMonitor {
  private static startTime: number;

  static start(): void {
    this.startTime = Date.now();
  }

  static end(operation: string): number {
    const duration = Date.now() - this.startTime;

    if (duration > 1000) {
      console.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    }

    return duration;
  }

  static async measure<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;

    if (duration > 1000) {
      console.warn(`Slow operation: ${operation} took ${duration}ms`);
    }

    return { result, duration };
  }
}
