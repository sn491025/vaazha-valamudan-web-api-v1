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

@Entity('user_subscription_usages')
@Index(['user_subscription_id', 'item_id'])
export class UserSubscriptionUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserSubscription, (us) => us.usages)
  @JoinColumn({ name: 'user_subscription_id' })
  userSubscription: UserSubscription;

  @Column()
  user_subscription_id: number;

  @ManyToOne(() => SubscriptionItem, (item) => item.usages)
  @JoinColumn({ name: 'item_id' })
  item: SubscriptionItem;

  @Column()
  item_id: number;

  @Column({ default: 0 })
  usedCount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  usedValue: number;

  @Column('json', { nullable: true })
  usageDetails: any;

  @Column('timestamp', { nullable: true })
  lastUsedAt: Date;
}
