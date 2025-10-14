import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['orgId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orgId: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  action: string; // e.g., 'user.login', 'project.created', 'file.uploaded', 'contract.signed'

  @Column()
  resourceType: string; // e.g., 'project', 'file', 'user', 'contract'

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional context about the action

  @Column({ type: 'jsonb', nullable: true })
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: 'success' })
  status: 'success' | 'failure' | 'warning';

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}
