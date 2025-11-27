import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users';
import { PropertyCategory } from '../../master/entities/property-category.entity';
import { PropertyFeatureValue } from './property-feature-value.entity';
import { PropertyMedia } from './property-media.entity';
import { PropertyApproval } from './property-approval.entity';
import { PropertyReport } from './property-report.entity';
import { AgentCompanyProfile } from '../../users/entities/agent-company-profile.entity';


@Entity('properties')
@Index(['status', 'is_active'])
@Index(['property_category_id'])
@Index(['city', 'state', 'country'])
@Index(['price'])
@Index(['approval_status'])
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string; // Searchable in Elasticsearch

  @Column({ type: 'text' })
  description: string; // Searchable in Elasticsearch

  // Property type relationship
  @ManyToOne(() => PropertyCategory)
  @JoinColumn({ name: 'property_category_id' })
  property_category: PropertyCategory;

  @Column({ type: 'uuid' })
  property_category_id: string;

  // Pricing
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number; // Searchable/filterable in Elasticsearch

  @Column({ type: 'varchar', length: 50, nullable: true })
  price_unit: string; // e.g., 'per month', 'total'

  // Property Size
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  property_size: number; // Searchable/filterable in Elasticsearch

  @Column({ type: 'varchar', length: 50, nullable: true })
  property_size_unit: string; // e.g., 'Sq', 'cm'

  // Property listing type
  @Column({ type: 'varchar', length: 50 })
  listing_type: string; // SALE, RENT, LEASE

  // Property status
  @Column({ type: 'varchar', length: 50 })
  status: string; // AVAILABLE, SOLD, RENTED, PENDING_SALE

  // Address details
  @Column({ type: 'varchar', length: 200 })
  door_number: string;

  @Column({ type: 'varchar', length: 200 })
  street_name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  address_line: string;

  @Column({ type: 'varchar', length: 100 })
  city: string; // Searchable in Elasticsearch

  @Column({ type: 'varchar', length: 100 })
  district: string; // Searchable in Elasticsearch

  @Column({ type: 'varchar', length: 100 })
  state: string; // Searchable in Elasticsearch

  @Column({ type: 'varchar', length: 10 })
  postal_code: string; // Searchable in Elasticsearch

  @Column({ type: 'varchar', length: 100 })
  country: string;

  // Contact Information
  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_email: string;

  // Property Boost/Promotion (Subscription Features)
  @Column({ type: 'boolean', default: false })
  is_boosted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  boost_expires_at: Date;

  @Column({ type: 'int', default: 0 })
  boost_priority: number; // Higher number = higher priority in search results

  @Column({ type: 'boolean', default: false })
  is_top_listing: boolean;

  @Column({ type: 'timestamp', nullable: true })
  top_listing_expires_at: Date;

  // Geospatial data for map view and radius search
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number; // For geo searches in Elasticsearch

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number; // For geo searches in Elasticsearch

  // Owner information
  @ManyToOne(() => User)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ type: 'uuid' })
  owner_id: string;

  @ManyToOne(() => AgentCompanyProfile, { nullable: true })
  @JoinColumn({ name: 'agent_id' })
  agent: AgentCompanyProfile;

  @Column({ type: 'uuid', nullable: true })
  agent_id: string;

  // Approval workflow status
  @Column({ type: 'varchar', length: 50, default: 'UNDER_REVIEW' })
  approval_status: string; // PENDING, APPROVED, REJECTED, UNDER_REVIEW

  // Publication status
  @Column({ type: 'boolean', default: false })
  is_published: boolean;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  // Listing enhancement flags
  @Column({ type: 'boolean', default: false })
  is_premium: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // SEO
  @Column({ type: 'varchar', length: 255, nullable: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'text', nullable: true })
  meta_keywords: string;

  // Analytics metrics
  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'int', default: 0 })
  favorite_count: number;

  @Column({ type: 'int', default: 0 })
  contact_count: number;

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
  @OneToMany(() => PropertyFeatureValue, (value) => value.property)
  feature_values: PropertyFeatureValue[];

  @OneToMany(() => PropertyMedia, (media) => media.property)
  media: PropertyMedia[];

  @OneToMany(() => PropertyApproval, (approval) => approval.property)
  approvals: PropertyApproval[];

  @OneToMany(() => PropertyReport, (report) => report.property)
  reports: PropertyReport [];
}