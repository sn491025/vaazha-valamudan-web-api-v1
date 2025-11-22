import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProfileService } from './profile.service';
import { User } from '../../entities';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;
  let repository: Repository<User>;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'hashedPassword',
    fullName: 'Test User',
    phoneNumber: '+1234567890',
    isActive: true,
    referralCode: 'ABC12345',
    referredBy: undefined as string | undefined,
    roles: [],
    loginHistory: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as unknown as User;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const { password, ...profileData } = mockUser as User;
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.getProfile('1');
      expect(result).toEqual(profileData);
    });

    it('should throw NotFoundException when user not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.getProfile('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = { fullName: 'Updated Name' };
      const updatedUser = { ...mockUser, ...updateDto } as User;
      const { password, ...profileData } = updatedUser;

      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(repository, 'save').mockResolvedValue(updatedUser);

      const result = await service.updateProfile('1', updateDto);
      expect(result).toEqual(profileData);
    });

    it('should throw ConflictException when updating email to existing one', async () => {
      const updateDto = { email: 'existing@example.com' };

      jest.spyOn(repository, 'findOne')
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce({ ...mockUser, id: '2' });

      await expect(service.updateProfile('1', updateDto))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('getLoginHistory', () => {
    it('should return user login history', async () => {
      const loginHistory = [
        { id: '1', timestamp: new Date(), ipAddress: '127.0.0.1' },
      ];
      const userWithHistory = { ...mockUser, loginHistory } as unknown as User;

      jest.spyOn(repository, 'findOne').mockResolvedValue(userWithHistory);

      const result = await service.getLoginHistory('1');
      expect(result).toEqual(loginHistory);
    });
  });

  describe('findByReferralCode', () => {
    it('should find user by referral code', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

      const result = await service.findByReferralCode('ABC12345');
      expect(result).toEqual(mockUser);
    });
  });

  describe('generateUniqueReferralCode', () => {
    it('should generate unique referral code', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      const result = await service.generateUniqueReferralCode();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(8);
    });
  });
});
