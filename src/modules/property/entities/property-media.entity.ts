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

@Entity('property_media')
@Index(['property_id'])
@Index(['media_type'])
export class PropertyMedia {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Property, (property) => property.media, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property: Property;

  @Column({ type: 'uuid' })
  property_id: string;

  @Column({ type: 'varchar', length: 50 })
  media_type: string; // IMAGE, VIDEO, DOCUMENT, FLOOR_PLAN, VIRTUAL_TOUR, 3D_MODEL

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  original_filename: string;

  @Column({ type: 'varchar', length: 300, nullable: true })
  key: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  alt_text: string; // For accessibility

  @Column({ type: 'boolean', default: false })
  is_primary: boolean; // Main image/video for the property

  @Column({ type: 'boolean', default: false })
  is_approved: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  media_category: string; // EXTERIOR, INTERIOR, KITCHEN, BEDROOM, BATHROOM, etc.

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  content_type: string; // MIME type

  @Column({ type: 'int', nullable: true })
  file_size: number; // In bytes

  @Column({ type: 'int', nullable: true })
  width: number; // For images

  @Column({ type: 'int', nullable: true })
  height: number; // For images

  @Column({ type: 'int', nullable: true })
  duration: number; // For videos, in seconds

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}