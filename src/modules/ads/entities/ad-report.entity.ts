
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ad } from './ad.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ad_reports')
@Index(['ad_id'])
@Index(['status'])
@Index(['reporter_id'])
export class AdReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ad, (ad) => ad.reports, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;

  @Column({ type: 'uuid' })
  ad_id: string;

  // New-style reporter (property-style naming)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @Column({ type: 'uuid', nullable: true })
  reporter_id: string | null;

  // Legacy reporter for backward compatibility (not used by new code)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reported_by_id' })
  reported_by: User | null;

  @Column({ type: 'uuid', nullable: true })
  reported_by_id: string | null;

  // Property-style fields
  @Column({ type: 'varchar', length: 100, nullable: true })
  report_type: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'json', nullable: true })
  evidence: Record<string, any> | null;

  @Column({ type: 'bool', default: false })
  is_anonymous: boolean;

  @Column({ type: 'int', default: 1 })
  severity: number;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  status: string; // PENDING, UNDER_REVIEW, RESOLVED, DISMISSED

  // Reviewer (property-style naming)
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User | null;

  @Column({ type: 'uuid', nullable: true })
  reviewer_id: string | null;

  @Column({ type: 'text', nullable: true })
  resolution_notes: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  resolution_action: string | null; // AD_REMOVED, AD_MODIFIED, WARNING_ISSUED, USER_SUSPENDED, NO_ACTION

  @Column({ type: 'timestamp', nullable: true })
  resolved_at: Date | null;

  // Legacy review fields for backward compatibility
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewed_by: User | null;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by_id: string | null;

  @Column({ type: 'text', nullable: true })
  admin_notes: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  action_taken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}