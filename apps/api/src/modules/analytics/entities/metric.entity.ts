import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { AnalyticsConnection } from './connection.entity';

@Entity('analytics_metrics')
@Index(['connection_id', 'metricType', 'date'])
@Index(['project_id', 'date'])
export class AnalyticsMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'connection_id' })
  connectionId: string;

  @ManyToOne(() => AnalyticsConnection)
  @JoinColumn({ name: 'connection_id' })
  connection: AnalyticsConnection;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column()
  metricType: string; // e.g., 'pageviews', 'streams', 'followers', 'engagement_rate'

  @Column({ type: 'float' })
  value: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: {
    country?: string;
    city?: string;
    platform?: string;
    source?: string;
    campaign?: string;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    rawData?: any;
    query?: any;
    [key: string]: any;
  };

  @CreateDateColumn()
  createdAt: Date;
}
