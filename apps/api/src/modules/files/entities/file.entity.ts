import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../auth/entities/user.entity';
import { Project } from '../../project/entities/project.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @ManyToOne(() => Project, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  name: string;

  @Column()
  path: string;

  @Column()
  size: number;

  @Column()
  mimeType: string;

  @Column({ nullable: true })
  checksum: string;

  @Column({ default: 1 })
  version: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId: string;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parentFile: File;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  shared: {
    isPublic: boolean;
    token?: string;
    password?: string;
    expiresAt?: Date;
    allowedEmails?: string[];
  };

  @Column({ nullable: true })
  folderId: string;

  @Column({ default: false })
  isFolder: boolean;

  @Column({ nullable: true })
  folderPath: string;

  @Column({ default: 'active' })
  status: 'active' | 'archived' | 'deleted';

  @Column({ nullable: true })
  virusScanStatus: 'pending' | 'clean' | 'infected' | 'error';

  @Column({ nullable: true })
  virusScanDate: Date;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column({ default: 0 })
  downloadCount: number;

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
