import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { PropertyMedia } from '../../entities/property-media.entity';
import { PropertyMediaDto } from '../dto/property-media.dto';
import { UpdatePropertyMediaDto } from '../dto/update-property-media.dto';
import { S3StorageService } from '../../../shared/storage/s3-storage.service';
import { UploadMediaMeta } from '../types/upload-media-meta';
import { UploadedFile } from '../types/uploaded-file';

@Injectable()
export class PropertyMediaService {
  constructor(
    @InjectRepository(PropertyMedia) private readonly mediaRepo: Repository<PropertyMedia>,
    private readonly s3: S3StorageService,
  ) {}

  // Add media by URLs (no upload)
  async addMedia(propertyId: string, media: PropertyMediaDto[]) {
    const rows = (media || []).map((m) =>
      this.mediaRepo.create({
        property_id: propertyId,
        media_type: m.media_type,
        url: m.url,
        thumbnail_url: m.thumbnail_url,
        title: m.title,
        description: m.description,
        is_primary: !!m.is_primary,
        media_category: m.media_category,
        sort_order: m.sort_order ?? 0,
      } as any),
    );
    if (rows.length) await this.mediaRepo.save(rows as any);
    return this.mediaRepo.find({ where: { property_id: propertyId as any } });
  }

  // Upload files to S3 and add media rows
  async uploadAndAddMedia(
    propertyId: string,
    files: UploadedFile[],
    metas?: UploadMediaMeta[] | UploadMediaMeta,
  ) {
    const results: PropertyMedia[] = [];
    for (let i = 0; i < (files || []).length; i++) {
      const file = files[i];
      const meta = Array.isArray(metas) ? metas[i] : metas;

      const key = `properties/${propertyId}/${Date.now()}-${(file.originalname || 'upload').replace(/\s+/g, '_')}`;
      const uploaded = await this.s3.upload({
        key,
        body: file.buffer,
        contentType: file.mimetype,
        acl: 'public-read',
        metadata: {
          property_id: propertyId,
          original_filename: file.originalname || '',
        },
      });

      const row = this.mediaRepo.create({
        property_id: propertyId,
        media_type: meta?.media_type || 'IMAGE',
        url: uploaded.url,
        thumbnail_url: undefined,
        title: meta?.title,
        description: meta?.description,
        is_primary: !!meta?.is_primary,
        media_category: meta?.media_category,
        sort_order: meta?.sort_order ?? 0,
        original_filename: file.originalname || null,
        content_type: file.mimetype || null,
        file_size: file.size || null,
        key: key
      } as any);
      const saved = await this.mediaRepo.save(row as any);
      results.push(saved);
    }
    return results;
  }

  async updateMedia(propertyId: string, changes: UpdatePropertyMediaDto) {
    if (changes.removed?.length) {
      await this.mediaRepo.delete({ id: In(changes.removed), property_id: propertyId as any });
    }
    if (changes.added?.length) {
      await this.addMedia(propertyId, changes.added);
    }
    if (changes.updated?.length) {
      for (const upd of changes.updated) {
        await this.mediaRepo.update(
          { id: upd.id, property_id: propertyId as any },
          {
            title: upd.title,
            description: upd.description,
            is_primary: upd.is_primary,
            media_category: upd.media_category,
            sort_order: upd.sort_order,
          } as any,
        );
      }
    }
    return this.mediaRepo.find({ where: { property_id: propertyId as any } });
  }

  async removeMediaItem(propertyId: string, mediaId: string) {

    const media = await this.mediaRepo.findOne({ where: { id: mediaId as any, property_id: propertyId as any } });
    if (media) {
      await this.mediaRepo.delete({ id: mediaId as any, property_id: propertyId as any });
      if(media.key)
        await this.s3.delete({ key: media.key});
    }

    return { success: true };
  }
}