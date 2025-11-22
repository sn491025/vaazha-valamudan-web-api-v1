
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

@Entity('ad_approvals')
@Index(['ad_id'])
@Index(['reviewed_by_id'])
@Index(['status'])
export class AdApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ad, (ad) => ad.approvals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;

  @Column({ type: 'uuid' })
  ad_id: string;

  @Column({ type: 'varchar', length: 50 })
  status: string; // PENDING, APPROVED, REJECTED, CHANGES_REQUESTED

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewed_by: User;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by_id: string;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;

  @Column({ type: 'text', nullable: true })
  admin_notes: string;

  @Column({ type: 'text', nullable: true })
  changes_requested: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}