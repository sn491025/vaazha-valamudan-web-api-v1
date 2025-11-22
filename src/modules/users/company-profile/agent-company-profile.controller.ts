import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  ConflictException,
  UseGuards,
  UseInterceptors,
  UploadedFiles
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AgentCompanyProfileService } from './service/agent-company-profile.service';
import { CreateAgentCompanyProfileDto } from './dto/create-agent-company-profile.dto';
import { UpdateAgentCompanyProfileDto } from './dto/update-agent-company-profile.dto';
import { ValidateProfileNameDto } from './dto/validate-profile-name.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { UploadLogoMetaType } from './type/upload-logo-meta.type';
import type { UploadedFile } from '../../property/property-media/types/uploaded-file';

@ApiTags('Agent Company Profiles')
@Controller('agent-company-profiles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
export class AgentCompanyProfileController {
  constructor(private readonly agentCompanyProfileService: AgentCompanyProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get all agent company profiles' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns all agent company profiles' })
  findAll(@Query('isActive') isActive?: boolean) {
    const filters = {};

    if (isActive !== undefined) {
      filters['isActive'] = isActive;
    }

    return this.agentCompanyProfileService.findAll(filters);
  }

  @Get('by-user/:userId')
  @ApiOperation({ summary: 'Get all agent company profiles by user id' })
  @ApiParam({ name: 'userId', required: true, type: String, description: 'User ID' })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Returns all agent company profiles' })
  findAllByUser(@Param('userId') userId: string, @Query('isActive') isActive?: boolean) {
    const filters = {};

    if (isActive !== undefined) {
      filters['isActive'] = isActive;
    }

    return this.agentCompanyProfileService.findAllByUserId(userId, filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get agent company profile by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Agent company profile ID' })
  @ApiResponse({ status: 200, description: 'Returns the agent company profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findOne(@Param('id') id: string) {
    return this.agentCompanyProfileService.findOne(id);
  }

  @Get('by-profile/:profileName')
  @ApiOperation({ summary: 'Get agent company profile by profile name' })
  @ApiParam({ name: 'profileName', required: true, description: 'Profile name' })
  @ApiResponse({ status: 200, description: 'Returns the agent company profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  findByProfileName(@Param('profileName') profileName: string) {
    return this.agentCompanyProfileService.findByProfileName(profileName);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new agent company profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 409, description: 'Profile name already exists' })
  async create(@Body() createAgentCompanyProfileDto: CreateAgentCompanyProfileDto) {
    if (createAgentCompanyProfileDto.profileName) {
      const exists = await this.agentCompanyProfileService.checkProfileNameExists(
        createAgentCompanyProfileDto.profileName
      );

      if (exists) {
        throw new ConflictException('Profile name already exists');
      }
    }

    return this.agentCompanyProfileService.create(createAgentCompanyProfileDto);
  }

  @Post('validate-profile-name')
  @ApiOperation({ summary: 'Validate if profile name is available' })
  @ApiResponse({ status: 200, description: 'Returns availability status of the profile name' })
  async validateProfileName(@Body() dto: ValidateProfileNameDto) {
    const exists = await this.agentCompanyProfileService.checkProfileNameExists(dto.profileName);

    return {
      profileName: dto.profileName,
      isAvailable: !exists
    };
  }

  @Post(':id/logo')
  @ApiOperation({ summary: 'Upload company logo' })
  @ApiParam({ name: 'id', required: true, description: 'Agent company profile ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string' },
        description: { type: 'string' },
        is_primary: { type: 'boolean' },
        media_category: { type: 'string' },
        sort_order: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Logo uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @UseInterceptors(FilesInterceptor('file', 1))
  @ApiConsumes('multipart/form-data')
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFiles() file: UploadedFile,
    @Body() meta?: UploadLogoMetaType,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.agentCompanyProfileService.uploadLogo(id, file[0], meta);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update agent company profile' })
  @ApiParam({ name: 'id', required: true, description: 'Agent company profile ID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiResponse({ status: 409, description: 'Profile name already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateAgentCompanyProfileDto: UpdateAgentCompanyProfileDto,
  ) {
    if (updateAgentCompanyProfileDto.profileName) {
      const exists = await this.agentCompanyProfileService.checkProfileNameExistsForOthers(
        updateAgentCompanyProfileDto.profileName,
        id
      );

      if (exists) {
        throw new ConflictException('Profile name already exists');
      }
    }

    return this.agentCompanyProfileService.update(id, updateAgentCompanyProfileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete agent company profile' })
  @ApiParam({ name: 'id', required: true, description: 'Agent company profile ID' })
  @ApiResponse({ status: 200, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  remove(@Param('id') id: string) {
    return this.agentCompanyProfileService.remove(id);
  }
}