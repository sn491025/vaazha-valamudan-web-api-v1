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

@Entity('saved_searches')
export class SavedSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  entity_type: string; // 'property', 'ad', etc.

  @Column('jsonb')
  search_criteria: Record<string, any>;

  @Column({ nullable: true })
  name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: true })
  notify_on_new: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
