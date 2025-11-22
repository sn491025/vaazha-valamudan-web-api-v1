import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Add Property entity import for FavoriteService
import { Property } from '../property/entities/properties.entity';

// Entities
import { SavedSearch } from './entities/saved-search.entity';
import { Favorite } from './entities/favorite.entity';
import { Enquiry } from './entities/enquiry.entity';
import { LeadStatus } from './entities/lead-status.entity';

// Controllers
import { SavedSearchController } from './saved-search/saved-search.controller';
import { FavoriteController } from './favorite/favorite.controller';
import { EnquiryController } from './enquiry/enquiry.controller';

// Services
import { SavedSearchService } from './saved-search/services/saved-search.service';
import { FavoriteService } from './favorite/services/favorite.service';
import { EnquiryService } from './enquiry/services/enquiry.service';

const services = [
  SavedSearchService,
  FavoriteService,
  EnquiryService,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SavedSearch,
      Favorite,
      Enquiry,
      LeadStatus,
      Property,
    ]),
  ],
  controllers: [
    SavedSearchController,
    FavoriteController,
    EnquiryController,
  ],
  providers: services,
  exports: [
    ...services,
    TypeOrmModule,
  ],
})
export class UserInteractionsModule {}
