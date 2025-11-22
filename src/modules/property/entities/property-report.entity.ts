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


@Entity('property_reports')
@Index(['property_id'])
@Index(['status'])
@Index(['report_type'])
export class PropertyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'uuid' })
  property_id: string;

  @Column({ type: 'varchar', length: 50 })
  report_type: string; // FAKE_LISTING, INCORRECT_INFO, SCAM, DUPLICATE, INAPPROPRIATE, OTHER

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  status: string; // PENDING, UNDER_REVIEW, RESOLVED, DISMISSED

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ type: 'uuid' })
  reporter_id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ type: 'uuid', nullable: true })
  reviewer_id: string;

  @Column({ type: 'text', nullable: true })
  resolution_notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  resolution_action: string; // NO_ACTION, PROPERTY_REMOVED, PROPERTY_UPDATED, WARNING_ISSUED, ACCOUNT_SUSPENDED

  @Column({ type: 'jsonb', nullable: true })
  evidence: Record<string, any>; // URLs to screenshots or other evidence

  @Column({ type: 'boolean', default: false })
  is_anonymous: boolean; // Whether the report was filed anonymously

  @Column({ type: 'int', default: 1 })
  severity: number; // 1-5 scale of report severity

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date;
}