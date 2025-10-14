import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService } from './activity.service';
import { Activity } from './entities/activity.entity';

describe('ActivityService', () => {
  let service: ActivityService;
  let repository: Repository<Activity>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockOrgId = 'org-123';
  const mockUserId = 'user-456';
  const mockUserName = 'test@example.com';
  const mockUserAvatar = 'https://example.com/avatar.jpg';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    repository = module.get<Repository<Activity>>(getRepositoryToken(Activity));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an activity', async () => {
      const dto = {
        action: 'created',
        resourceType: 'project',
        resourceId: 'proj-789',
        resourceName: 'Test Project',
        projectId: 'proj-789',
        description: 'Created a new project',
        isImportant: true,
      };

      const mockActivity = {
        id: 'activity-123',
        orgId: mockOrgId,
        userId: mockUserId,
        userName: mockUserName,
        userAvatar: mockUserAvatar,
        ...dto,
        createdAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockActivity);
      mockRepository.save.mockResolvedValue(mockActivity);

      const result = await service.create(mockOrgId, mockUserId, mockUserName, mockUserAvatar, dto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        orgId: mockOrgId,
        userId: mockUserId,
        userName: mockUserName,
        userAvatar: mockUserAvatar,
        ...dto,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockActivity);
      expect(result).toEqual(mockActivity);
    });
  });

  describe('query', () => {
    it('should query activities with pagination', async () => {
      const dto = {
        page: 1,
        pageSize: 20,
      };

      const mockActivities = [
        { id: 'act-1', action: 'created' },
        { id: 'act-2', action: 'updated' },
      ];

      mockRepository.findAndCount.mockResolvedValue([mockActivities, 50]);

      const result = await service.query(mockOrgId, dto);

      expect(result).toEqual({
        activities: mockActivities,
        total: 50,
        page: 1,
        pageSize: 20,
        totalPages: 3,
      });
    });

    it('should filter activities by resource type', async () => {
      const dto = {
        resourceType: 'project',
        page: 1,
        pageSize: 20,
      };

      mockRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.query(mockOrgId, dto);

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        where: { orgId: mockOrgId, resourceType: 'project' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
    });
  });

  describe('getRecent', () => {
    it('should get recent activities', async () => {
      const mockActivities = [
        { id: 'act-1', createdAt: new Date() },
        { id: 'act-2', createdAt: new Date() },
      ];

      mockRepository.find.mockResolvedValue(mockActivities);

      const result = await service.getRecent(mockOrgId, 10);

      expect(result).toEqual(mockActivities);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { orgId: mockOrgId },
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });
  });

  describe('getProjectActivities', () => {
    it('should get activities for a specific project', async () => {
      const projectId = 'proj-123';
      const mockActivities = [
        { id: 'act-1', projectId },
        { id: 'act-2', projectId },
      ];

      mockRepository.find.mockResolvedValue(mockActivities);

      const result = await service.getProjectActivities(mockOrgId, projectId);

      expect(result).toEqual(mockActivities);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { orgId: mockOrgId, projectId },
        order: { createdAt: 'DESC' },
        take: 100,
      });
    });
  });

  describe('getImportantActivities', () => {
    it('should get only important activities', async () => {
      const mockActivities = [
        { id: 'act-1', isImportant: true },
        { id: 'act-2', isImportant: true },
      ];

      mockRepository.find.mockResolvedValue(mockActivities);

      const result = await service.getImportantActivities(mockOrgId);

      expect(result).toEqual(mockActivities);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { orgId: mockOrgId, isImportant: true },
        order: { createdAt: 'DESC' },
        take: 50,
      });
    });
  });

  describe('getStats', () => {
    it('should calculate activity statistics', async () => {
      const mockActivities = [
        {
          action: 'created',
          resourceType: 'project',
          userName: 'user1@test.com',
        },
        {
          action: 'created',
          resourceType: 'project',
          userName: 'user1@test.com',
        },
        {
          action: 'updated',
          resourceType: 'file',
          userName: 'user2@test.com',
        },
      ];

      mockRepository.find.mockResolvedValue(mockActivities);

      const result = await service.getStats(mockOrgId);

      expect(result).toEqual({
        totalActivities: 3,
        activitiesByAction: {
          created: 2,
          updated: 1,
        },
        activitiesByResourceType: {
          project: 2,
          file: 1,
        },
        activitiesByUser: {
          'user1@test.com': 2,
          'user2@test.com': 1,
        },
        topUsers: [
          { userName: 'user1@test.com', count: 2 },
          { userName: 'user2@test.com', count: 1 },
        ],
      });
    });
  });

  describe('getTimeline', () => {
    it('should group activities by date', async () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      const mockActivities = [
        { id: 'act-1', createdAt: date1 },
        { id: 'act-2', createdAt: date1 },
        { id: 'act-3', createdAt: date2 },
      ];

      mockRepository.find.mockResolvedValue(mockActivities);

      const result = await service.getTimeline(mockOrgId, 7);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-01-01');
      expect(result[0].count).toBe(2);
      expect(result[1].date).toBe('2024-01-02');
      expect(result[1].count).toBe(1);
    });
  });

  describe('cleanupOldActivities', () => {
    it('should delete activities older than retention period', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 100 }),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.cleanupOldActivities(30);

      expect(result).toBe(100);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
    });
  });
});
