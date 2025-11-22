import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { FeatureCategory } from './feature-category.entity';
import { PropertyCategory } from './property-category.entity';

@Entity('property_category_feature_mappings')
@Unique(['property_category_id', 'feature_category_id'])
export class PropertyCategoryFeatureMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // 🔗 Relations
  @ManyToOne(() => FeatureCategory, (feature) => feature.category_mappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'feature_category_id' })
  feature_category: FeatureCategory;

  @Column({ type: 'uuid' })
  feature_category_id: string;

  @ManyToOne(() => PropertyCategory, (property) => property.feature_mappings, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_category_id' })
  property_category: PropertyCategory;

  @Column({ type: 'uuid' })
  property_category_id: string;

  // 🧠 Additional Mapping Metadata
  @Column({ type: 'boolean', default: false })
  is_mandatory: boolean;

  @Column({ type: 'boolean', default: false })
  is_filterable: boolean;

  @Column({ type: 'int', nullable: true })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // 🕒 Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
