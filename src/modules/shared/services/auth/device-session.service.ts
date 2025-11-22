import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { DeviceType } from '../../enums/device-type.enum';
import { DeviceSession } from '../../entities/device-session.entity';

export interface UpsertDeviceSessionInput {
  referenceId: string;
  deviceId?: string | null;
  deviceType?: DeviceType;
  platform?: string | null;
  firebaseToken?: string | null;
  userAgent?: string | null;
  ipAddress?: string | null;
  refreshToken?: string | null;
}

@Injectable()
export class DeviceSessionService {
  constructor(
    @InjectRepository(DeviceSession)
    private readonly repo: Repository<DeviceSession>,
  ) {}

  async upsertOnLogin(input: UpsertDeviceSessionInput): Promise<DeviceSession> {
    const {
      referenceId,
      deviceId = null,
      deviceType = DeviceType.WEB,
      platform = null,
      firebaseToken = null,
      userAgent = null,
      ipAddress = null,
      refreshToken = null,
    } = input;

    let entity: DeviceSession | null = null;

    if (deviceId) {
      entity = await this.repo.findOne({ where: { referenceId, deviceId } });
    }

    if (!entity && userAgent) {
      entity = await this.repo.findOne({ where: { referenceId, userAgent } });
    }

    const refreshTokenHash = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;

    if (entity) {
      entity.deviceType = deviceType;
      if (platform !== null) entity.platform = platform;
      if (firebaseToken !== null) entity.firebaseToken = firebaseToken;
      if (userAgent !== null) entity.userAgent = userAgent;
      if (ipAddress !== null) entity.ipAddress = ipAddress;
      if (refreshTokenHash !== null) {
        entity.refreshTokenHash = refreshTokenHash;
      }
      entity.lastLoginAt = new Date();
      entity.isActive = true;
      return this.repo.save(entity);
    }

    const created = this.repo.create({
      referenceId,
      deviceId: deviceId ?? undefined,
      deviceType,
      platform: platform ?? undefined,
      firebaseToken: firebaseToken ?? undefined,
      userAgent: userAgent ?? undefined,
      ipAddress: ipAddress ?? undefined,
      refreshTokenHash: refreshTokenHash ?? undefined,
      lastLoginAt: new Date(),
      isActive: true,
    });

    return this.repo.save(created);
  }

  // Revoke a specific session by device or user-agent (clears push and refresh, deactivates)
  async revokeByReferenceAndDevice(referenceId: string, deviceId?: string, userAgent?: string): Promise<void> {
    const qb = this.repo.createQueryBuilder().update(DeviceSession)
      .set({
        isActive: false,
        firebaseToken: () => 'NULL',
        refreshTokenHash: () => 'NULL',
      })
      .where('referenceId = :referenceId', { referenceId });

    if (deviceId) {
      qb.andWhere('deviceId = :deviceId', { deviceId });
    } else if (userAgent) {
      qb.andWhere('userAgent = :userAgent', { userAgent });
    }

    await qb.execute();
  }

  // Revoke all sessions for a reference (clears push and refresh, deactivates)
  async revokeAllForReference(referenceId: string): Promise<void> {
    await this.repo.createQueryBuilder().update(DeviceSession)
      .set({
        isActive: false,
        firebaseToken: () => 'NULL',
        refreshTokenHash: () => 'NULL',
      })
      .where('referenceId = :referenceId', { referenceId })
      .execute();
  }
}
