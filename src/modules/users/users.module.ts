import { Module } from '@nestjs/common';
import { ProfileController } from './profile/profile.controller';
import { ProfileService } from './profile/services/profile.service';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/services/roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Role } from './entities';
import { AgentCompanyProfileController } from './company-profile/agent-company-profile.controller';
import { AgentCompanyProfileService } from './company-profile/service/agent-company-profile.service';
import { AgentCompanyProfile } from './entities/agent-company-profile.entity';

const services = [ProfileService, RolesService, AgentCompanyProfileService];

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, AgentCompanyProfile])],
  controllers: [ProfileController, RolesController, AgentCompanyProfileController],
  providers: services,
  exports: [...services, TypeOrmModule]
})
export class UsersModule {}
