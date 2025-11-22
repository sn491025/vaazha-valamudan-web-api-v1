import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { SubscriptionItem } from './subscription-item.entity';

@Entity('subscription_plan_items')
@Index(['plan_id'])
@Index(['item_id'])
export class SubscriptionPlanItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SubscriptionPlan, (plan) => plan.planItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column()
  plan_id: number;

  @ManyToOne(() => SubscriptionItem, (item) => item.planItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: SubscriptionItem;

  @Column()
  item_id: number;

  @Column({ default: true })
  isIncluded: boolean;

  @Column({ default: false })
  isConfigurable: boolean;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ default: 0 })
  numericValue: number;

  @Column({ length: 255, nullable: true })
  textValue: string;

  @Column({ default: 0 })
  durationDays: number;

  @Column({ default: false })
  isUnlimited: boolean;

  @Column({ default: false })
  isHighlighted: boolean;

  @Column('json', { nullable: true })
  customSettings: any;
}
