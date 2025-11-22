import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { AgentCompanyProfile } from '../../entities/agent-company-profile.entity';
import { S3StorageService } from '../../../shared/storage/s3-storage.service';
import { CreateAgentCompanyProfileDto } from '../dto/create-agent-company-profile.dto';
import { UpdateAgentCompanyProfileDto } from '../dto/update-agent-company-profile.dto';
import { UploadedFile } from '../../../property/property-media/types/uploaded-file';
import { UploadLogoMetaType } from '../type/upload-logo-meta.type';

@Injectable()
export class AgentCompanyProfileService {
  constructor(
    @InjectRepository(AgentCompanyProfile)
    private readonly agentCompanyProfileRepository: Repository<AgentCompanyProfile>,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async findAll(filters?: any) {
    return this.agentCompanyProfileRepository.find({
      where: filters,
      order: { updatedAt: 'DESC' },
    });
  }

  async findAllByUserId(userId: string, filters?: any) {
    filters['userId'] = userId;
    console.log(filters);
    return this.agentCompanyProfileRepository.find({
      where: filters,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const profile = await this.agentCompanyProfileRepository.findOne({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException(`Agent company profile with ID ${id} not found`);
    }

    return profile;
  }

  async findByProfileName(profileName: string) {
    const profile = await this.agentCompanyProfileRepository.findOne({
      where: { profileName },
    });

    if (!profile) {
      throw new NotFoundException(`Profile with name ${profileName} not found`);
    }

    return profile;
  }

  async checkProfileNameExists(profileName: string): Promise<boolean> {
    const count = await this.agentCompanyProfileRepository.count({
      where: { profileName },
    });
    return count > 0;
  }

  async checkProfileNameExistsForOthers(profileName: string, currentId: string): Promise<boolean> {
    const count = await this.agentCompanyProfileRepository.count({
      where: {
        profileName,
        id: Not(currentId)
      },
    });
    return count > 0;
  }

  async create(createAgentCompanyProfileDto: CreateAgentCompanyProfileDto) {
    // Calculate expiry date if expiryDays is provided
    let expiryDate: Date | undefined;
    if (createAgentCompanyProfileDto.expiryDays) {
      expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + createAgentCompanyProfileDto.expiryDays);
    }

    const profile = this.agentCompanyProfileRepository.create({
      ...createAgentCompanyProfileDto,
      expiryDate,
    });

    return this.agentCompanyProfileRepository.save(profile);
  }

  async uploadLogo(
    profileId: string,
    file: UploadedFile,
    meta?: UploadLogoMetaType
  ) {
    // Verify profile exists
    const profile = await this.findOne(profileId);

    // Validate file type
    if (!file.mimetype?.match(/^image\/(jpeg|png|gif|jpg|webp)$/)) {
      throw new BadRequestException('Invalid file type. Only images are allowed');
    }

    // Set max file size (5MB)
    //const maxSize = 5 * 1024 * 1024;
    //if (file.size > maxSize) {
    //  throw new BadRequestException('File size exceeds the 5MB limit');
    //}

    const key = `agent-profiles/${profileId}/logo/${Date.now()}-${(file.originalname || 'logo').replace(/\s+/g, '_')}`;

    // Upload to S3
    const uploadResult = await this.s3StorageService.upload({
      key,
      body: file.buffer,
      contentType: file.mimetype,
      acl: 'public-read',
      metadata: {
        profileId,
        original_filename: file.originalname || '',
        title: meta?.title || '',
        description: meta?.description || '',
        media_category: meta?.media_category || 'logo',
      },
    });

    // Update profile with logo URL
    profile.companyLogo = uploadResult.url;

    // Save updated profile
    const savedProfile = await this.agentCompanyProfileRepository.save(profile);

    return {
      url: uploadResult.url,
      profile: savedProfile
    };
  }

  async update(id: string, updateAgentCompanyProfileDto: UpdateAgentCompanyProfileDto) {
    const profile = await this.findOne(id);

    if (updateAgentCompanyProfileDto.expiryDays) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + updateAgentCompanyProfileDto.expiryDays);
      updateAgentCompanyProfileDto['expiryDate'] = expiryDate;
    }

    Object.assign(profile, updateAgentCompanyProfileDto);

    return this.agentCompanyProfileRepository.save(profile);
  }

  async remove(id: string) {
    const profile = await this.findOne(id);

    if (profile.companyLogoKey) {
      try {
        await this.s3StorageService.delete({ key: profile.companyLogoKey });
      } catch (error) {
        console.error('Error deleting logo from S3:', error);
      }
    }

    return this.agentCompanyProfileRepository.remove(profile);
  }
}