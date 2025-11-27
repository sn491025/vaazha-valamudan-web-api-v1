import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { UserSubscriptionUsage } from './user-subscription-usage.entity';
import { UserPurchasedItem } from './user-purchased-item.entity';

@Entity('user_subscriptions')
@Index(['user_id', 'isActive'])
@Index(['endDate'])
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: string;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.userSubscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column()
  plan_id: number;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp')
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  autoRenew: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  paidAmount: number;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ length: 50, nullable: true })
  paymentStatus: string;

  @Column({ length: 100, nullable: true })
  transactionId: string;

  @Column({ length: 50, nullable: true })
  promoCodeUsed: string;

  @Column('timestamp', { nullable: true })
  canceledAt: Date;

  @Column('text', { nullable: true })
  cancellationReason: string;

  @OneToMany(() => UserSubscriptionUsage, (u) => u.userSubscription)
  usages: UserSubscriptionUsage[];

  @OneToMany(() => UserPurchasedItem, (p) => p.userSubscription)
  purchasedItems: UserPurchasedItem[];
}
