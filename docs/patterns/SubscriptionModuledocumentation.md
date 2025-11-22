# Real Estate Subscription Management System Documentation

This document provides comprehensive details about the real estate subscription management system, including entity design, API endpoints, and implementation strategies.

## Table of Contents

1. [System Overview](#system-overview)
2. [Entity Design](#entity-design)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Implementation Notes](#implementation-notes)
6. [Code Examples](#code-examples)
7. [Front-end Integration](#front-end-integration)

## System Overview

The Real Estate Subscription Management System provides a flexible, dynamic way to manage subscription plans, features, and add-ons for a real estate platform. The system allows administrators to create and configure different subscription tiers (e.g., Silver, Gold, Platinum) with various features and purchasable add-ons without requiring code changes.

### Key Features

- **Dynamic plan configuration** - Create any number of subscription plans
- **Flexible feature system** - Configure features with different types (boolean, numeric, text, days)
- **Add-on marketplace** - Set up purchasable boosters and add-ons 
- **Property value-based pricing** - Support for pricing tiers based on property value
- **Usage tracking** - Monitor how users consume their subscription benefits
- **Expiration management** - Automatic handling of feature and subscription expiration

## Entity Design

### Core Entities

#### SubscriptionItem

This unified entity represents both basic features and purchasable add-ons with a type field to differentiate.

```typescript
@Entity('subscription_items')
export class SubscriptionItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // "Property Listings", "Priority Push", etc.

  @Column({ length: 50 })
  type: string; // "BASIC_FEATURE", "ADDON_BOOSTER", "ADDON_SERVICE", etc.

  @Column({ length: 50 })
  valueType: string; // "BOOLEAN", "NUMERIC", "TEXT", "DAYS", etc.

  @Column({ length: 50, nullable: true })
  category: string; // "Visibility", "Marketing", "Support", etc.
  
  @Column({ length: 50, nullable: true })
  unit: string; // "days", "listings", "uploads", etc.

  @Column('text', nullable: true })
  description: string;

  @Column({ default: 0 })
  basePrice: number; // Base price if it's a paid add-on

  @Column({ default: 0 })
  defaultValue: number; // Default numeric value (e.g., 10 listings)

  @Column({ default: false })
  isPremium: boolean; // If this is a premium feature

  @Column({ default: false })
  isAddon: boolean; // If this can be purchased separately

  @Column({ default: 0 })
  displayOrder: number;
  
  @Column({ nullable: true })
  iconName: string; // Icon reference
  
  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @OneToMany(() => SubscriptionPlanItem, planItem => planItem.item)
  planItems: SubscriptionPlanItem[];

  @OneToMany(() => UserSubscriptionUsage, usage => usage.item)
  usages: UserSubscriptionUsage[];
}
```

#### SubscriptionPlan

```typescript
@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Silver, Gold, Platinum, etc.

  @Column({ length: 150, nullable: true })
  tagline: string; // Short marketing tagline

  @Column('decimal', { precision: 10, scale: 2 })
  price: number; // Monthly price

  @Column({ default: false })
  hasValueBasedPricing: boolean; // If price varies by property value

  @Column('json', { nullable: true })
  valuePricingTiers: any; // JSON structure for value-based pricing

  @Column()
  durationDays: number; // Default validity period in days

  @Column({ length: 50, default: 'monthly' })
  billingCycle: string; // monthly, quarterly, yearly

  @Column({ length: 255, nullable: true })
  targetAudience: string; // Description of target audience

  @Column('text', { nullable: true })
  description: string; // Detailed description

  @Column({ default: 0 })
  displayOrder: number; // For controlling display sequence

  @Column({ default: false })
  isPopular: boolean; // Whether to highlight as popular plan

  @Column({ default: true })
  isActive: boolean;

  // Relationships
  @OneToMany(() => SubscriptionPlanItem, planItem => planItem.plan)
  planItems: SubscriptionPlanItem[];

  @OneToMany(() => UserSubscription, userSubscription => userSubscription.plan)
  userSubscriptions: UserSubscription[];
}
```

#### SubscriptionPlanItem

Join entity that maps subscription plans to items with dynamic configuration.

```typescript
@Entity('subscription_plan_items')
export class SubscriptionPlanItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => SubscriptionPlan, plan => plan.planItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column()
  plan_id: number;

  @ManyToOne(() => SubscriptionItem, item => item.planItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'item_id' })
  item: SubscriptionItem;

  @Column()
  item_id: number;

  @Column({ default: true })
  isIncluded: boolean; // Whether the feature is included in this plan

  @Column({ default: false }) 
  isConfigurable: boolean; // Whether user can configure this item

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number; // Price override for this plan (for add-ons)

  @Column({ default: 0 })
  numericValue: number; // Value if numeric (e.g., 10 listings)

  @Column({ length: 255, nullable: true })
  textValue: string; // Value if text-based

  @Column({ default: 0 })
  durationDays: number; // Duration if time-based (e.g., listing validity)

  @Column({ default: false })
  isUnlimited: boolean; // Whether there's no limit

  @Column({ default: false })
  isHighlighted: boolean; // Whether to highlight in plan comparisons

  @Column('json', { nullable: true })
  customSettings: any; // Any custom settings JSON for this feature in this plan
}
```

#### UserSubscription

```typescript
@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number; // FK to users table

  @ManyToOne(() => SubscriptionPlan, plan => plan.userSubscriptions)
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
  paidAmount: number; // Actual amount paid (after discounts)

  @Column({ length: 50, default: 'active' })
  status: string; // active, expired, canceled, trial, etc.

  @Column({ length: 50, nullable: true })
  paymentStatus: string; // Paid, Pending, Failed, etc.

  @Column({ length: 100, nullable: true })
  transactionId: string; // Payment reference

  @Column({ length: 50, nullable: true })
  promoCodeUsed: string;

  @Column('timestamp', { nullable: true })
  canceledAt: Date;

  @Column('text', { nullable: true })
  cancellationReason: string;

  // Relationships
  @OneToMany(() => UserSubscriptionUsage, usage => usage.userSubscription)
  usages: UserSubscriptionUsage[];

  @OneToMany(() => UserPurchasedItem, purchasedItem => purchasedItem.userSubscription)
  purchasedItems: UserPurchasedItem[];
}
```

#### UserSubscriptionUsage

```typescript
@Entity('user_subscription_usages')
export class UserSubscriptionUsage {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserSubscription, userSubscription => userSubscription.usages)
  @JoinColumn({ name: 'user_subscription_id' })
  userSubscription: UserSubscription;

  @Column()
  user_subscription_id: number;

  @ManyToOne(() => SubscriptionItem, item => item.usages)
  @JoinColumn({ name: 'item_id' })
  item: SubscriptionItem;

  @Column()
  item_id: number;

  @Column({ default: 0 })
  usedCount: number; // How many times used

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  usedValue: number; // For tracking value-based usage

  @Column('json', { nullable: true })
  usageDetails: any; // Additional usage details (JSON)

  @Column('timestamp', { nullable: true })
  lastUsedAt: Date; // Last time used
}
```

#### UserPurchasedItem

```typescript
@Entity('user_purchased_items')
export class UserPurchasedItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserSubscription, userSubscription => userSubscription.purchasedItems)
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
  planItem: SubscriptionPlanItem; // Optional reference to the plan item config

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
  status: string; // active, expired, canceled, etc.

  @Column({ length: 50 })
  paymentStatus: string; // Paid, Pending, Failed, etc.

  @Column({ length: 100, nullable: true })
  transactionId: string;

  @Column({ length: 255, nullable: true })
  appliedTo: string; // Property ID, Profile ID, etc. (what this is applied to)

  @Column('json', { nullable: true })
  itemSettings: any; // Any specific settings for this purchase
}
```

## Database Schema

The entities map to the following database tables with relationships:

```
subscription_items
  ↑
  ↓
subscription_plan_items ← subscription_plans
       ↑                       ↑
       |                       |
user_subscription_usages ← user_subscriptions → user_purchased_items
```

### Key relationships:

1. A `SubscriptionPlan` has many `SubscriptionPlanItems` which configure how each feature works in that plan
2. A `SubscriptionItem` represents both features and add-ons and is referenced by `SubscriptionPlanItems`
3. A `UserSubscription` records a user's subscription to a plan
4. `UserSubscriptionUsage` tracks how a user uses each feature
5. `UserPurchasedItem` tracks add-ons the user has purchased

## API Endpoints

### Subscription Items API

#### Get All Subscription Items
```
GET /api/subscription-items
```

**Query Parameters:**
- `type` - Filter by item type (e.g., `BASIC_FEATURE`, `ADDON_BOOSTER`)
- `category` - Filter by category
- `isActive` - Filter by active status
- `isAddon` - Filter add-ons only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Property Listings",
      "type": "BASIC_FEATURE",
      "valueType": "NUMERIC",
      "category": "Listings",
      "description": "Number of property listings allowed",
      "basePrice": 0,
      "defaultValue": 10,
      "unit": "listings",
      "isPremium": false,
      "isAddon": false,
      "isActive": true
    },
    // ...more items
  ],
  "count": 15
}
```

#### Get Subscription Item
```
GET /api/subscription-items/:id
```

#### Create Subscription Item
```
POST /api/subscription-items
```

**Request Body:**
```json
{
  "name": "Video Upload",
  "type": "BASIC_FEATURE",
  "valueType": "BOOLEAN",
  "category": "Media",
  "description": "Ability to upload property videos",
  "basePrice": 0,
  "defaultValue": 0,
  "unit": "uploads",
  "isPremium": true,
  "isAddon": false
}
```

#### Update Subscription Item
```
PUT /api/subscription-items/:id
```

#### Delete Subscription Item
```
DELETE /api/subscription-items/:id
```

### Subscription Plans API

#### Get All Subscription Plans
```
GET /api/subscription-plans
```

**Query Parameters:**
- `includeItems` - Include plan items (true/false)
- `isActive` - Filter active plans only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Silver Plan",
      "tagline": "Perfect for individuals",
      "price": 999.00,
      "durationDays": 30,
      "description": "Basic plan for individuals",
      "isActive": true,
      "planItems": [
        {
          "id": 1,
          "item": {
            "id": 1,
            "name": "Property Listings",
            // ... item details
          },
          "isIncluded": true,
          "numericValue": 10,
          "isUnlimited": false
          // ... other config
        },
        // ... more plan items
      ]
    },
    // ... more plans
  ],
  "count": 3
}
```

#### Get Subscription Plan
```
GET /api/subscription-plans/:id
```

#### Create Subscription Plan
```
POST /api/subscription-plans
```

**Request Body:**
```json
{
  "name": "Gold Plan",
  "tagline": "Best for professionals",
  "price": 1999.00,
  "durationDays": 30,
  "description": "Professional plan with premium features",
  "isActive": true,
  "isPopular": true,
  "planItems": [
    {
      "item_id": 1,
      "isIncluded": true,
      "numericValue": 30,
      "isUnlimited": false
    },
    {
      "item_id": 2,
      "isIncluded": true,
      "durationDays": 45
    }
    // ... more plan items
  ]
}
```

#### Update Subscription Plan
```
PUT /api/subscription-plans/:id
```

#### Delete Subscription Plan
```
DELETE /api/subscription-plans/:id
```

### Plan Items API

#### Add Item to Plan
```
POST /api/subscription-plans/:planId/items
```

#### Update Plan Item
```
PUT /api/subscription-plans/:planId/items/:itemId
```

#### Delete Plan Item
```
DELETE /api/subscription-plans/:planId/items/:itemId
```

### User Subscriptions API

#### Get User's Active Subscription
```
GET /api/users/:userId/subscription
```

#### Subscribe User to Plan
```
POST /api/users/:userId/subscribe
```

**Request Body:**
```json
{
  "plan_id": 2,
  "startDate": "2025-10-01T00:00:00.000Z",
  "endDate": "2025-10-31T00:00:00.000Z",
  "autoRenew": true,
  "paidAmount": 1999.00,
  "paymentStatus": "Paid",
  "transactionId": "pay_abc123",
  "promoCodeUsed": "NEW10"
}
```

#### Update User Subscription
```
PUT /api/users/:userId/subscription/:id
```

#### Cancel Subscription
```
POST /api/users/:userId/subscription/:id/cancel
```

### Add-ons API

#### Purchase Add-on
```
POST /api/users/:userId/add-ons
```

**Request Body:**
```json
{
  "item_id": 10,
  "userSubscription_id": 42,
  "startDate": "2025-10-05T00:00:00.000Z",
  "endDate": "2025-10-12T00:00:00.000Z",
  "paidAmount": 499.00,
  "paymentStatus": "Paid",
  "transactionId": "pay_xyz789",
  "appliedTo": "property_123"
}
```

#### Get User's Add-ons
```
GET /api/users/:userId/add-ons
```

#### Update Add-on
```
PUT /api/users/:userId/add-ons/:id
```

### Feature Access API

#### Check Feature Access
```
GET /api/users/:userId/features/:featureName/access
```

#### Get Feature Usage
```
GET /api/users/:userId/features/usage
```

#### Record Feature Usage
```
POST /api/users/:userId/features/:featureName/usage
```

### Public Endpoints

#### Get Public Plan List
```
GET /api/public/plans
```

#### Get Plan Details
```
GET /api/public/plans/:id
```

## Implementation Notes

### Controllers and Services Structure

```
src/
├── subscription/
│   ├── controllers/
│   │   ├── subscription-item.controller.ts
│   │   ├── subscription-plan.controller.ts
│   │   ├── user-subscription.controller.ts
│   │   └── public-subscription.controller.ts
│   ├── services/
│   │   ├── subscription-item.service.ts
│   │   ├── subscription-plan.service.ts
│   │   ├── user-subscription.service.ts
│   │   └── subscription-feature.service.ts
│   ├── dto/
│   │   ├── subscription-item.dto.ts
│   │   ├── subscription-plan.dto.ts
│   │   └── user-subscription.dto.ts
│   ├── entities/
│   │   ├── subscription-item.entity.ts
│   │   ├── subscription-plan.entity.ts
│   │   ├── subscription-plan-item.entity.ts
│   │   ├── user-subscription.entity.ts
│   │   ├── user-subscription-usage.entity.ts
│   │   └── user-purchased-item.entity.ts
│   └── subscription.module.ts
└── common/
    ├── guards/
    │   └── feature-access.guard.ts
    └── interceptors/
        └── feature-usage.interceptor.ts
```

### Module Setup

```typescript
// subscription.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionItem } from './entities/subscription-item.entity';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlanItem } from './entities/subscription-plan-item.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { UserSubscriptionUsage } from './entities/user-subscription-usage.entity';
import { UserPurchasedItem } from './entities/user-purchased-item.entity';

import { SubscriptionItemController } from './controllers/subscription-item.controller';
import { SubscriptionPlanController } from './controllers/subscription-plan.controller';
import { UserSubscriptionController } from './controllers/user-subscription.controller';
import { PublicSubscriptionController } from './controllers/public-subscription.controller';

import { SubscriptionItemService } from './services/subscription-item.service';
import { SubscriptionPlanService } from './services/subscription-plan.service';
import { UserSubscriptionService } from './services/user-subscription.service';
import { SubscriptionFeatureService } from './services/subscription-feature.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionItem,
      SubscriptionPlan,
      SubscriptionPlanItem,
      UserSubscription,
      UserSubscriptionUsage,
      UserPurchasedItem
    ]),
  ],
  controllers: [
    SubscriptionItemController,
    SubscriptionPlanController,
    UserSubscriptionController,
    PublicSubscriptionController
  ],
  providers: [
    SubscriptionItemService,
    SubscriptionPlanService,
    UserSubscriptionService,
    SubscriptionFeatureService
  ],
  exports: [
    SubscriptionFeatureService,
    UserSubscriptionService
  ]
})
export class SubscriptionModule {}
```

### Feature Access Guard Example

```typescript
// feature-access.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { SubscriptionFeatureService } from '../subscription/services/subscription-feature.service';

@Injectable()
export class FeatureAccessGuard implements CanActivate {
  constructor(private subscriptionFeatureService: SubscriptionFeatureService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const featureName = request.params.feature || request.query.feature;

    if (!user || !featureName) {
      return false;
    }

    // Check if user has access to the specified feature
    const hasAccess = await this.subscriptionFeatureService.userHasFeatureAccess(
      user.id,
      featureName
    );

    return hasAccess;
  }
}
```

## Code Examples

### Feature Access Check Implementation

```typescript
// subscription-feature.service.ts
@Injectable()
export class SubscriptionFeatureService {
  constructor(
    @InjectRepository(UserSubscription)
    private userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(SubscriptionPlanItem)
    private subscriptionPlanItemRepository: Repository<SubscriptionPlanItem>,
    @InjectRepository(SubscriptionItem)
    private subscriptionItemRepository: Repository<SubscriptionItem>,
    @InjectRepository(UserSubscriptionUsage)
    private userSubscriptionUsageRepository: Repository<UserSubscriptionUsage>,
    @InjectRepository(UserPurchasedItem)
    private userPurchasedItemRepository: Repository<UserPurchasedItem>,
  ) {}

  async userHasFeatureAccess(
    userId: number,
    featureName: string,
  ): Promise<boolean> {
    // Get user's active subscription
    const userSubscription = await this.userSubscriptionRepository.findOne({
      where: {
        user_id: userId,
        isActive: true,
        endDate: MoreThanOrEqual(new Date()),
      },
      relations: ['plan'],
    });

    if (!userSubscription) {
      return false;
    }

    // Find the feature by name
    const feature = await this.subscriptionItemRepository.findOne({
      where: { name: featureName, isActive: true },
    });

    if (!feature) {
      return false;
    }

    // Check if the feature is included in the user's plan
    const planItem = await this.subscriptionPlanItemRepository.findOne({
      where: {
        plan_id: userSubscription.plan_id,
        item_id: feature.id,
        isIncluded: true,
      },
    });

    if (!planItem) {
      // Check if the user has purchased this as an add-on
      if (feature.isAddon) {
        const purchasedItem = await this.userPurchasedItemRepository.findOne({
          where: {
            userSubscription_id: userSubscription.id,
            item_id: feature.id,
            isActive: true,
            endDate: MoreThanOrEqual(new Date()),
          },
        });

        return !!purchasedItem;
      }
      return false;
    }

    // If the feature has usage limits, check if the user has exceeded them
    if (
      feature.valueType === 'NUMERIC' &&
      !planItem.isUnlimited &&
      planItem.numericValue > 0
    ) {
      const usage = await this.userSubscriptionUsageRepository.findOne({
        where: {
          user_subscription_id: userSubscription.id,
          item_id: feature.id,
        },
      });

      if (usage && usage.usedCount >= planItem.numericValue) {
        return false;
      }
    }

    return true;
  }

  async recordFeatureUsage(
    userId: number,
    featureName: string,
    usageCount: number = 1,
    usageValue: number = 0,
  ): Promise<boolean> {
    // Implementation for recording usage
    // ...
  }
}
```

### Listing Expiration Check

```typescript
// property.service.ts
@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private subscriptionFeatureService: SubscriptionFeatureService,
  ) {}

  async isListingExpired(propertyId: string, userId: number): Promise<boolean> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId, user_id: userId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    // Get user's active subscription
    const userSubscription = await this.userSubscriptionRepository.findOne({
      where: {
        user_id: userId,
        isActive: true,
      },
      relations: ['plan', 'plan.planItems', 'plan.planItems.item'],
    });
     
    if (!userSubscription) return true; // No active subscription
     
    // Find the listing validity configuration
    const listingValidityItem = userSubscription.plan.planItems.find(
      pi => pi.item.name === 'Listing Validity' && pi.isIncluded
    );
     
    if (!listingValidityItem) return true;
     
    // Calculate expiration
    const expirationDate = new Date(property.createdAt);
    expirationDate.setDate(expirationDate.getDate() + listingValidityItem.durationDays);
     
    return new Date() > expirationDate;
  }

  async getPremiumListingEndDate(propertyId: string, userId: number): Promise<Date | null> {
    // Implementation to get premium listing end date
    // ...
  }
}
```

### Boosting Posts

```typescript
// property-boost.service.ts
@Injectable()
export class PropertyBoostService {
  constructor(
    @InjectRepository(UserSubscription)
    private userSubscriptionRepository: Repository<UserSubscription>,
    @InjectRepository(SubscriptionItem)
    private subscriptionItemRepository: Repository<SubscriptionItem>,
    @InjectRepository(SubscriptionPlanItem)
    private subscriptionPlanItemRepository: Repository<SubscriptionPlanItem>,
    @InjectRepository(UserSubscriptionUsage)
    private userSubscriptionUsageRepository: Repository<UserSubscriptionUsage>,
    @InjectRepository(UserPurchasedItem)
    private userPurchasedItemRepository: Repository<UserPurchasedItem>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
  ) {}

  async boostProperty(
    userId: number, 
    propertyId: string, 
    boostType: string
  ): Promise<void> {
    // Get user's active subscription
    const userSub = await this.userSubscriptionRepository.findOne({
      where: { user_id: userId, isActive: true },
      relations: ['plan', 'purchasedItems', 'purchasedItems.item']
    });
     
    if (!userSub) throw new BadRequestException('No active subscription');
     
    // Check if the boost type exists
    const boostItem = await this.subscriptionItemRepository.findOne({
      where: { name: boostType, isActive: true }
    });
     
    if (!boostItem) throw new BadRequestException('Boost type not found');
     
    // Check if it's included in the plan
    const planIncludesBoost = await this.subscriptionPlanItemRepository.findOne({
      where: {
        plan_id: userSub.plan_id,
        item_id: boostItem.id,
        isIncluded: true
      }
    });
     
    if (planIncludesBoost) {
      // Check if user has free boosts available in their plan
      const usage = await this.userSubscriptionUsageRepository.findOne({
        where: {
          user_subscription_id: userSub.id,
          item_id: boostItem.id
        }
      });
       
      if (!usage) {
        // Create new usage record
        await this.userSubscriptionUsageRepository.save({
          user_subscription_id: userSub.id,
          item_id: boostItem.id,
          usedCount: 1,
          lastUsedAt: new Date()
        });
      } else if (usage.usedCount < planIncludesBoost.numericValue || planIncludesBoost.isUnlimited) {
        // Update usage count
        await this.userSubscriptionUsageRepository.update(
          usage.id, 
          { 
            usedCount: usage.usedCount + 1,
            lastUsedAt: new Date()
          }
        );
      } else {
        throw new BadRequestException('Boost limit reached for your plan');
      }
    } else {
      // Check if user has purchased this boost
      const purchasedBoost = userSub.purchasedItems.find(
        pi => pi.item_id === boostItem.id && pi.isActive && new Date() <= pi.endDate
      );
       
      if (!purchasedBoost) {
        throw new BadRequestException('You need to purchase this boost');
      }
       
      // Apply the purchased boost to this property
      await this.userPurchasedItemRepository.update(
        purchasedBoost.id,
        { appliedTo: propertyId }
      );
    }
     
    // Get boost duration in days
    const boostDurationDays = planIncludesBoost 
      ? planIncludesBoost.durationDays 
      : boostItem.defaultValue;
    
    // Calculate end date
    const boostEndDate = new Date();
    boostEndDate.setDate(boostEndDate.getDate() + boostDurationDays);
     
    // Apply the boost to the property
    await this.propertyRepository.update(propertyId, {
      isBoosted: true,
      boostType: boostType,
      boostEndDate: boostEndDate
    });
  }
}
```

## Front-end Integration

The subscription system can be integrated with various front-end frameworks. Here are some key integration points:

### Public Plan Display Component

```jsx
// React component example for displaying subscription plans
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get('/api/public/plans');
        setPlans(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);
  
  if (loading) return <div>Loading plans...</div>;
  
  return (
    <div className="plans-container">
      <div className="row">
        {plans.map(plan => (
          <div className="col-md-4" key={plan.id}>
            <div className={`card plan-card ${plan.isPopular ? 'popular' : ''}`}>
              {plan.isPopular && (
                <div className="popular-badge">
                  <span>Most Popular</span>
                </div>
              )}
              <div className="card-body">
                <h5 className="card-title">{plan.name}</h5>
                <p className="text-muted">{plan.tagline}</p>
                <div className="pricing">
                  <h2>₹{plan.price}</h2>
                  <span>/month</span>
                </div>
                
                <ul className="features-list">
                  {plan.features.map((feature, index) => (
                    <li key={index} className={feature.isHighlighted ? 'highlighted' : ''}>
                      {feature.isIncluded ? (
                        <i className="fas fa-check-circle text-success"></i>
                      ) : (
                        <i className="fas fa-times-circle text-danger"></i>
                      )}
                      {feature.value ? (
                        <span><strong>{feature.value}</strong> {feature.name}</span>
                      ) : (
                        <span>{feature.name}</span>
                      )}
                    </li>
                  ))}
                </ul>
                
                <button 
                  className={`btn btn-${plan.isPopular ? 'primary' : 'outline-primary'} w-100 mt-4`}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
```

### Feature Access Hook

```jsx
// React hook for checking feature access
import { useState, useEffect } from 'react';
import axios from 'axios';

export const useFeatureAccess = (featureName) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/me/features/${featureName}/access`);
        setHasAccess(response.data.data.hasAccess);
        setDetails(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setHasAccess(false);
        setLoading(false);
      }
    };

    checkAccess();
  }, [featureName]);

  return { hasAccess, loading, error, details };
};

// Usage example
const VideoUploadButton = () => {
  const { hasAccess, loading, details } = useFeatureAccess('Video Upload');
  
  if (loading) return <div>Loading...</div>;
  
  return hasAccess ? (
    <button className="btn btn-primary">Upload Video</button>
  ) : (
    <div className="upgrade-prompt">
      <p>Video upload requires a higher plan.</p>
      <button className="btn btn-outline-primary">Upgrade Plan</button>
    </div>
  );
};
```

## Conclusion

This documentation provides a comprehensive guide to implementing the Real Estate Subscription Management System. The system is designed to be flexible, allowing for dynamic configuration of subscription plans, features, and add-ons without requiring code changes.

By following the entity design, API structure, and implementation strategies outlined here, you can build a robust subscription management system that supports various pricing models, feature sets, and add-on marketplaces.

The modular architecture allows for easy extension and customization to meet specific business requirements, while the robust feature access control system ensures that users only have access to the features included in their subscription plan or purchased as add-ons.
