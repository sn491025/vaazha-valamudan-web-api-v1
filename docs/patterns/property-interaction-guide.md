# Property Interaction Features Implementation Guide

This guide outlines the implementation of property interaction features for your real estate application using NestJS.

## Table of Contents
- [Module Structure](#module-structure)
- [Entities](#entities)
- [DTOs](#dtos)
- [Controllers & Endpoints](#controllers--endpoints)
- [Implementation Steps](#implementation-steps)

## Module Structure

Following your existing pattern, we'll add these features as submodules within the property module:

```
property/
  ├── property-saved-search/
  │   ├── dto/
  │   ├── services/
  │   └── property-saved-search.controller.ts
  │
  ├── property-favorite/
  │   ├── dto/
  │   ├── services/ 
  │   └── property-favorite.controller.ts
  │
  ├── property-enquiry/
  │   ├── dto/
  │   ├── services/
  │   └── property-enquiry.controller.ts
  │
  ├── property-lead/
  │   ├── dto/
  │   ├── services/
  │   └── property-lead.controller.ts
  │
  ├── property-notification/
  │   ├── dto/
  │   ├── services/
  │   └── property-notification.controller.ts
  │
  ├── property-stats/
  │   ├── dto/
  │   ├── services/
  │   └── property-stats.controller.ts
  │
  ├── entities/
  │   ├── existing entities...
  │   ├── property-saved-search.entity.ts
  │   ├── property-favorite.entity.ts
  │   ├── property-enquiry.entity.ts
  │   └── property-lead-status.entity.ts
  │
  └── property.module.ts (updated to include new submodules)
```

## Entities

### property-saved-search.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('property_saved_searches')
export class PropertySavedSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column('jsonb')
  searchCriteria: Record<string, any>;

  @Column({ nullable: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: true })
  notifyOnNew: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### property-favorite.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../entities/properties.entity';

@Entity('property_favorites')
export class PropertyFavorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Property)
  property: Property;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### property-enquiry.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Property } from '../entities/properties.entity';

@Entity('property_enquiries')
export class PropertyEnquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Property)
  property: Property;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column('text')
  message: string;

  @Column({ default: 'new' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### property-lead-status.entity.ts

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PropertyEnquiry } from './property-enquiry.entity';

@Entity('property_lead_statuses')
export class PropertyLeadStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PropertyEnquiry)
  enquiry: PropertyEnquiry;

  @Column()
  status: string;

  @Column('text', { nullable: true })
  notes: string;

  @ManyToOne(() => User)
  assignedTo: User;

  @Column({ type: 'timestamp', nullable: true })
  followUpDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

## DTOs

### Property Saved Search DTOs

**CreateSavedSearchDto**
```typescript
export class CreateSavedSearchDto {
  @IsObject()
  searchCriteria: Record<string, any>;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  notifyOnNew?: boolean = true;
}
```

**UpdateSavedSearchDto**
```typescript
export class UpdateSavedSearchDto {
  @IsObject()
  @IsOptional()
  searchCriteria?: Record<string, any>;

  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyOnNew?: boolean;
}
```

**SavedSearchResponseDto**
```typescript
export class SavedSearchResponseDto {
  id: string;
  searchCriteria: Record<string, any>;
  name: string;
  isActive: boolean;
  notifyOnNew: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Property Favorite DTOs

**ToggleFavoriteDto**
```typescript
export class ToggleFavoriteDto {
  @IsUUID()
  propertyId: string;
}
```

**FavoriteResponseDto**
```typescript
export class FavoriteResponseDto {
  id: string;
  property: PropertyResponseDto;
  createdAt: Date;
}
```

### Property Enquiry DTOs

**CreateEnquiryDto**
```typescript
export class CreateEnquiryDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  message: string;
}
```

**EnquiryResponseDto**
```typescript
export class EnquiryResponseDto {
  id: string;
  property: PropertyResponseDto;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Property Lead DTOs

**UpdateLeadStatusDto**
```typescript
export class UpdateLeadStatusDto {
  @IsString()
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  assignedToId?: string;

  @IsDate()
  @IsOptional()
  followUpDate?: Date;
}
```

**LeadStatusResponseDto**
```typescript
export class LeadStatusResponseDto {
  id: string;
  enquiry: EnquiryResponseDto;
  status: string;
  notes?: string;
  assignedTo: UserResponseDto;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Property Notification DTOs

**NotificationSettingsDto**
```typescript
export class NotificationSettingsDto {
  @IsBoolean()
  @IsOptional()
  emailNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  pushNotifications?: boolean;

  @IsBoolean()
  @IsOptional()
  newPropertyMatches?: boolean;

  @IsBoolean()
  @IsOptional()
  enquiryResponses?: boolean;

  @IsBoolean()
  @IsOptional()
  priceChanges?: boolean;
}
```

**NotificationResponseDto**
```typescript
export class NotificationResponseDto {
  id: string;
  type: string;
  message: string;
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  createdAt: Date;
}
```

### Property Stats DTOs

**AgentStatsResponseDto**
```typescript
export class AgentStatsResponseDto {
  totalListings: number;
  activeListings: number;
  totalEnquiries: number;
  newEnquiries: number;
  responseRate: number;
  avgResponseTime: number;
  conversionRate: number;
}
```

**PropertyStatsResponseDto**
```typescript
export class PropertyStatsResponseDto {
  views: number;
  favorites: number;
  enquiries: number;
  daysListed: number;
  viewsPerDay: number;
  compareToSimilar: {
    views: number;
    favorites: number;
    enquiries: number;
  };
}
```

## Controllers & Endpoints

### property-saved-search.controller.ts

```typescript
@Controller('property/saved-searches')
export class PropertySavedSearchController {
  constructor(private readonly savedSearchService: PropertySavedSearchService) {}

  @Get()
  findAll(@Request() req) {
    return this.savedSearchService.findAllByUser(req.user.id);
  }

  @Post()
  create(@Body() createSavedSearchDto: CreateSavedSearchDto, @Request() req) {
    return this.savedSearchService.create(createSavedSearchDto, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateSavedSearchDto: UpdateSavedSearchDto,
    @Request() req,
  ) {
    return this.savedSearchService.update(id, updateSavedSearchDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.savedSearchService.remove(id, req.user.id);
  }

  @Get(':id/properties')
  getMatchingProperties(@Param('id') id: string, @Request() req) {
    return this.savedSearchService.getMatchingProperties(id, req.user.id);
  }
}
```

### property-favorite.controller.ts

```typescript
@Controller('property/favorites')
export class PropertyFavoriteController {
  constructor(private readonly favoriteService: PropertyFavoriteService) {}

  @Get()
  findAll(@Request() req) {
    return this.favoriteService.findAllByUser(req.user.id);
  }

  @Post()
  create(@Body() toggleFavoriteDto: ToggleFavoriteDto, @Request() req) {
    return this.favoriteService.addFavorite(
      toggleFavoriteDto.propertyId,
      req.user.id,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.favoriteService.removeFavorite(id, req.user.id);
  }

  @Post('toggle')
  toggle(@Body() toggleFavoriteDto: ToggleFavoriteDto, @Request() req) {
    return this.favoriteService.toggleFavorite(
      toggleFavoriteDto.propertyId,
      req.user.id,
    );
  }
}
```

### property-enquiry.controller.ts

```typescript
@Controller('property/enquiries')
export class PropertyEnquiryController {
  constructor(private readonly enquiryService: PropertyEnquiryService) {}

  @Get()
  @Roles('admin', 'agent')
  findAll(@Query() paginationDto: PaginationDto) {
    return this.enquiryService.findAll(paginationDto);
  }

  @Post()
  create(@Body() createEnquiryDto: CreateEnquiryDto, @Request() req) {
    return this.enquiryService.create(createEnquiryDto, req.user?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.enquiryService.findOne(id, req.user);
  }

  @Get('my-enquiries')
  findMyEnquiries(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.enquiryService.findAllByUser(req.user.id, paginationDto);
  }
}
```

### property-lead.controller.ts

```typescript
@Controller('property/leads')
export class PropertyLeadController {
  constructor(private readonly leadService: PropertyLeadService) {}

  @Get()
  @Roles('admin', 'agent')
  findAll(@Query() filterDto: LeadFilterDto, @Request() req) {
    return this.leadService.findAll(filterDto, req.user);
  }

  @Get('stats')
  @Roles('admin', 'agent')
  getStats(@Request() req) {
    return this.leadService.getLeadStats(req.user);
  }

  @Put(':id/status')
  @Roles('admin', 'agent')
  updateStatus(
    @Param('id') id: string,
    @Body() updateLeadStatusDto: UpdateLeadStatusDto,
    @Request() req,
  ) {
    return this.leadService.updateLeadStatus(id, updateLeadStatusDto, req.user);
  }

  @Post(':id/notes')
  @Roles('admin', 'agent')
  addNote(
    @Param('id') id: string,
    @Body() addNoteDto: AddNoteDto,
    @Request() req,
  ) {
    return this.leadService.addNote(id, addNoteDto, req.user);
  }

  @Get(':id/history')
  @Roles('admin', 'agent')
  getHistory(@Param('id') id: string, @Request() req) {
    return this.leadService.getLeadHistory(id, req.user);
  }
}
```

### property-notification.controller.ts

```typescript
@Controller('property/notifications')
export class PropertyNotificationController {
  constructor(
    private readonly notificationService: PropertyNotificationService,
  ) {}

  @Get()
  findAll(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.notificationService.findAllByUser(req.user.id, paginationDto);
  }

  @Put('settings')
  updateSettings(
    @Body() notificationSettingsDto: NotificationSettingsDto,
    @Request() req,
  ) {
    return this.notificationService.updateSettings(
      notificationSettingsDto,
      req.user.id,
    );
  }

  @Post('mark-read')
  markAsRead(@Body() markReadDto: MarkNotificationsReadDto, @Request() req) {
    return this.notificationService.markAsRead(markReadDto.ids, req.user.id);
  }
}
```

### property-stats.controller.ts

```typescript
@Controller('property/stats')
export class PropertyStatsController {
  constructor(private readonly statsService: PropertyStatsService) {}

  @Get('agent/:id')
  getAgentStats(@Param('id') id: string) {
    return this.statsService.getAgentStats(id);
  }

  @Get('property/:id')
  getPropertyStats(@Param('id') id: string) {
    return this.statsService.getPropertyStats(id);
  }

  @Get('dashboard')
  @Roles('admin', 'agent')
  getDashboardStats(@Request() req) {
    return this.statsService.getDashboardStats(req.user);
  }
}
```

## Implementation Steps

1. **Create Entities**
   - Add the entity files to `property/entities/`
   - Run TypeORM migration to create database tables

2. **Create DTOs**
   - Create DTO folders for each submodule
   - Implement all required DTOs with validation

3. **Create Services**
   - Implement service logic for each submodule
   - Handle database operations, filtering, and business logic

4. **Create Controllers**
   - Implement controllers with endpoints as defined above
   - Add proper validation and authorization

5. **Update Property Module**
   - Update `property.module.ts` to include all new controllers and services
   - Set up proper dependency injection

6. **Add Migrations**
   - Generate and run migrations to update database schema

7. **Test Endpoints**
   - Test all endpoints for proper functionality
   - Ensure proper error handling and validation

8. **Add Redis Caching**
   - Implement caching strategies for frequently accessed data
   - Cache property searches and statistics
