import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { SubscriptionPlanItem } from './subscription-plan-item.entity';
import { UserSubscriptionUsage } from './user-subscription-usage.entity';

@Entity('subscription_items')
@Index(['type'])
@Index(['isActive'])
@Index(['isAddon'])
export class SubscriptionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50 })
  type: string; // BASIC_FEATURE, ADDON_BOOSTER, ADDON_SERVICE

  @Column({ length: 50 })
  valueType: string; // BOOLEAN, NUMERIC, TEXT, DAYS

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ length: 50, nullable: true })
  unit: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  basePrice: number;

  @Column({ type: 'int', default: 0 })
  defaultValue: number;

  @Column({ default: false })
  isPremium: boolean;

  @Column({ default: false })
  isAddon: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ length: 100, nullable: true })
  iconName: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SubscriptionPlanItem, (pi) => pi.item)
  planItems: SubscriptionPlanItem[];

  @OneToMany(() => UserSubscriptionUsage, (u) => u.item)
  usages: UserSubscriptionUsage[];
}
