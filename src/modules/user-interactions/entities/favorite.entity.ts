import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('favorites')
@Index(['user_id', 'entity_type', 'entity_id'], { unique: true })
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'varchar', length: 50 })
  entity_type: string; // 'property', 'ad', etc.

  @Column({ type: 'uuid' })
  entity_id: string; // ID of the property, ad, etc.

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
