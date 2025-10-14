import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AnalyticsConnection } from './connection.entity';

@Entity('analytics_sync_logs')
export class AnalyticsSyncLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  connectionId: string;

  @ManyToOne(() => AnalyticsConnection)
  @JoinColumn({ name: 'connectionId' })
  connection: AnalyticsConnection;

  @Column()
  status: 'started' | 'success' | 'failed' | 'partial';

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int', default: 0 })
  recordsProcessed: number;

  @Column({ type: 'int', default: 0 })
  recordsFailed: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  errorDetails: any;

  @Column({ type: 'int', nullable: true })
  durationMs: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
