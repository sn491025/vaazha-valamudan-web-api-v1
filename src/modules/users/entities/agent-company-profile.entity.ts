import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('agent_company_profiles')
export class AgentCompanyProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, length: 50, unique: true })
  profileName: string;

  @Column({ length: 100 })
  companyName: string;

  @Column({ length: 100, nullable: true })
  shortTitle?: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  companyLogo?: string;

  @Column({ nullable: true })
  companyLogoKey?: string;

  @Column({ length: 15, nullable: true })
  gstNumber?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_name?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contact_phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  contact_email?: string;

  // Status and account management fields
  @Column({ type: 'boolean', default: false })
  isDeactivated: boolean;

  @Column({ type: 'integer', default: 365 })
  expiryDays: number;

  @Column({ type: 'timestamp', nullable: true })
  expiryDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 200 })
  door_number: string;

  @Column({ type: 'varchar', length: 200 })
  street_name: string;


  // Location details
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
}