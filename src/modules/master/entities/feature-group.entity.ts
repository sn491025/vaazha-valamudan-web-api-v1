import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeatureCategory } from './feature-category.entity';

@Entity('feature_groups')
export class FeatureGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string; // 'Area Details', 'Building Info'

  @Column({ type: 'varchar', length: 25, nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => FeatureCategory, (category) => category.group)
  categories: FeatureCategory[];
}
