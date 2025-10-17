import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Organization } from '../../organization/entities/organization.entity';

@Entity('widgets')
export class Widget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column()
  type: 'kpi' | 'note' | 'chart' | 'shortcut';

  @Column()
  title: string;

  @Column({ type: 'jsonb' })
  config: {
    // For KPI widgets
    metric?: string;
    source?: string;
    comparison?: 'day' | 'week' | 'month' | 'year';
    format?: 'number' | 'percentage' | 'currency' | 'duration';
    goal?: number;

    // For Note widgets (Post-its)
    content?: string;
    color?: string;

    // For Chart widgets
    chartType?: 'line' | 'bar' | 'pie' | 'area';
    dataSource?: string;

    // Common
    icon?: string;
    refreshInterval?: number;
  };

  @Column({ type: 'float', default: 0 })
  position: number;

  @Column({ default: 'medium' })
  size: 'small' | 'medium' | 'large' | 'wide';

  @Column({ default: true })
  isVisible: boolean;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
