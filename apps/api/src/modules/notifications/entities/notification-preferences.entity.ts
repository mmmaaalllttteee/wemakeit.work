import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  userId: string;

  @Column()
  orgId: string;

  // Email notifications
  @Column({ default: true })
  emailEnabled: boolean;

  @Column({ type: 'jsonb', default: {} })
  emailPreferences: {
    projectUpdates?: boolean;
    fileComments?: boolean;
    mentions?: boolean;
    taskAssignments?: boolean;
    contractSignatures?: boolean;
    teamInvitations?: boolean;
    analyticsReports?: boolean;
    systemAnnouncements?: boolean;
  };

  // Push notifications
  @Column({ default: true })
  pushEnabled: boolean;

  @Column({ type: 'jsonb', default: {} })
  pushPreferences: {
    projectUpdates?: boolean;
    fileComments?: boolean;
    mentions?: boolean;
    taskAssignments?: boolean;
    contractSignatures?: boolean;
    teamInvitations?: boolean;
    realtimeCollaboration?: boolean;
  };

  // In-app notifications
  @Column({ default: true })
  inAppEnabled: boolean;

  @Column({ type: 'jsonb', default: {} })
  inAppPreferences: {
    projectUpdates?: boolean;
    fileComments?: boolean;
    mentions?: boolean;
    taskAssignments?: boolean;
    contractSignatures?: boolean;
    teamInvitations?: boolean;
    realtimeCollaboration?: boolean;
    systemAnnouncements?: boolean;
  };

  // Digest settings
  @Column({ default: false })
  dailyDigest: boolean;

  @Column({ default: false })
  weeklyDigest: boolean;

  @Column({ nullable: true })
  digestTime: string; // HH:MM format (e.g., '09:00')

  // Do Not Disturb
  @Column({ default: false })
  doNotDisturb: boolean;

  @Column({ nullable: true })
  doNotDisturbStart: string; // HH:MM format

  @Column({ nullable: true })
  doNotDisturbEnd: string; // HH:MM format

  @Column({ type: 'simple-array', nullable: true })
  mutedProjects: string[]; // Array of project IDs

  @Column({ type: 'simple-array', nullable: true })
  mutedUsers: string[]; // Array of user IDs

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
