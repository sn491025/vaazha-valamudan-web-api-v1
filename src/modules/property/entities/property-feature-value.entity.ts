import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index
} from 'typeorm';
import { Property } from './properties.entity';
import { FeatureGroup } from '../../master/entities/feature-group.entity';
import { FeatureCategory } from '../../master/entities/feature-category.entity';
import { FeatureOption } from '../../master/entities/feature-option.entity';


@Entity('property_feature_values')
@Index(['property_id'])
@Index(['feature_category_id'])
@Index(['feature_group_id'])
@Index(['property_id', 'feature_category_id'], { unique: true })
export class PropertyFeatureValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.feature_values, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'uuid' })
  property_id: string;

  @ManyToOne(() => FeatureGroup, { nullable: true })
  @JoinColumn({ name: 'feature_group_id' })
  feature_group: FeatureGroup;

  @Column({ type: 'uuid', nullable: true })
  feature_group_id: string;

  @ManyToOne(() => FeatureCategory)
  @JoinColumn({ name: 'feature_category_id' })
  feature_category: FeatureCategory;

  @Column({ type: 'uuid' })
  feature_category_id: string;

  // For single-select features
  @ManyToOne(() => FeatureOption, { nullable: true })
  @JoinColumn({ name: 'feature_option_id' })
  feature_option: FeatureOption;

  // For multi-select features (storing array of option IDs)
  @Column({ type: 'jsonb', nullable: true })
  feature_option_ids: string[];

  // Units (if applicable)
  @Column({ type: 'varchar', length: 500, nullable: true })
  values: string;

  // Units (if applicable)
  @Column({ type: 'varchar', length: 50, nullable: true })
  units: string;

  @Column({ type: 'boolean', default: true })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}