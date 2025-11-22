import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany, JoinTable
} from 'typeorm';
import { Role } from './role.entity';
import { LoginHistory } from '../../auth/entities/login-history.entity';
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
    enum: UserType,
    nullable: true
  })
  userType?: string;

  @ManyToMany(() => Role, (role) => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  // @ManyToMany(() => Subscription, (subscription) => subscription.users, { eager: true })
  // @JoinTable({
  //   name: 'user_subscriptions',
  //   joinColumn: { name: 'userId', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'subscriptionId', referencedColumnName: 'id' },
  // })
  // subscriptions: Subscription[];
  //
  @OneToMany(() => LoginHistory, (history) => history.user)
  loginHistory: LoginHistory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
