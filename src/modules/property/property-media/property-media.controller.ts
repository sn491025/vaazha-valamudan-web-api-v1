import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PropertyMediaService } from './services/property-media.service';
import { PropertyMediaDto } from './dto/property-media.dto';
import { UpdatePropertyMediaDto } from './dto/update-property-media.dto';
import type { UploadMediaMeta } from './types/upload-media-meta';
import type { UploadedFile } from './types/uploaded-file';

@ApiTags('property-media')
@Controller('property-media')
export class PropertyMediaController {
  constructor(private readonly service: PropertyMediaService) {}

  @Post(':propertyId')
  @ApiOperation({ summary: 'Add media by URLs (no upload)' })
  @ApiParam({ name: 'propertyId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiBody({
    description: 'Array of media items with external URLs (e.g., YouTube or CDN links)',
    type: [PropertyMediaDto],
    examples: {
      sample: {
        summary: 'Add external links',
        value: [
          { media_type: 'VIDEO', url: 'https://youtube.com/watch?v=xyz', title: 'Tour' },
          { media_type: 'IMAGE', url: 'https://cdn.example.com/img1.jpg', is_primary: true },
        ],
      },
    },
  })
  async addByUrls(
    @Param('propertyId') propertyId: string,
    @Body() items: PropertyMediaDto[],
  ) {
    return this.service.addMedia(propertyId, items || []);
  }

  @Post(':propertyId/upload')
  @ApiOperation({ summary: 'Upload media files to S3 and attach to property' })
  @ApiParam({ name: 'propertyId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiBody({
    description: 'Upload one or more files with per-file metadata in items[] aligned by file order',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        items: {
          type: 'array',
          description: 'Array of metadata aligned by index to files[]',
          items: {
            type: 'object',
            properties: {
              media_type: { type: 'string', enum: ['IMAGE', 'VIDEO', 'DOCUMENT', 'FLOOR_PLAN', 'VIRTUAL_TOUR', '3D_MODEL'], default: 'IMAGE' },
              title: { type: 'string' },
              description: { type: 'string' },
              is_primary: { type: 'boolean', default: false },
              media_category: { type: 'string', example: 'EXTERIOR' },
              sort_order: { type: 'number', example: 1 },
            },
          },
        },
      },
      required: ['files'],
    },
    examples: {
      single: {
        summary: 'Single file with metadata',
        value: {
          items: [{ media_type: 'IMAGE', title: 'Front', description: 'Main facade', is_primary: true, sort_order: 0 }],
        },
      },
      multiple: {
        summary: 'Multiple files with per-file metadata',
        value: {
          items: [
            { media_type: 'IMAGE', title: 'Front', description: 'Main facade', is_primary: true, sort_order: 0, media_category: 'EXTERIOR' },
            { media_type: 'IMAGE', title: 'Living Room', description: 'Interior shot', is_primary: false, sort_order: 1, media_category: 'INTERIOR' },
          ],
        },
      },
      rawString: {
        summary: 'Multipart note',
        value: {
          items: '[{"media_type":"IMAGE","title":"Front"},{"media_type":"IMAGE","title":"Back"}]',
        },
      },
    },
  })
  async upload(
    @Param('propertyId') propertyId: string,
    @UploadedFiles() files: UploadedFile[],
    @Body() body: any,
  ) {
    const toArray = (v: any) => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
    const toBool = (v: any): boolean | undefined => {
      if (v === undefined || v === null || v === '') return undefined;
      if (typeof v === 'boolean') return v;
      if (typeof v === 'number') return v !== 0;
      if (typeof v === 'string') {
        const s = v.trim().toLowerCase();
        if (['true', '1', 'on', 'yes', 'y'].includes(s)) return true;
        if (['false', '0', 'off', 'no', 'n'].includes(s)) return false;
      }
      return undefined;
    };
    const toNum = (v: any) => {
      if (v === undefined || v === null || v === '') return undefined;
      const n = Number(v);
      return Number.isNaN(n) ? undefined : n;
    };
    const normItem = (x: any): UploadMediaMeta => {
      const o = x || {};
      return {
        media_type: o.media_type ?? o.mediaType,
        title: o.title,
        description: o.description,
        is_primary: toBool(o.is_primary ?? o.isPrimary),
        media_category: o.media_category ?? o.mediaCategory,
        sort_order: toNum(o.sort_order ?? o.sortOrder),
      } as UploadMediaMeta;
    };

    const normalizeItems = (b: any, count: number): UploadMediaMeta[] | undefined => {
      const raw = b?.items;

      // Case 1: array (objects or JSON strings)
      if (Array.isArray(raw)) {
        const arr = raw
          .map((x) => {
            if (typeof x === 'string') {
              try {
                return normItem(JSON.parse(x));
              } catch {
                return undefined;
              }
            }
            if (x && typeof x === 'object') return normItem(x);
            return undefined;
          })
          .filter(Boolean) as UploadMediaMeta[];
        return arr.slice(0, count);
      }

      // Case 2: JSON string
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.map(normItem).slice(0, count);
          if (parsed && typeof parsed === 'object') {
            const keys = Object.keys(parsed).sort((a, z) => Number(a) - Number(z));
            return keys.slice(0, count).map((k) => normItem((parsed as any)[k]));
          }
        } catch {
          // ignore and try other shapes
        }
      }

      // Case 3: object keyed by indices
      if (raw && typeof raw === 'object') {
        const keys = Object.keys(raw).sort((a, z) => Number(a) - Number(z));
        const arr = keys.map((k) => normItem((raw as any)[k]));
        return arr.slice(0, count);
      }

      // Case 4: parallel arrays
      const mediaTypes = toArray(b?.media_types ?? b?.mediaType ?? b?.media_type);
      const titles = toArray(b?.titles ?? b?.title);
      const descriptions = toArray(b?.descriptions ?? b?.description);
      const primaries = toArray(b?.is_primaries ?? b?.isPrimary ?? b?.is_primary);
      const categories = toArray(b?.media_categories ?? b?.mediaCategory ?? b?.media_category);
      const sortOrders = toArray(b?.sort_orders ?? b?.sortOrder ?? b?.sort_order);

      const hasAny =
        mediaTypes.length +
          titles.length +
          descriptions.length +
          primaries.length +
          categories.length +
          sortOrders.length >
        0;

      if (!hasAny) return undefined;

      const out: UploadMediaMeta[] = [];
      for (let i = 0; i < count; i++) {
        out.push({
          media_type: mediaTypes[i],
          title: titles[i],
          description: descriptions[i],
          is_primary: toBool(primaries[i]),
          media_category: categories[i],
          sort_order: toNum(sortOrders[i]),
        } as UploadMediaMeta);
      }
      return out;
    };

    const items = normalizeItems(body, (files || []).length);

    return this.service.uploadAndAddMedia(propertyId, files || [], items);
  }

  @Patch(':propertyId')
  @ApiOperation({ summary: 'Update property media metadata, add or remove' })
  @ApiParam({ name: 'propertyId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiBody({ description: 'Media update payload', type: UpdatePropertyMediaDto })
  async update(
    @Param('propertyId') propertyId: string,
    @Body() changes: UpdatePropertyMediaDto,
  ) {
    return this.service.updateMedia(propertyId, changes || {});
  }

  @Delete(':propertyId/:mediaId')
  @ApiOperation({ summary: 'Remove a media item' })
  @ApiParam({ name: 'propertyId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiParam({ name: 'mediaId', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  async remove(
    @Param('propertyId') propertyId: string,
    @Param('mediaId') mediaId: string,
  ) {
    return this.service.removeMediaItem(propertyId, mediaId);
  }
}