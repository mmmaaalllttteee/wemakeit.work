import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('analytics_connections')
export class AnalyticsConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @Column()
  provider:
    | 'google_analytics'
    | 'meta_business'
    | 'youtube'
    | 'spotify'
    | 'apple_music'
    | 'tiktok'
    | 'instagram';

  @Column()
  accountName: string;

  @Column({ nullable: true })
  accountId: string;

  @Column({ nullable: true })
  profileId: string; // GA4 property ID, YouTube channel ID, etc.

  @Column({ type: 'text' })
  accessToken: string;

  @Column({ type: 'text', nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  tokenExpiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    scope?: string[];
    propertyName?: string;
    channelName?: string;
    artistName?: string;
    [key: string]: any;
  };

  @Column({ default: 'active' })
  status: 'active' | 'expired' | 'revoked' | 'error';

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'text', nullable: true })
  lastSyncError: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdBy: string;
}
