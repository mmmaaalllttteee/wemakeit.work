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

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column()
  email: string;

  @Column()
  role: 'admin' | 'member' | 'viewer';

  @Column({ unique: true })
  token: string;

  @Column({ default: 'pending' })
  status: 'pending' | 'accepted' | 'expired' | 'revoked';

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'project_id', nullable: true })
  projectId: string; // Optional: invite to specific project

  @Column({ type: 'jsonb', nullable: true })
  permissions: {
    projects?: string[]; // IDs of projects user has access to
    canCreateProjects?: boolean;
    canInviteUsers?: boolean;
    canManageBilling?: boolean;
    customPermissions?: Record<string, boolean>;
  };

  @Column({ type: 'text', nullable: true })
  message: string; // Personal message from inviter

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'invited_by' })
  invitedBy: string; // User ID of inviter

  @Column({ name: 'accepted_by', nullable: true })
  acceptedBy: string; // User ID who accepted

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date;
}
