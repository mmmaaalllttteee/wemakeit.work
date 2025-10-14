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

@Entity('shares')
export class Share {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  token: string;

  @Column()
  orgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @Column()
  resourceType: 'project' | 'board' | 'moodboard' | 'file' | 'folder';

  @Column()
  resourceId: string;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ type: 'jsonb' })
  permissions: {
    canView: boolean;
    canComment: boolean;
    canEdit: boolean;
    canUpload: boolean;
    canDownload: boolean;
    canReshare: boolean;
  };

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  allowedEmails: string[];

  @Column({ type: 'jsonb', nullable: true })
  allowedDomains: string[];

  @Column({ default: 0 })
  accessCount: number;

  @Column({ nullable: true })
  lastAccessedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  accessLog: {
    timestamp: Date;
    ip?: string;
    userAgent?: string;
    email?: string;
  }[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customization: {
    title?: string;
    message?: string;
    logo?: string;
    brandColor?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
