import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Project } from './project.entity';

@Entity('project_info_pages')
export class ProjectInfoPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', unique: true })
  @Index()
  projectId: string;

  @OneToOne(() => Project)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @Column({ unique: true })
  @Index()
  slug: string; // Custom URL slug (e.g., 'artist-album-2024')

  @Column({ default: true })
  isPublic: boolean;

  @Column({ type: 'text', nullable: true })
  title: string; // Custom title (defaults to project name)

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  coverImage: string; // URL to cover image

  @Column({ type: 'jsonb', default: [] })
  sections: Array<{
    id: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'gallery' | 'links' | 'credits';
    title?: string;
    content?: any;
    order: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    artist?: string;
    releaseDate?: string;
    genre?: string[];
    label?: string;
    credits?: Array<{
      name: string;
      role: string;
    }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  socialLinks: {
    spotify?: string;
    appleMusic?: string;
    youtube?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  theme: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
  };

  @Column({ default: false })
  passwordProtected: boolean;

  @Column({ nullable: true })
  password: string; // Hashed password

  @Column({ type: 'jsonb', nullable: true })
  analytics: {
    views: number;
    uniqueVisitors: number;
    lastViewed?: Date;
  };

  @Column({ default: true })
  allowComments: boolean;

  @Column({ default: false })
  showAnalytics: boolean; // Show analytics to public

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;
}
