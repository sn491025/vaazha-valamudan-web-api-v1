import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Property } from '../../entities/properties.entity';
import { PropertyFilterDto } from '../dto/property-filter.dto';
import { PropertySummaryByDistrictDto } from '../dto/property-summary-by-district.dto';

@Injectable()
export class PropertySearchService {
  constructor(
    @InjectRepository(Property)
    private readonly propertyRepo: Repository<Property>
  ) {}

  private applyFilters(
    qb: SelectQueryBuilder<Property>,
    filters: PropertyFilterDto
  ) {
    qb.where('p.is_active = :active', { active: true });

    if (filters.published ?? true) {
      qb.andWhere('p.is_published = :published', { published: true });
    }
    if (filters.property_category_id) {
      qb.andWhere('p.property_category_id = :pc', {
        pc: filters.property_category_id
      });
    }
    if (filters.listing_type) {
      qb.andWhere('p.listing_type = :lt', { lt: filters.listing_type });
    }
    if (filters.status) {
      qb.andWhere('p.status = :st', { st: filters.status });
    }
    if (filters.city)
      qb.andWhere('p.city ILIKE :city', { city: `%${filters.city}%` });
    if (filters.state)
      qb.andWhere('p.state ILIKE :state', { state: `%${filters.state}%` });
    if (filters.country)
      qb.andWhere('p.country ILIKE :country', {
        country: `%${filters.country}%`
      });
    if (filters.min_price != null)
      qb.andWhere('p.price >= :minp', { minp: filters.min_price });
    if (filters.max_price != null)
      qb.andWhere('p.price <= :maxp', { maxp: filters.max_price });

    switch (filters.sort) {
      case 'price_asc':
        qb.orderBy('p.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('p.price', 'DESC');
        break;
      case 'date_oldest':
        qb.orderBy('p.created_at', 'ASC');
        break;
      case 'most_viewed':
        qb.orderBy('p.view_count', 'DESC');
        break;
      case 'most_popular':
        qb.orderBy('p.favorite_count', 'DESC');
        break;
      case 'date_newest':
      default:
        qb.orderBy('p.created_at', 'DESC');
        break;
    }
  }

  async search(filters: PropertyFilterDto) {
    const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 10);
    const qb = this.propertyRepo.createQueryBuilder('p');
    this.applyFilters(qb, filters);
    qb.skip((page - 1) * limit).take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  async suggestions(q: string) {
    if (!q) return [];
    const rows = await this.propertyRepo
      .createQueryBuilder('p')
      .select(['p.title', 'p.city', 'p.state'])
      .where('(p.title ILIKE :q OR p.city ILIKE :q OR p.state ILIKE :q)', {
        q: `%${q}%`
      })
      .andWhere('p.is_active = true AND p.is_published = true')
      .orderBy('p.view_count', 'DESC')
      .limit(10)
      .getMany();
    const set = new Set<string>();
    rows.forEach((r) => {
      set.add(r.title);
      set.add(r.city);
      set.add(r.state);
    });
    return Array.from(set).filter(Boolean).slice(0, 10);
  }

  async autocomplete(q: string) {
    const suggestions = await this.suggestions(q);
    return suggestions.map((s) => ({ type: 'keyword', value: s }));
  }

  async availableFilters() {
    // Normally fetched from DB or cache
    return {
      listing_types: ['SALE', 'RENT', 'LEASE'],
      statuses: ['AVAILABLE', 'SOLD', 'RENTED', 'PENDING_SALE'],
      price_ranges: [
        { label: 'Under 50k', min: 0, max: 50000 },
        { label: '50k - 100k', min: 50000, max: 100000 },
        { label: '100k - 250k', min: 100000, max: 250000 },
        { label: '250k+', min: 250000, max: null }
      ]
    };
  }

  async nearby(lat: number, lng: number, radiusKm = 5) {
    const candidates = await this.propertyRepo.find({
      where: { is_active: true, is_published: true },
      take: 200 // cap
    });
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // km
    const withDist = candidates
      .filter((c) => c.latitude != null && c.longitude != null)
      .map((c) => {
        const dLat = toRad(Number(c.latitude) - lat);
        const dLon = toRad(Number(c.longitude) - lng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat)) *
            Math.cos(toRad(Number(c.latitude))) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const d = 2 * R * Math.asin(Math.sqrt(a));
        return { ...c, distance_km: Number(d.toFixed(2)) };
      })
      .filter((c) => c.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km)
      .slice(0, 50);
    return { data: withDist, total: withDist.length, radius_km: radiusKm };
  }

  async getPropertySummaryByDistrict(
    district?: string
  ): Promise<PropertySummaryByDistrictDto[]> {
    const query = this.propertyRepo
      .createQueryBuilder('p')
      .select('p.district', 'district')
      .addSelect('COUNT(p.id)', 'count')
      .addSelect('MIN(p.price)', 'min_price')
      .addSelect('MAX(p.price)', 'max_price')
      .addSelect('COUNT(DISTINCT p.owner_id)', 'createdByCount')
      .where('p.is_active = :active', { active: true })
      .andWhere('p.approval_status = :approved', { approved: 'APPROVED' })
      .andWhere('p.is_published = :published', { published: true })
      .groupBy('p.district');

    if (district) {
      query.andWhere('p.district = :district', { district });
    }

    const result = await query.getRawMany();

    return result.map(
      (row) =>
        ({
          district: row.district,
          count: Number(row.count),
          minAmount: Number(row.min_price),
          maxAmount: Number(row.max_price),
          createdByCount: Number(row.createdByCount)
        }) as PropertySummaryByDistrictDto
    ) as PropertySummaryByDistrictDto[];
  }
}
