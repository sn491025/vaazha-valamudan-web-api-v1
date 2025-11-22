import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('login_history')
export class LoginHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.loginHistory, { onDelete: 'CASCADE' })
  user: User | null;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({ nullable: true })
  userAgent: string; // browser / device info

  @CreateDateColumn()
  loginAt: Date;
}
