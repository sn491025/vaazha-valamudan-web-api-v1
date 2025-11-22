import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users';
import { MasterModule } from '../master';
import { UserInteractionsModule } from '../user-interactions/user-interactions.module';

// Entities
import { Ad } from './entities/ad.entity';
import { AdImage } from './entities/ad-image.entity';
import { AdReport } from './entities/ad-report.entity';
import { AdApproval } from './entities/ad-approval.entity';

// Controllers
import { AdController } from './ads/ad.controller';
import { AdImageController } from './ad-images/ad-image.controller';
import { AdApprovalController } from './ad-approval/ad-approval.controller';
import { AdReportController } from './ad-reports/ad-report.controller';

// Services
import { AdService } from './ads/services/ad.service';
import { AdImageService } from './ad-images/services/ad-image.service';
import { AdApprovalService } from './ad-approval/services/ad-approval.service';
import { AdReportService } from './ad-reports/services/ad-report.service';
import { S3StorageService } from '../shared/storage/s3-storage.service';
import { AuthModule } from '../auth';

const services = [
  AdService,
  AdImageService,
  AdApprovalService,
  AdReportService,
  S3StorageService,
];

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MasterModule,
    UserInteractionsModule,
    TypeOrmModule.forFeature([
      Ad,
      AdImage,
      AdReport,
      AdApproval,
    ]),
  ],
  controllers: [
    AdController,
    AdImageController,
    AdApprovalController,
    AdReportController,
  ],
  providers: services,
  exports: services,
})
export class AdsModule {}
