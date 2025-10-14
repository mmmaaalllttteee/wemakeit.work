import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { UserRole, UserStatus } from '@wmiw/types';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({
    type: 'enum',
    enum: ['owner', 'admin', 'editor', 'collaborator', 'viewer'],
    default: 'editor',
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'invited', 'suspended'],
    default: 'active',
  })
  status: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
    themeMode?: 'light' | 'dark' | 'auto';
    timezone?: string;
    locale?: string;
    emailNotifications?: boolean;
    desktopNotifications?: boolean;
  };

  @Column({ name: 'twofa_enabled', default: false })
  twofaEnabled: boolean;

  @Column({ name: 'twofa_secret', nullable: true })
  twofaSecret: string;

  @Column({ name: 'reset_token', nullable: true })
  resetToken: string;

  @Column({ name: 'reset_token_expires', nullable: true })
  resetTokenExpires: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
