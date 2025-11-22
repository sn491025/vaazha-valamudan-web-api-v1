import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Property } from './properties.entity';
import { User } from '../../users';


@Entity('property_approvals')
@Index(['property_id'])
@Index(['status'])
export class PropertyApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'uuid' })
  property_id: string;

  @Column({ type: 'varchar', length: 50 })
  status: string; // PENDING, APPROVED, REJECTED, UNDER_REVIEW

  @Column({ type: 'text', nullable: true })
  comments: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ type: 'uuid', nullable: true })
  reviewer_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'submitter_id' })
  submitter: User;

  @Column({ type: 'uuid', nullable: true })
  submitter_id: string;

  @Column({ type: 'jsonb', nullable: true })
  change_log: Record<string, any>; // Track changes in the approval process

  @Column({ type: 'varchar', length: 255, nullable: true })
  rejection_reason: string;

  @Column({ type: 'boolean', default: false })
  requires_changes: boolean;

  @Column({ type: 'text', nullable: true })
  required_changes: string; // Description of changes needed

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;
}