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
@Index(['connectionId', 'metricType', 'date'])
@Index(['projectId', 'date'])
export class AnalyticsMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  connectionId: string;

  @ManyToOne(() => AnalyticsConnection)
  @JoinColumn({ name: 'connectionId' })
  connection: AnalyticsConnection;

  @Column({ nullable: true })
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
