import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organization/entities/organization.entity';
import { Contract } from './contract.entity';

@Entity('contract_templates')
export class ContractTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'org_id', nullable: true })
  orgId: string;

  @ManyToOne(() => Organization, { nullable: true })
  @JoinColumn({ name: 'org_id' })
  organization: Organization;

  @Column()
  name: string;

  @Column()
  category:
    | 'recording'
    | 'publishing'
    | 'licensing'
    | 'management'
    | 'distribution'
    | 'collaboration'
    | 'other';

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  content: string; // HTML/Markdown template with {{variables}}

  @Column({ type: 'jsonb' })
  variables: Array<{
    key: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'email' | 'currency' | 'select';
    required: boolean;
    defaultValue?: any;
    options?: string[]; // For select type
    placeholder?: string;
    helpText?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  sections: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    optional: boolean;
  }>;

  @Column({ default: 1 })
  version: number;

  @Column({ nullable: true })
  previousVersionId: string;

  @Column({ default: 'draft' })
  status: 'draft' | 'active' | 'archived';

  @Column({ default: 'organization' })
  visibility: 'organization' | 'public' | 'private';

  @Column({ default: false })
  isOfficial: boolean; // Official WMIW templates

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    language?: string;
    jurisdiction?: string;
    industry?: string;
    tags?: string[];
    estimatedPages?: number;
    [key: string]: any;
  };

  @Column({ default: 0 })
  usageCount: number;

  @OneToMany(() => Contract, (contract) => contract.template)
  contracts: Contract[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ name: 'last_modified_by', nullable: true })
  lastModifiedBy: string;
}
