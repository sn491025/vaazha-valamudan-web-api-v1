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
import { User } from '../../users/entities/user.entity';

@Entity('enquiries')
@Index(['entity_type', 'entity_id'])
@Index(['status'])
export class Enquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  entity_type: string; // 'property', 'ad', etc.

  @Column({ type: 'uuid' })
  entity_id: string; // ID of the property, ad, etc.

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text')
  message: string;

  @Column({ default: 'new' })
  status: string; // new, contacted, qualified, converted, closed

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>; // Additional context like preferred viewing time, budget, etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
