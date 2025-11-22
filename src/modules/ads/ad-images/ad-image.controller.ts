import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { AdImageService } from './services/ad-image.service';
import { UpdateAdImageDto } from './dto/create-ad-image.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UploadedFile } from '../../property/property-media/types/uploaded-file';
import type { UploadMediaMeta } from '../../property/property-media/types/upload-media-meta';

@ApiTags('ad-images')
@Controller('ads/:adId/images')
export class AdImageController {
  constructor(private readonly adImageService: AdImageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'adId', example: '11111111-1111-1111-1111-111111111111' })
  @UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload one or more image files and optional per-file metadata via items[] matching file order',
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
              title: { type: 'string' },
              description: { type: 'string' },
              is_primary: { type: 'boolean', default: false },
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
          items: [{ title: 'Front view', description: 'Daylight photo', is_primary: true, sort_order: 0 }],
        },
      },
      multiple: {
        summary: 'Multiple files with per-file metadata',
        value: {
          items: [
            { title: 'Front', description: 'Main facade', is_primary: true, sort_order: 0 },
            { title: 'Backyard', description: 'Garden area', is_primary: false, sort_order: 1 },
          ],
        },
      },
      rawString: {
        summary: 'Multipart note',
        value: {
          items: '[{"title":"Front","is_primary":true},{"title":"Back","is_primary":false}]',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload images for an ad' })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  async uploadImages(
    @Param('adId') adId: string,
    @UploadedFiles() files: UploadedFile[],
    @Body() body: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const toArray = (v: any) => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);
    const toBool = (v: any) => {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') return ['true', '1', 'on', 'yes'].includes(v.toLowerCase());
      return !!v;
    };
    const toNum = (v: any) => (v === undefined || v === null || v === '' ? undefined : Number(v));

    const normalizeItems = (b: any, count: number): UploadMediaMeta[] | undefined => {
      const raw = b?.items;

      // Case 1: already an array (objects or JSON strings)
      if (Array.isArray(raw)) {
        const arr = raw.map((x) => {
          if (typeof x === 'string') {
            try {
              return JSON.parse(x);
            } catch {
              return undefined;
            }
          }
          return x;
        }).filter((x) => x && typeof x === 'object');
        return arr.slice(0, count);
      }

      // Case 2: JSON string
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed.slice(0, count);
          if (parsed && typeof parsed === 'object') {
            const keys = Object.keys(parsed).sort((a, z) => Number(a) - Number(z));
            return keys.slice(0, count).map((k) => (parsed as any)[k]);
          }
        } catch {
          // ignore invalid JSON and proceed with other shapes
        }
      }

      // Case 3: object keyed by indices
      if (raw && typeof raw === 'object') {
        const keys = Object.keys(raw).sort((a, z) => Number(a) - Number(z));
        const arr = keys.map((k) => (raw as any)[k]).filter((x) => x && typeof x === 'object');
        return arr.slice(0, count);
      }

      // Case 4: parallel arrays (title[], description[], is_primary[], sort_order[])
      const titles = toArray(b?.titles ?? b?.title);
      const descriptions = toArray(b?.descriptions ?? b?.description);
      const primaries = toArray(b?.is_primaries ?? b?.is_primary);
      const sortOrders = toArray(b?.sort_orders ?? b?.sort_order);

      const hasAny =
        titles.length + descriptions.length + primaries.length + sortOrders.length > 0;

      if (!hasAny) return undefined;

      const out: UploadMediaMeta[] = [];
      for (let i = 0; i < count; i++) {
        out.push({
          title: titles[i],
          description: descriptions[i],
          is_primary: primaries[i] !== undefined ? toBool(primaries[i]) : undefined,
          sort_order: toNum(sortOrders[i]),
        } as UploadMediaMeta);
      }
      return out;
    };

    const items = normalizeItems(body, files.length);

    return this.adImageService.uploadImages(adId, files || [], items);
  }

  @Get()
  @ApiOperation({ summary: 'Get all images for an ad' })
  @ApiParam({ name: 'adId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiResponse({
    status: 200,
    description: 'Images retrieved successfully',
  })
  async getAdImages(@Param('adId') adId: string) {
    return this.adImageService.findByAdId(adId);
  }

  @Patch(':imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update image details' })
  @ApiParam({ name: 'adId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiParam({ name: 'imageId', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @ApiBody({
    description: 'Fields to update on the image',
    type: UpdateAdImageDto,
    examples: {
      setPrimary: {
        summary: 'Set as primary',
        value: { is_primary: true },
      },
      reorder: {
        summary: 'Update sort order',
        value: { sort_order: 3 },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Image updated successfully' })
  async updateImage(
    @Param('imageId') imageId: string,
    @Body() updateDto: UpdateAdImageDto,
  ) {
    return this.adImageService.updateImage(imageId, updateDto);
  }

  @Delete(':imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an image' })
  @ApiParam({ name: 'adId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiParam({ name: 'imageId', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  async deleteImage(@Param('imageId') imageId: string) {
    return this.adImageService.deleteImage(imageId);
  }

  @Post('reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder images' })
  @ApiParam({ name: 'adId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiBody({
    description: 'New order of image IDs for the ad',
    schema: {
      type: 'object',
      properties: {
        imageIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
        },
      },
      required: ['imageIds'],
      example: {
        imageIds: [
          'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
          'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        ],
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Images reordered successfully' })
  async reorderImages(
    @Param('adId') adId: string,
    @Body('imageIds') imageIds: string[],
  ) {
    return this.adImageService.reorderImages(adId, imageIds);
  }

  @Post(':imageId/set-primary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set image as primary' })
  @ApiParam({ name: 'adId', example: '11111111-1111-1111-1111-111111111111' })
  @ApiParam({ name: 'imageId', example: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' })
  @ApiResponse({ status: 200, description: 'Primary image set successfully' })
  async setPrimaryImage(
    @Param('adId') adId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.adImageService.setPrimaryImage(adId, imageId);
  }
}
