import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { FeatureOption } from './feature-option.entity';
import { PropertyCategoryFeatureMapping } from './property-category-feature-mapping.entity';
import { InputType } from '../enums/InputType';
import { FeatureGroup } from './feature-group.entity';

@Entity('feature_categories')
@Index(['code'], { unique: true })
@Index(['is_active'])
export class FeatureCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  code: string; // 'FACING', 'BHK', 'AMENITIES', 'PARKING', 'FLOORING'

  @Column({ type: 'varchar', length: 100 })
  name: string; // 'Facing', 'BHK Configuration', 'Amenities'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: InputType,
    default: InputType.SINGLE_SELECT,
  })
  input_type: string; // How this feature should be captured

  @Column({ type: 'boolean', default: false })
  is_filterable: boolean; // Can be used in search filters

  @Column({ type: 'boolean', default: false })
  is_mandatory: boolean; // Required when listing property

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => FeatureOption, (option) => option.feature_category)
  options: FeatureOption[];

  @OneToMany(
    () => PropertyCategoryFeatureMapping,
    (mapping) => mapping.feature_category,
  )
  category_mappings: PropertyCategoryFeatureMapping[];

  @ManyToOne(() => FeatureGroup, (group) => group.categories, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group: FeatureGroup;

  @Column({ type: 'uuid', nullable: true })
  group_id: string;
}
