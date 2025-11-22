import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FeatureCategory } from './feature-category.entity';


@Entity('feature_options')
export class FeatureOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g. 'East', 'West', 'North', etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  value: string; // optional technical value (e.g., 'EAST')

  @Column({ type: 'varchar', length: 25, nullable: true })
  icon: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ManyToOne(() => FeatureCategory, (category) => category.options, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'feature_category_id' })
  feature_category: FeatureCategory;

  @Column({ type: 'uuid' })
  feature_category_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
