import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let repository: Repository<AuditLog>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOrgId = 'org-123';
  const mockUserId = 'user-456';
  const mockUserName = 'test@example.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    repository = module.get<Repository<AuditLog>>(getRepositoryToken(AuditLog));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('should create and save an audit log entry', async () => {
      const dto = {
        action: 'project.created',
        resourceType: 'project',
        resourceId: 'proj-789',
        metadata: { name: 'Test Project' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0',
      };

      const mockAuditLog = {
        id: 'log-123',
        orgId: mockOrgId,
        userId: mockUserId,
        userName: mockUserName,
        ...dto,
        status: 'success',
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      const result = await service.log(mockOrgId, mockUserId, mockUserName, dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        orgId: mockOrgId,
        userId: mockUserId,
        userName: mockUserName,
        ...dto,
        status: 'success',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockAuditLog);
      expect(result).toEqual(mockAuditLog);
    });

    it('should default status to success if not provided', async () => {
      const dto = {
        action: 'file.uploaded',
        resourceType: 'file',
      };

      const mockAuditLog = {
        id: 'log-124',
        orgId: mockOrgId,
        userId: mockUserId,
        userName: mockUserName,
        ...dto,
        status: 'success',
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockAuditLog);
      mockRepository.save.mockResolvedValue(mockAuditLog);

      await service.log(mockOrgId, mockUserId, mockUserName, dto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'success',
        }),
      );
    });
  });

  describe('queryLogs', () => {
    it('should query logs with pagination', async () => {
      const dto = {
        page: 1,
        pageSize: 10,
      };

      const mockLogs = [
        { id: 'log-1', action: 'project.created' },
        { id: 'log-2', action: 'file.uploaded' },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockLogs, 25]);

      const result = await service.queryLogs(mockOrgId, dto);

      expect(result).toEqual({
        logs: mockLogs,
        total: 25,
        page: 1,
        pageSize: 10,
        totalPages: 3,
      });

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { orgId: mockOrgId },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should filter logs by action', async () => {
      const dto = {
        action: 'project.created',
        page: 1,
        pageSize: 10,
      };

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.queryLogs(mockOrgId, dto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { orgId: mockOrgId, action: 'project.created' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
    });

    it('should filter logs by date range', async () => {
      const dto = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        page: 1,
        pageSize: 10,
      };

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.queryLogs(mockOrgId, dto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            orgId: mockOrgId,
          }),
        }),
      );
    });
  });

  describe('getLog', () => {
    it('should get a specific log by id', async () => {
      const mockLog = {
        id: 'log-123',
        orgId: mockOrgId,
        action: 'project.created',
      };

      mockRepository.findOne.mockResolvedValue(mockLog);

      const result = await service.getLog('log-123', mockOrgId);

      expect(result).toEqual(mockLog);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'log-123', orgId: mockOrgId },
      });
    });

    it('should return null if log not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getLog('nonexistent', mockOrgId);

      expect(result).toBeNull();
    });
  });

  describe('getResourceLogs', () => {
    it('should get logs for a specific resource', async () => {
      const mockLogs = [
        { id: 'log-1', resourceId: 'proj-123' },
        { id: 'log-2', resourceId: 'proj-123' },
      ];

      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await service.getResourceLogs(mockOrgId, 'project', 'proj-123');

      expect(result).toEqual(mockLogs);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { orgId: mockOrgId, resourceType: 'project', resourceId: 'proj-123' },
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('getStats', () => {
    it('should calculate statistics correctly', async () => {
      const mockLogs = [
        {
          action: 'project.created',
          resourceType: 'project',
          userName: 'user1@test.com',
          status: 'success',
        },
        {
          action: 'project.created',
          resourceType: 'project',
          userName: 'user1@test.com',
          status: 'success',
        },
        {
          action: 'file.uploaded',
          resourceType: 'file',
          userName: 'user2@test.com',
          status: 'failure',
        },
      ];

      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await service.getStats(mockOrgId);

      expect(result).toEqual({
        totalActions: 3,
        actionsByType: {
          project: 2,
          file: 1,
        },
        actionsByUser: {
          'user1@test.com': 2,
          'user2@test.com': 1,
        },
        actionsByStatus: {
          success: 2,
          failure: 1,
        },
        topActions: [
          { action: 'project.created', count: 2 },
          { action: 'file.uploaded', count: 1 },
        ],
      });
    });
  });

  describe('exportLogs', () => {
    it('should export logs to CSV format', async () => {
      const mockLogs = [
        {
          createdAt: new Date('2024-01-01T12:00:00Z'),
          userName: 'test@example.com',
          action: 'project.created',
          resourceType: 'project',
          resourceId: 'proj-123',
          status: 'success',
          ipAddress: '127.0.0.1',
        },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockLogs, 1]);

      const result = await service.exportLogs(mockOrgId, {});

      expect(result).toContain('Timestamp,User,Action,Resource Type,Resource ID,Status,IP Address');
      expect(result).toContain('2024-01-01T12:00:00.000Z');
      expect(result).toContain('test@example.com');
      expect(result).toContain('project.created');
    });
  });

  describe('cleanupOldLogs', () => {
    it('should delete logs older than retention period', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 42 }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.cleanupOldLogs(90);

      expect(result).toBe(42);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'createdAt < :cutoffDate',
        expect.objectContaining({ cutoffDate: expect.any(Date) }),
      );
    });
  });
});
