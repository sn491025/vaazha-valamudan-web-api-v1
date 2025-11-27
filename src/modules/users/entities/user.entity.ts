import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable
} from 'typeorm';
import { LoginHistory } from '../../auth';
import { UserType } from '../enums/usertype';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column()
  firstName: string;

  @Column({ nullable: true})
  lastName: string;

  @Column({ nullable: true, unique: true })
  phoneNumber: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, unique: true })
  referralCode?: string;

  @Column({ nullable: true })
  referredBy?: string;

  @Column({
    type: 'enum',
    array: true,
    enum: UserType,
    default: [UserType.BUYER]
  })
  roles: UserType[];

  @OneToMany(() => LoginHistory, (history) => history.user)
  loginHistory: LoginHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
