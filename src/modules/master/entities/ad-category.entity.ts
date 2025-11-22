import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ad } from '../../ads/entities/ad.entity';

@Entity('ad_categories')
@Index(['parent_id'])
@Index(['is_active'])
export class AdCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon: string;

  @ManyToOne(() => AdCategory, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: AdCategory;

  @Column({ type: 'uuid', nullable: true })
  parent_id: string;

  @OneToMany(() => AdCategory, (category) => category.parent)
  children: AdCategory[];

  @OneToMany(() => Ad, (ad) => ad.category)
  ads: Ad[];

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
