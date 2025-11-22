import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './services/profile.service';
import { User } from '../entities';
import { Request } from 'express';
import { UpdateProfileDto } from './dto';

describe('ProfileController', () => {
  let controller: ProfileController;

  const mockProfileService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    getLoginHistory: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService
        }
      ]
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const mockProfile: User = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890'
      } as unknown as User;

      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile('1');
      expect(result).toEqual(mockProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith('1');
      expect(mockProfileService.getProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the user profile', async () => {
      const updateDto: UpdateProfileDto = { fullName: 'Updated Name' };
      const mockUpdatedProfile: User = {
        id: '1',
        email: 'test@example.com',
        fullName: 'Updated Name',
        phoneNumber: '+1234567890'
      } as unknown as User;

      const mockRequest = {
        user: { id: '1' }
      } as unknown as Request;

      mockProfileService.updateProfile.mockResolvedValue(mockUpdatedProfile);

      const result = await controller.updateProfile(mockRequest, updateDto);
      expect(result).toEqual(mockUpdatedProfile);
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith('1', updateDto);
      expect(mockProfileService.updateProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLoginHistory', () => {
    it('should return the user login history', async () => {
      const mockLoginHistory = [
        { id: '1', timestamp: new Date(), ipAddress: '127.0.0.1' }
      ];

      const mockRequest = {
        user: { id: '1' }
      } as unknown as Request;

      mockProfileService.getLoginHistory.mockResolvedValue(mockLoginHistory);

      const result = await controller.getLoginHistory(mockRequest);
      
      expect(result).toEqual(mockLoginHistory);
      expect(mockProfileService.getLoginHistory).toHaveBeenCalledWith('1');
      expect(mockProfileService.getLoginHistory).toHaveBeenCalledTimes(1);
    });
  });
});