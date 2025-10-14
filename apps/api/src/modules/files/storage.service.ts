import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StorageService {
  private s3: AWS.S3;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      accessKeyId: this.configService.get<string>('S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('S3_SECRET_KEY'),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
      region: this.configService.get<string>('S3_REGION') || 'us-east-1',
    });

    this.bucket = this.configService.get<string>('S3_BUCKET') || 'wmiw-files';
  }

  /**
   * Generate presigned URL for upload
   */
  async generatePresignedUploadUrl(
    fileName: string,
    fileType: string,
    orgId: string,
    projectId?: string,
  ): Promise<{ uploadUrl: string; path: string; fileId: string }> {
    const fileId = uuidv4();
    const ext = fileName.split('.').pop();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Generate S3 path: org/[project]/files/fileId-filename.ext
    let path = `${orgId}`;
    if (projectId) {
      path += `/${projectId}`;
    }
    path += `/files/${fileId}-${sanitizedName}`;

    const params = {
      Bucket: this.bucket,
      Key: path,
      Expires: 900, // 15 minutes
      ContentType: fileType,
      Metadata: {
        'original-name': fileName,
        'file-id': fileId,
      },
    };

    const uploadUrl = await this.s3.getSignedUrlPromise('putObject', params);

    return {
      uploadUrl,
      path,
      fileId,
    };
  }

  /**
   * Generate presigned URL for download
   */
  async generatePresignedDownloadUrl(path: string, expiresIn = 3600): Promise<string> {
    const params = {
      Bucket: this.bucket,
      Key: path,
      Expires: expiresIn,
    };

    return await this.s3.getSignedUrlPromise('getObject', params);
  }

  /**
   * Delete file from S3
   */
  async deleteFile(path: string): Promise<void> {
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: path,
      })
      .promise();
  }

  /**
   * Copy file in S3 (for versioning)
   */
  async copyFile(sourcePath: string, destinationPath: string): Promise<void> {
    await this.s3
      .copyObject({
        Bucket: this.bucket,
        CopySource: `${this.bucket}/${sourcePath}`,
        Key: destinationPath,
      })
      .promise();
  }

  /**
   * Get file metadata from S3
   */
  async getFileMetadata(path: string): Promise<AWS.S3.HeadObjectOutput> {
    return await this.s3
      .headObject({
        Bucket: this.bucket,
        Key: path,
      })
      .promise();
  }

  /**
   * Check if bucket exists, create if not
   */
  async ensureBucketExists(): Promise<void> {
    try {
      await this.s3.headBucket({ Bucket: this.bucket }).promise();
    } catch (error: any) {
      if (error.code === 'NotFound') {
        await this.s3
          .createBucket({
            Bucket: this.bucket,
          })
          .promise();
        console.log(`✅ Created S3 bucket: ${this.bucket}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Generate thumbnail path
   */
  getThumbnailPath(originalPath: string): string {
    const parts = originalPath.split('/');
    const fileName = parts.pop();
    return [...parts, 'thumbnails', fileName].join('/');
  }

  /**
   * Get file stream (for previews/downloads)
   */
  getFileStream(path: string): AWS.S3.GetObjectRequest {
    return {
      Bucket: this.bucket,
      Key: path,
    };
  }
}
