import {
  Injectable,
  NotFoundException,
  ConflictException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities';
import { UpdateProfileDto } from '../dto';
import { UserType } from '../../enums/usertype';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['roles']
    });
  }

  async create(createUserData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    isActive: boolean;
  }): Promise<User> {
    const user = this.userRepository.create(createUserData);
    user.userType = UserType.BUYER;
    return await this.userRepository.save(user);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['roles']
    });
  }

  async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['roles', 'loginHistory']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateProfileDto.email }
      });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    Object.assign(user, updateProfileDto);
    await this.userRepository.save(user);

    const { password, ...updatedProfile } = user;
    return updatedProfile;
  }

  async getLoginHistory(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['loginHistory']
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.loginHistory;
  }

  // Method needed by forgot-password service (alias for findById)
  async findOne(id: string): Promise<User | null> {
    return this.findById(id);
  }

  // Method to update password
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.userRepository.update(userId, { password: hashedPassword });
  }

  // Method to find user by phone number for mobile login
  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phoneNumber },
      relations: ['roles']
    });
  }

  // Method to find user by referral code
  async findByReferralCode(referralCode: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { referralCode }
    });
  }

  // Method to generate unique referral code
  async generateUniqueReferralCode(): Promise<string> {
    let referralCode: string = '';
    let isUnique = false;

    while (!isUnique) {
      referralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const existingUser = await this.findByReferralCode(referralCode);
      if (!existingUser) {
        isUnique = true;
      }
    }

    return referralCode;
  }

  // Enhanced create method with referral support
  async createWithReferral(createUserData: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    isActive: boolean;
    referredByCode?: string;
  }): Promise<User> {
    const userData: Partial<User> & {
      firstName?: string;
      lastName?: string;
      isActive: boolean;
    } = {
      firstName: createUserData.firstName,
      lastName: createUserData.lastName,
      isActive: createUserData.isActive
    };

    if (createUserData.email) userData.email = createUserData.email;
    if (createUserData.phoneNumber)
      userData.phoneNumber = createUserData.phoneNumber;
    if (createUserData.password) userData.password = createUserData.password;

    // Generate unique referral code for new user
    userData['referralCode'] = await this.generateUniqueReferralCode();

    // If referred by someone, validate and set referredBy
    if (createUserData.referredByCode) {
      const referrer = await this.findByReferralCode(
        createUserData.referredByCode
      );
      if (referrer) {
        userData['referredBy'] = referrer.id;
      }
      // Remove temporary field reference in the payload
      delete (userData as any)['referredByCode'];
    }
    userData.userType = UserType.BUYER;
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }
}

