import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { User } from '../../auth/entities/user.entity';
import { Board } from './board.entity';
import { ProjectStatus } from '@wmiw/types';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['active', 'archived', 'completed'],
    default: 'active',
  })
  status: ProjectStatus;

  @Column({ name: 'cover_image', nullable: true })
  coverImage: string;

  @Column({ name: 'owner_id' })
  ownerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @OneToMany(() => Board, (board) => board.project)
  boards: Board[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
