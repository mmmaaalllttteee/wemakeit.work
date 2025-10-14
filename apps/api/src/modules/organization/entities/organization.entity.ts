import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { BillingPlan } from '@wmiw/types';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    name: 'billing_plan',
    type: 'enum',
    enum: ['free', 'pro', 'business', 'enterprise'],
    default: 'free',
  })
  billingPlan: BillingPlan;

  @Column({ name: 'seats_max', default: 1 })
  seatsMax: number;

  @Column({ name: 'seats_used', default: 1 })
  seatsUsed: number;

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    logo?: string;
    accentColor?: string;
    domains?: string[];
    features?: string[];
  };

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
