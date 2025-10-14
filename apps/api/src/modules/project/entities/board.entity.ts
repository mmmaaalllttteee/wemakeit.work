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
import { Project } from './project.entity';
import { User } from '../../auth/entities/user.entity';
import { Task } from './task.entity';
import { BoardVisibility } from '@wmiw/types';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project, (project) => project.boards, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['private', 'team', 'public'],
    default: 'team',
  })
  visibility: BoardVisibility;

  @Column({ type: 'jsonb', default: [] })
  columns: Array<{
    id: string;
    name: string;
    position: number;
    color?: string;
    wipLimit?: number;
  }>;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @Column({ name: 'share_token', nullable: true, unique: true })
  shareToken: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => Task, (task) => task.board)
  tasks: Task[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
