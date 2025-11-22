import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Enquiry } from './enquiry.entity';

@Entity('lead_statuses')
export class LeadStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Enquiry)
  @JoinColumn({ name: 'enquiry_id' })
  enquiry: Enquiry;

  @Column({ type: 'uuid' })
  enquiry_id: string;

  @Column()
  status: string;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_to_id' })
  assigned_to: User;

  @Column({ type: 'uuid' })
  assigned_to_id: string;

  @Column({ type: 'timestamp', nullable: true })
  follow_up_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
