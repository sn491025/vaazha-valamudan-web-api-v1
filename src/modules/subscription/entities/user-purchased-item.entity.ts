import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { UserSubscription } from './user-subscription.entity';
import { SubscriptionItem } from './subscription-item.entity';
import { SubscriptionPlanItem } from './subscription-plan-item.entity';

@Entity('user_purchased_items')
@Index(['user_subscription_id'])
export class UserPurchasedItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserSubscription, (us) => us.purchasedItems)
  @JoinColumn({ name: 'user_subscription_id' })
  userSubscription: UserSubscription;

  @Column()
  user_subscription_id: number;

  @ManyToOne(() => SubscriptionItem)
  @JoinColumn({ name: 'item_id' })
  item: SubscriptionItem;

  @Column()
  item_id: number;

  @ManyToOne(() => SubscriptionPlanItem, { nullable: true })
  @JoinColumn({ name: 'plan_item_id' })
  planItem: SubscriptionPlanItem;

  @Column({ nullable: true })
  plan_item_id: number;

  @Column('timestamp')
  startDate: Date;

  @Column('timestamp')
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  paidAmount: number;

  @Column({ length: 50, default: 'active' })
  status: string;

  @Column({ length: 50 })
  paymentStatus: string;

  @Column({ length: 100, nullable: true })
  transactionId: string;

  @Column({ length: 255, nullable: true })
  appliedTo: string;

  @Column('json', { nullable: true })
  itemSettings: any;
}
