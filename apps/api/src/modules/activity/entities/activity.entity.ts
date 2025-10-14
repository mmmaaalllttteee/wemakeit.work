import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('activities')
@Index(['orgId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['projectId', 'createdAt'])
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orgId: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column({ nullable: true })
  userAvatar: string;

  @Column()
  action: string; // e.g., 'created', 'updated', 'deleted', 'commented', 'shared', 'uploaded'

  @Column()
  resourceType: string; // e.g., 'project', 'file', 'moodboard', 'contract', 'comment'

  @Column({ nullable: true })
  resourceId: string;

  @Column({ type: 'text', nullable: true })
  resourceName: string;

  @Column({ nullable: true })
  projectId: string; // Associated project

  @Column({ type: 'text', nullable: true })
  description: string; // Human-readable activity description

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional data about the activity

  @Column({ default: false })
  isImportant: boolean; // Flag for important activities (milestones, signatures, etc.)

  @CreateDateColumn()
  createdAt: Date;
}
