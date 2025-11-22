
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
import { Ad } from './ad.entity';

@Entity('ad_images')
@Index(['ad_id'])
@Index(['is_primary'])
export class AdImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ad, (ad) => ad.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ad_id' })
  ad: Ad;

  @Column({ type: 'uuid' })
  ad_id: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnail_url: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  filename: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  mime_type: string;

  @Column({ type: 'int', nullable: true })
  file_size: number;

  @Column({ type: 'int', nullable: true })
  width: number;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: false })
  is_primary: boolean;

  @Column({ type: 'text', nullable: true })
  alt_text: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
