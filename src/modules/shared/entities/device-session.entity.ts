import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DeviceType } from '../enums/device-type.enum';

@Entity('device_sessions')
@Index(['referenceId', 'deviceId'], { unique: false })
export class DeviceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Reference to the logical user or account (kept generic to avoid coupling)
  @Column()
  referenceId: string;

  @Column()
  deviceId?: string;

  @Column({ type: 'enum', enum: DeviceType, default: DeviceType.WEB })
  deviceType: DeviceType;

  @Column({ nullable: true })
  platform?: string;

  @Column({ nullable: true })
  firebaseToken?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  refreshTokenHash: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
