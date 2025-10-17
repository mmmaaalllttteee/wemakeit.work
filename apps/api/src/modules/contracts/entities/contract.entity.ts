import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { ContractTemplate } from './contract-template.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id' })
  orgId: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column({ name: 'template_id', nullable: true })
  templateId: string;

  @ManyToOne(() => ContractTemplate, (template) => template.contracts, { nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: ContractTemplate;

  @Column({ name: 'project_id', nullable: true })
  projectId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string; // Final rendered HTML content

  @Column({ type: 'jsonb' })
  variables: Record<string, any>; // Variable values used in this contract

  @Column({ default: 'draft' })
  status:
    | 'draft'
    | 'pending_review'
    | 'pending_signatures'
    | 'signed'
    | 'active'
    | 'expired'
    | 'terminated';

  @Column({ type: 'jsonb', default: [] })
  parties: Array<{
    id: string;
    name: string;
    email: string;
    role: string; // e.g., 'artist', 'label', 'manager', 'producer'
    signedAt?: Date;
    signatureData?: string; // Base64 signature image or signature token
    ipAddress?: string;
    userAgent?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  signatures: Array<{
    partyId: string;
    signedAt: Date;
    signatureData: string;
    ipAddress: string;
    method: 'drawn' | 'typed' | 'uploaded' | 'electronic';
    verified: boolean;
  }>;

  @Column({ nullable: true })
  pdfUrl: string; // S3 URL for generated PDF

  @Column({ nullable: true })
  signedPdfUrl: string; // S3 URL for signed PDF

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    tags?: string[];
    dealValue?: number;
    currency?: string;
    territory?: string;
    duration?: string;
    customFields?: Record<string, any>;
    [key: string]: any;
  };

  @Column({ type: 'jsonb', nullable: true })
  auditLog: Array<{
    timestamp: Date;
    userId: string;
    userName: string;
    action: string;
    details?: any;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  notifications: {
    remindersSent?: number;
    lastReminderAt?: Date;
    expirationWarning?: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fullySignedAt: Date;
}
