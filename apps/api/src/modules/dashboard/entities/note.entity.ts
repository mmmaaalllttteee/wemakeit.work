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

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  orgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'orgId' })
  organization: Organization;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 'yellow' })
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple' | 'orange';

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'float', default: 0 })
  position: number;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ nullable: true })
  projectId: string;

  @Column({ default: 'organization' })
  scope: 'personal' | 'organization' | 'project';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
