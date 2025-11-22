import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { PropertyCategoryFeatureMapping } from './property-category-feature-mapping.entity';
import { Ad } from '../../ads/entities/ad.entity';
import { Property } from '../../property/entities/properties.entity';

@Entity('property_categories')
export class PropertyCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // e.g. 'Apartment', 'Villa', 'Plot'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;
  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @ManyToOne(() => PropertyCategory, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: PropertyCategory;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  @OneToMany(() => PropertyCategory, (category) => category.parent)
  children: PropertyCategory[];

  @OneToMany(() => Property, (prop) => prop.property_category)
  properties: Property[];

  // 🔢 Sort Order
  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(
    () => PropertyCategoryFeatureMapping,
    (mapping) => mapping.property_category,
  )
  feature_mappings: PropertyCategoryFeatureMapping[];
}
