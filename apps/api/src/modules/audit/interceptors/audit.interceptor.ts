import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogMetadata {
  action: string;
  resourceType: string;
  resourceIdPath?: string; // Path to extract resource ID from response (e.g., 'id' or 'data.id')
  captureChanges?: boolean; // Whether to capture before/after changes
}

/**
 * Decorator to enable audit logging on a route
 *
 * @example
 * @AuditLog({ action: 'project.created', resourceType: 'project', resourceIdPath: 'id' })
 * async createProject(@Body() dto: CreateProjectDto) { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_LOG_KEY, metadata, descriptor.value);
    return descriptor;
  };

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const handler = context.getHandler();
    const metadata = this.reflector.get<AuditLogMetadata>(AUDIT_LOG_KEY, handler);

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, ip, headers } = request;

    if (!user) {
      // Skip audit logging if user is not authenticated
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async (response) => {
          try {
            // Extract resource ID from response if path is provided
            let resourceId: string | undefined;
            if (metadata.resourceIdPath && response) {
              resourceId = this.extractValueFromPath(response, metadata.resourceIdPath);
            }

            // Log the action
            await this.auditService.log(user.orgId, user.sub, user.email, {
              action: metadata.action,
              resourceType: metadata.resourceType,
              resourceId,
              metadata: {
                method: request.method,
                url: request.url,
                duration: Date.now() - startTime,
              },
              ipAddress: ip || request.connection?.remoteAddress,
              userAgent: headers['user-agent'],
              status: 'success',
            });
          } catch (error) {
            console.error('Failed to create audit log:', error);
          }
        },
        error: async (error) => {
          try {
            // Log failed action
            await this.auditService.log(user.orgId, user.sub, user.email, {
              action: metadata.action,
              resourceType: metadata.resourceType,
              metadata: {
                method: request.method,
                url: request.url,
                duration: Date.now() - startTime,
              },
              ipAddress: ip || request.connection?.remoteAddress,
              userAgent: headers['user-agent'],
              status: 'failure',
              errorMessage: error.message || 'Unknown error',
            });
          } catch (auditError) {
            console.error('Failed to create audit log:', auditError);
          }
        },
      }),
    );
  }

  private extractValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
