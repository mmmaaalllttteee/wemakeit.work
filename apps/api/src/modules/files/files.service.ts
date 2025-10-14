import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { File } from './entities/file.entity';
import { StorageService } from './storage.service';
import {
  CreateFileDto,
  CreateFolderDto,
  UpdateFileDto,
  PresignedUploadDto,
  CompleteUploadDto,
  MoveFilesDto,
  ShareFileDto,
  FileQueryDto,
} from './dto/file.dto';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private storageService: StorageService,
  ) {}

  /**
   * Initialize upload - generate presigned URL
   */
  async initializeUpload(
    dto: PresignedUploadDto,
    userId: string,
    orgId: string,
  ): Promise<{ uploadUrl: string; fileId: string; path: string }> {
    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (dto.fileSize > maxSize) {
      throw new BadRequestException('File size exceeds maximum allowed (500MB)');
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'audio/mpeg',
      'audio/wav',
      'audio/mp3',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/html',
      'application/zip',
    ];

    if (!allowedTypes.includes(dto.fileType)) {
      throw new BadRequestException('File type not allowed');
    }

    // Generate presigned URL
    const { uploadUrl, path, fileId } = await this.storageService.generatePresignedUploadUrl(
      dto.fileName,
      dto.fileType,
      orgId,
      dto.projectId,
    );

    // Create file record (pending status)
    const file = this.fileRepository.create({
      id: fileId,
      name: dto.fileName,
      path,
      size: dto.fileSize,
      mimeType: dto.fileType,
      orgId,
      projectId: dto.projectId,
      folderId: dto.folderId,
      uploadedBy: userId,
      status: 'active',
      virusScanStatus: 'pending',
    });

    await this.fileRepository.save(file);

    return { uploadUrl, fileId, path };
  }

  /**
   * Complete upload - verify file exists in S3
   */
  async completeUpload(dto: CompleteUploadDto, userId: string, orgId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id: dto.fileId, orgId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    if (file.uploadedBy !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // Verify file exists in S3
    try {
      const metadata = await this.storageService.getFileMetadata(dto.path);
      file.size = metadata.ContentLength || file.size;
    } catch (error) {
      throw new BadRequestException('Upload verification failed');
    }

    // Update checksum if provided
    if (dto.checksum) {
      file.checksum = dto.checksum;
    }

    file.virusScanStatus = 'clean'; // In production, integrate with ClamAV or similar

    await this.fileRepository.save(file);

    return file;
  }

  /**
   * Create folder
   */
  async createFolder(dto: CreateFolderDto, userId: string, orgId: string): Promise<File> {
    const folder = this.fileRepository.create({
      name: dto.name,
      isFolder: true,
      orgId,
      projectId: dto.projectId,
      folderId: dto.parentId,
      uploadedBy: userId,
      path: '', // Folders don't have S3 paths
      size: 0,
      mimeType: 'folder',
      status: 'active',
    });

    // Build folder path
    if (dto.parentId) {
      const parent = await this.fileRepository.findOne({ where: { id: dto.parentId } });
      if (parent && parent.folderPath) {
        folder.folderPath = `${parent.folderPath}/${dto.name}`;
      } else {
        folder.folderPath = dto.name;
      }
    } else {
      folder.folderPath = dto.name;
    }

    return await this.fileRepository.save(folder);
  }

  /**
   * Get files and folders
   */
  async getFiles(query: FileQueryDto, orgId: string): Promise<File[]> {
    const where: any = { orgId, status: query.status || 'active' };

    if (query.projectId) {
      where.projectId = query.projectId;
    }

    if (query.folderId !== undefined) {
      where.folderId = query.folderId || null;
    }

    if (query.tags && query.tags.length > 0) {
      // JSONB contains query - this is PostgreSQL specific
      // For TypeORM, we need to use raw query or QueryBuilder
    }

    const queryBuilder = this.fileRepository
      .createQueryBuilder('file')
      .where(where)
      .leftJoinAndSelect('file.uploader', 'uploader');

    if (query.search) {
      queryBuilder.andWhere('file.name ILIKE :search', { search: `%${query.search}%` });
    }

    queryBuilder.orderBy(`file.${query.sortBy || 'createdAt'}`, query.sortOrder || 'DESC');

    return await queryBuilder.getMany();
  }

  /**
   * Get single file
   */
  async getFile(id: string, orgId: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { id, orgId },
      relations: ['uploader', 'project'],
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  /**
   * Update file metadata
   */
  async updateFile(id: string, dto: UpdateFileDto, userId: string, orgId: string): Promise<File> {
    const file = await this.getFile(id, orgId);

    // Check permissions (owner or admin)
    if (file.uploadedBy !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (dto.name) {file.name = dto.name;}
    if (dto.tags) {file.tags = dto.tags;}
    if (dto.folderId !== undefined) {file.folderId = dto.folderId;}
    if (dto.metadata) {file.metadata = { ...file.metadata, ...dto.metadata };}

    return await this.fileRepository.save(file);
  }

  /**
   * Delete file
   */
  async deleteFile(id: string, userId: string, orgId: string): Promise<void> {
    const file = await this.getFile(id, orgId);

    if (file.uploadedBy !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (file.isFolder) {
      // Delete all files in folder
      const childFiles = await this.fileRepository.find({
        where: { folderId: id, orgId },
      });

      for (const child of childFiles) {
        await this.deleteFile(child.id, userId, orgId);
      }
    } else {
      // Delete from S3
      try {
        await this.storageService.deleteFile(file.path);
        if (file.thumbnailPath) {
          await this.storageService.deleteFile(file.thumbnailPath);
        }
      } catch (error) {
        console.error('Failed to delete from S3:', error);
      }
    }

    // Soft delete
    file.status = 'deleted';
    await this.fileRepository.save(file);
  }

  /**
   * Move files to folder
   */
  async moveFiles(dto: MoveFilesDto, userId: string, orgId: string): Promise<void> {
    const files = await this.fileRepository.find({
      where: { id: In(dto.fileIds), orgId },
    });

    for (const file of files) {
      if (file.uploadedBy !== userId) {
        continue; // Skip unauthorized files
      }

      file.folderId = dto.targetFolderId || null;
      await this.fileRepository.save(file);
    }
  }

  /**
   * Share file
   */
  async shareFile(id: string, dto: ShareFileDto, userId: string, orgId: string): Promise<File> {
    const file = await this.getFile(id, orgId);

    if (file.uploadedBy !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const shareToken = dto.isPublic ? uuidv4() : null;
    const hashedPassword = dto.password
      ? crypto.createHash('sha256').update(dto.password).digest('hex')
      : null;

    file.shared = {
      isPublic: dto.isPublic,
      token: shareToken,
      password: hashedPassword,
      expiresAt: dto.expiresAt,
      allowedEmails: dto.allowedEmails,
    };

    return await this.fileRepository.save(file);
  }

  /**
   * Get download URL
   */
  async getDownloadUrl(id: string, orgId: string, userId?: string): Promise<string> {
    const file = await this.getFile(id, orgId);

    if (file.isFolder) {
      throw new BadRequestException('Cannot download folder');
    }

    // Update access tracking
    file.downloadCount += 1;
    file.lastAccessedAt = new Date();
    await this.fileRepository.save(file);

    return await this.storageService.generatePresignedDownloadUrl(file.path);
  }

  /**
   * Get file by share token (public access)
   */
  async getFileByShareToken(token: string, password?: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { shared: { token } as any },
      relations: ['uploader'],
    });

    if (!file || !file.shared?.isPublic) {
      throw new NotFoundException('Shared file not found');
    }

    // Check expiry
    if (file.shared.expiresAt && new Date(file.shared.expiresAt) < new Date()) {
      throw new ForbiddenException('Share link has expired');
    }

    // Check password
    if (file.shared.password && password) {
      const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
      if (hashedPassword !== file.shared.password) {
        throw new ForbiddenException('Invalid password');
      }
    }

    return file;
  }
}
