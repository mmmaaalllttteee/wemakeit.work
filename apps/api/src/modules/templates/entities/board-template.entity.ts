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

@Entity('board_templates')
export class BoardTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  category: 'music-release' | 'marketing' | 'event' | 'general' | 'custom';

  @Column({ nullable: true })
  icon: string;

  @Column({ type: 'jsonb' })
  columns: {
    id: string;
    name: string;
    position: number;
    color?: string;
    wipLimit?: number;
  }[];

  @Column({ type: 'jsonb' })
  tasks: {
    title: string;
    description?: string;
    columnId: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    dueOffset?: number; // Days from project start
    labels?: string[];
    checklist?: { text: string; completed: boolean }[];
  }[];

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: false })
  isOfficial: boolean;

  @Column({ nullable: true })
  orgId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @Column({ nullable: true })
  createdBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
