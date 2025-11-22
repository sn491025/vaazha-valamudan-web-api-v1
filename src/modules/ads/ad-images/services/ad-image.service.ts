import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdImage } from '../../entities/ad-image.entity';
import { Ad } from '../../entities/ad.entity';
import { UpdateAdImageDto } from '../dto/create-ad-image.dto';
import { S3StorageService } from '../../../shared/storage/s3-storage.service';
import { UploadedFile } from '../../../property/property-media/types/uploaded-file';
import type { UploadMediaMeta } from '../../../property/property-media/types/upload-media-meta';


@Injectable()
export class AdImageService {
  constructor(
    @InjectRepository(AdImage)
    private readonly adImageRepo: Repository<AdImage>,
    @InjectRepository(Ad)
    private readonly adRepo: Repository<Ad>,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async uploadImages(
    adId: string,
    files: UploadedFile[],
    metas?: UploadMediaMeta[] | UploadMediaMeta,
  ) {
    // Verify ad exists
    const ad = await this.adRepo.findOne({ where: { id: adId } });
    if (!ad) {
      throw new NotFoundException('Ad not found');
    }

    // Check current image count
    const currentImageCount = await this.adImageRepo.count({ where: { ad_id: adId } });
    const maxImages = parseInt(process.env.AD_MAX_IMAGES_PER_AD || '10');

    if (currentImageCount + (files?.length || 0) > maxImages) {
      throw new BadRequestException(`Maximum ${maxImages} images allowed per ad`);
    }

    const uploadedImages: AdImage[] = [];

    for (let i = 0; i < (files || []).length; i++) {
      const file = files[i];
      const m = Array.isArray(metas) ? metas[i] : metas;

      const key = `ads/${adId}/${Date.now()}-${(file.originalname || 'upload').replace(/\s+/g, '_')}`;

      // Upload to S3
      const uploadResult = await this.s3StorageService.upload({
        key,
        body: file.buffer,
        contentType: file.mimetype,
        acl: 'public-read',
        metadata: {
          adId: adId,
          original_filename: file.originalname || '',
        },
      });

      const isFirst = currentImageCount === 0 && uploadedImages.length === 0;
      let is_primary = isFirst;
      if (typeof m?.is_primary === 'boolean') is_primary = m.is_primary;

      // Create database record
      const imageData = {
        ad_id: adId,
        url: uploadResult.url,
        thumbnail_url: uploadResult.url, // placeholder; can be generated separately
        filename: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        sort_order: (m?.sort_order ?? (currentImageCount + uploadedImages.length)),
        is_primary,
        key,
        // title/description omitted unless present in entity
      };

      const image = this.adImageRepo.create(imageData as any);
      const savedImage = await this.adImageRepo.save(image as any);
      uploadedImages.push(savedImage);
    }

    return uploadedImages;
  }

  async findByAdId(adId: string) {
    return this.adImageRepo.find({
      where: { ad_id: adId },
      order: { sort_order: 'ASC', created_at: 'ASC' }
    });
  }

  async updateImage(imageId: string, updateDto: UpdateAdImageDto) {
    const image = await this.adImageRepo.findOne({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    // If setting as primary, unset other primary images for the same ad
    if (updateDto.is_primary) {
      await this.adImageRepo.update(
        { ad_id: image.ad_id },
        { is_primary: false }
      );
    }

    await this.adImageRepo.update(imageId, updateDto);
    return this.adImageRepo.findOne({ where: { id: imageId } });
  }

  async deleteImage(imageId: string) {
    const image = await this.adImageRepo.findOne({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.key) {
      try {
        await this.s3StorageService.delete({ key: image.key });
      } catch (error) {
        console.error('Failed to delete file from S3:', error);
      }
    }

    // Delete from database
    await this.adImageRepo.delete(imageId);

    // If this was the primary image, make the next image primary
    if (image.is_primary) {
      const nextImage = await this.adImageRepo.findOne({
        where: { ad_id: image.ad_id },
        order: { sort_order: 'ASC', created_at: 'ASC' }
      });
      if (nextImage) {
        await this.adImageRepo.update(nextImage.id, { is_primary: true });
      }
    }

    return { success: true };
  }

  async reorderImages(adId: string, imageIds: string[]) {
    // Verify all images belong to the ad
    const images = await this.adImageRepo.find({ where: { ad_id: adId } });
    const imageIdSet = new Set(images.map(img => img.id));

    for (const id of imageIds) {
      if (!imageIdSet.has(id)) {
        throw new BadRequestException(`Image ${id} does not belong to this ad`);
      }
    }

    // Update sort order
    for (let i = 0; i < imageIds.length; i++) {
      await this.adImageRepo.update(imageIds[i], { sort_order: i });
    }

    return this.findByAdId(adId);
  }

  async setPrimaryImage(adId: string, imageId: string) {
    // Verify image belongs to ad
    const image = await this.adImageRepo.findOne({ 
      where: { id: imageId, ad_id: adId } 
    });
    if (!image) {
      throw new NotFoundException('Image not found or does not belong to this ad');
    }

    // Unset all primary images for this ad
    await this.adImageRepo.update(
      { ad_id: adId },
      { is_primary: false }
    );

    // Set this image as primary
    await this.adImageRepo.update(imageId, { is_primary: true });

    return { success: true };
  }
}
