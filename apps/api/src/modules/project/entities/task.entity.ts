import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { User } from '../../auth/entities/user.entity';
import { TaskPriority, TaskStatus } from '@wmiw/types';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'board_id' })
  boardId: string;

  @ManyToOne(() => Board, (board) => board.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'board_id' })
  board: Board;

  @Column({ name: 'column_id' })
  columnId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: TaskPriority;

  @Column({
    type: 'enum',
    enum: ['todo', 'in_progress', 'review', 'done'],
    default: 'todo',
  })
  status: TaskStatus;

  @Column({ type: 'float', default: 0 })
  position: number;

  @Column({ type: 'jsonb', default: [] })
  labels: string[];

  @Column({ type: 'jsonb', default: [] })
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;

  @Column({ name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
