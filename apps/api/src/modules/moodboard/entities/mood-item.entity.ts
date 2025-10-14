import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Moodboard } from './moodboard.entity';
import { User } from '../../auth/entities/user.entity';
import { File } from '../../files/entities/file.entity';

@Entity('mood_items')
export class MoodItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  moodboardId: string;

  @ManyToOne(() => Moodboard, (moodboard) => moodboard.items)
  @JoinColumn({ name: 'moodboardId' })
  moodboard: Moodboard;

  @Column()
  type: 'image' | 'video' | 'audio' | 'file' | 'link' | 'text' | 'shape';

  @Column({ nullable: true })
  fileId: string;

  @ManyToOne(() => File, { nullable: true })
  @JoinColumn({ name: 'fileId' })
  file: File;

  @Column({ nullable: true })
  linkUrl: string;

  @Column({ type: 'text', nullable: true })
  textContent: string;

  @Column({ type: 'float' })
  x: number;

  @Column({ type: 'float' })
  y: number;

  @Column({ type: 'float' })
  width: number;

  @Column({ type: 'float' })
  height: number;

  @Column({ type: 'float', default: 0 })
  rotation: number;

  @Column({ default: 0 })
  zIndex: number;

  @Column({ default: 1.0 })
  opacity: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    // For images/videos
    thumbnailUrl?: string;
    originalUrl?: string;

    // For links
    oEmbed?: {
      title?: string;
      description?: string;
      thumbnailUrl?: string;
      author?: string;
      provider?: string;
    };

    // For text
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;

    // For shapes
    shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow';
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;

    // Common
    locked?: boolean;
    [key: string]: any;
  };

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column({ type: 'jsonb', nullable: true })
  comments: {
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: Date;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  reactions: {
    emoji: string;
    userId: string;
    userName: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
