
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { AdCategory } from '../../master/entities/ad-category.entity';
import { AdImage } from './ad-image.entity';
import { AdReport } from './ad-report.entity';
import { AdApproval } from './ad-approval.entity';

@Entity('ads')
@Index(['status', 'is_active'])
@Index(['category_id'])
@Index(['city', 'state', 'country'])
@Index(['price'])
@Index(['approval_status'])
@Index(['is_boosted', 'boost_expires_at'])
@Index(['is_top_listing', 'top_listing_expires_at'])
export class Ad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  // Category relationship
  @ManyToOne(() => AdCategory)
  @JoinColumn({ name: 'category_id' })
  category: AdCategory;

  @Column({ type: 'uuid' })
  category_id: string;

  // Pricing
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  price_unit: string;

  @Column({ type: 'boolean', default: false })
  is_negotiable: boolean;

  // Ad status
  @Column({ type: 'varchar', length: 50, default: 'AVAILABLE' })
  status: string; // AVAILABLE, SOLD, RESERVED, WITHDRAWN

  // Location details
  @Column({ type: 'varchar', length: 200 })
  door_number: string;

  @Column({ type: 'varchar', length: 200 })
  street_name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address_line?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  postal_code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude?: number;

  // Contact Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_name?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_email?: string;

  // Boost/Promotion Features (Direct fields for efficient querying)
  @Column({ type: 'boolean', default: false })
  is_boosted: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  active_boost_type: string; // PREMIUM, FEATURED, URGENT

  @Column({ type: 'timestamp', nullable: true })
  boost_expires_at: Date;

  @Column({ type: 'int', default: 0 })
  boost_priority: number;

  @Column({ type: 'boolean', default: false })
  is_top_listing: boolean;

  @Column({ type: 'timestamp', nullable: true })
  top_listing_expires_at: Date;

  // Owner information
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'uuid' })
  owner_id: string;

  // Approval workflow status
  @Column({ type: 'varchar', length: 50, default: 'UNDER_REVIEW' })
  approval_status: string; // PENDING, APPROVED, REJECTED, UNDER_REVIEW

  // Publication status
  @Column({ type: 'boolean', default: false })
  is_published: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_premium: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // SEO
  @Column({ type: 'varchar', length: 255, nullable: true })
  slug?: string;

  @Column({ type: 'text', nullable: true })
  meta_description?: string;

  @Column({ type: 'text', nullable: true })
  meta_keywords?: string;

  // Analytics metrics
  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  favorite_count: number;

  @Column({ type: 'int', default: 0 })
  contact_count: number;

  @Column({ type: 'int', default: 0 })
  click_count: number;

  // Expiry
  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  // Timestamps
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  approved_at: Date;

  // Relationships
  @OneToMany(() => AdImage, (image) => image.ad)
  images: AdImage[];

  @OneToMany(() => AdApproval, (approval) => approval.ad)
  approvals: AdApproval[];

  @OneToMany(() => AdReport, (report) => report.ad)
  reports: AdReport[];
}