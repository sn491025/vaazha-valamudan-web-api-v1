import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OtpPurpose } from '../enums/otp-purpose.enum';
import { OtpType } from '../enums/otp-type.enum';

@Entity('otps')
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  phoneNumber: string;

  @Column({ length: 6 })
  code: string;

  @Column({
    type: 'enum',
    enum: OtpPurpose,
  })
  purpose: OtpPurpose;

  @Column({
    type: 'enum',
    enum: OtpType,
    array: true,
  })
  otpTypes: OtpType[];

  @Column()
  expiresAt: Date;

  @Column({ default: false })
  isUsed: boolean;

  @Column({ default: 0 })
  attemptCount: number;

  @Column({ nullable: true })
  referanceId?: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
