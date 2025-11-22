import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { SubscriptionPlanItem } from './subscription-plan-item.entity';
import { UserSubscription } from './user-subscription.entity';

@Entity('subscription_plans')
@Index(['isActive'])
@Index(['displayOrder'])
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150, nullable: true })
  tagline: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: false })
  hasValueBasedPricing: boolean;

  @Column('json', { nullable: true })
  valuePricingTiers: any;

  @Column()
  durationDays: number;

  @Column({ length: 50, default: 'monthly' })
  billingCycle: string;

  @Column({ length: 255, nullable: true })
  targetAudience: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ default: 0 })
  displayOrder: number;

  @Column({ default: false })
  isPopular: boolean;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SubscriptionPlanItem, (pi) => pi.plan)
  planItems: SubscriptionPlanItem[];

  @OneToMany(() => UserSubscription, (us) => us.plan)
  userSubscriptions: UserSubscription[];
}
