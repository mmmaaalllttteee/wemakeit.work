import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Project } from '../../project/entities/project.entity';
import { User } from '../../auth/entities/user.entity';
import { MoodItem } from './mood-item.entity';

@Entity('moodboards')
export class Moodboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id' })
  projectId: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => MoodItem, (item) => item.moodboard)
  items: MoodItem[];

  @Column({ type: 'jsonb', nullable: true })
  settings: {
    backgroundColor?: string;
    gridEnabled?: boolean;
    gridSize?: number;
    snapToGrid?: boolean;
    zoom?: number;
    viewX?: number;
    viewY?: number;
  };

  @Column({ default: 'private' })
  visibility: 'private' | 'team' | 'public';

  @Column({ nullable: true })
  shareToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
