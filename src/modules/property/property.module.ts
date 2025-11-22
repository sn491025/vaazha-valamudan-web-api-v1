import { Module } from '@nestjs/common';
import { UsersModule } from '../users';
import { MasterModule } from '../master';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Property } from './entities/properties.entity';
import { PropertyReport } from './entities/property-report.entity';
import { PropertyApproval } from './entities/property-approval.entity';
import { PropertyMedia } from './entities/property-media.entity';
import { PropertyFeatureValue } from './entities/property-feature-value.entity';
import { PropertyController } from './properties/property.controller';
import { PropertyService } from './properties/services/property.service';
import { PropertyApprovalController } from './property-approval/property-approval.controller';
import { PropertyApprovalService } from './property-approval/services/property-approval.service';
import { PropertyReportController } from './property-report/property-report.controller';
import { PropertyReportService } from './property-report/services/property-report.service';
import { PropertySearchController } from './property-search/property-search.controller';
import { PropertySearchService } from './property-search/services/property-search.service';
import { PropertyMediaController } from './property-media/property-media.controller';
import { PropertyMediaService } from './property-media/services/property-media.service';
import { S3StorageService } from '../shared/storage/s3-storage.service';
import { UserInteractionsModule } from '../user-interactions/user-interactions.module';
import { AuthModule } from '../auth';

const services = [
  PropertyService,
  PropertyApprovalService,
  PropertyReportService,
  PropertySearchService,
  PropertyMediaService,
  S3StorageService,
];
@Module({
  imports: [
    AuthModule,
    UsersModule,
    MasterModule,
    UserInteractionsModule,
    TypeOrmModule.forFeature([
      Property,
      PropertyReport,
      PropertyApproval,
      PropertyMedia,
      PropertyFeatureValue,
    ]),
  ],
  controllers: [
    PropertyController,
    PropertyApprovalController,
    PropertyReportController,
    PropertySearchController,
    PropertyMediaController,
  ],
  providers: services,
  exports: services,
})
export class PropertyModule {}