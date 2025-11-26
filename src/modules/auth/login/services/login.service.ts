import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginHistory } from '../../entities/login-history.entity';
import { BusinessException } from '../../../../common';
import { ProfileService, RolesService, User } from '../../../users';
import {
  OtpPurpose,
  OtpService,
  OtpType,
  JwtAuthService,
  DeviceType
} from '../../../shared';
import { LoginRequestDto, LoginResponseDto, VerifyOtpDto } from '../dto';
import { AgentCompanyProfileService } from '../../../users/company-profile/service/agent-company-profile.service';
import { UserInfoDto } from '../dto/user-info.dto';
import { AgentProfileInfoDto } from '../dto/agent-profile-info.dto';
import { UserType } from '../../../users/enums/usertype';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(LoginHistory)
    private loginHistoryRepository: Repository<LoginHistory>,
    private roleService: RolesService,
    private usersService: ProfileService,
    private agentCompanyProfileService: AgentCompanyProfileService,
    private otpService: OtpService,
    private jwtAuth: JwtAuthService
  ) {}

  async login(
    dto: LoginRequestDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponseDto> {
    try {
      const { email, phoneNumber, password } = dto;

      // Validate that either email or phone number is provided
      if (!email && !phoneNumber) {
        throw new UnauthorizedException(
          'Either email or phone number is required'
        );
      }

      // Find user by email or phone number
      let user: User | null = null;
      if (email) {
        user = await this.usersService.findByEmail(email);
      } else if (phoneNumber) {
        user = await this.usersService.findByPhoneNumber(phoneNumber);
      }
      if (!user) {
        // Log failed attempt even for non-existent users
        await this.logLoginAttempt(
          null,
          false,
          'User not found',
          ipAddress,
          userAgent
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user account is active
      if (!user.isActive) {
        await this.logLoginAttempt(
          user,
          false,
          'Account deactivated',
          ipAddress,
          userAgent
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = user.password
        ? await bcrypt.compare(password, user.password)
        : false;

      if (!isPasswordValid) {
        await this.logLoginAttempt(
          user,
          false,
          'Invalid password',
          ipAddress,
          userAgent
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate proper JWT tokens
      const tokens = await this.generateTokens(user);

      // Log successful login
      await this.logLoginAttempt(
        user,
        true,
        'Login successful',
        ipAddress,
        userAgent
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: await this.mapUserToUserInfoDto(user)
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BusinessException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  private async generateTokens(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const roles = user.roles || [UserType.BUYER.toString()];
    return this.jwtAuth.generateTokenPair(user.id, roles, DeviceType.WEB);
  }

  async refreshTokensForUser(
    user: User,
    deviceType: DeviceType = DeviceType.WEB
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const roles = user.roles || [UserType.BUYER.toString()];
    return this.jwtAuth.generateTokenPair(user.id, roles, deviceType);
  }

  async signOut(userId: string): Promise<{ message: string }> {
    // Extend with device session/refresh token revocation if available
    return { message: 'Signed out' };
  }

  async upgradeJwtAuth(
    user: User,
    rolesAllowed: string[] = ['USER'],
    deviceType: DeviceType = DeviceType.WEB
  ): Promise<LoginResponseDto> {
    const userRoles = user.roles || [UserType.BUYER.toString()];
    const hasRequiredRole =
      rolesAllowed.length === 0 ||
      userRoles.some((r) => rolesAllowed.includes(r));
    if (!hasRequiredRole) {
      throw new UnauthorizedException(
        'Insufficient role to upgrade authentication'
      );
    }
    const { accessToken, refreshToken } = this.jwtAuth.generateTokenPair(
      user.id,
      userRoles,
      deviceType
    );
    return {
      accessToken,
      refreshToken,
      user: await this.mapUserToUserInfoDto(user)
    };
  }

  async refreshTokens(
    userId: string,
    deviceType: DeviceType = DeviceType.WEB
  ): Promise<LoginResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account deactivated');
    }
    const { accessToken, refreshToken } = this.jwtAuth.generateTokenPair(
      user.id,
      user.roles || [UserType.BUYER.toString()],
      deviceType
    );
    return {
      accessToken,
      refreshToken,
      user: await this.mapUserToUserInfoDto(user)
    };
  }

  async upgradeJwtAuthByUserId(
    userId: string,
    rolesAllowed: string[] = ['USER'],
    deviceType: DeviceType = DeviceType.WEB
  ): Promise<LoginResponseDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account deactivated');
    }
    const userRoles = user.roles || [UserType.BUYER.toString()];
    const hasRequiredRole =
      rolesAllowed.length === 0 ||
      userRoles.some((r) => rolesAllowed.includes(r));
    if (!hasRequiredRole) {
      throw new UnauthorizedException(
        'Insufficient role to upgrade authentication'
      );
    }
    const { accessToken, refreshToken } = this.jwtAuth.generateTokenPair(
      user.id,
      userRoles,
      deviceType
    );
    return {
      accessToken,
      refreshToken,
      user: await this.mapUserToUserInfoDto(user)
    };
  }

  private async logLoginAttempt(
    user: User | null,
    success: boolean,
    details: string,
    ipAddress: string = 'unknown',
    userAgent: string = 'unknown'
  ): Promise<void> {
    try {
      const loginHistory = this.loginHistoryRepository.create({
        user,
        ipAddress,
        userAgent
      });

      await this.loginHistoryRepository.save(loginHistory);
    } catch (error) {
      console.error('Failed to log login attempt:', error);
    }
  }

  async sendLoginOtp(
    phoneNumber: string,
    optTypes: OtpType[],
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string; isExistingUser: boolean }> {
    try {
      // Find user by phone number
      const user = await this.usersService.findByPhoneNumber(phoneNumber);

      let message: { message: string } =
        await this.otpService.generateAndSendOtp(
          phoneNumber,
          user?.email,
          user ? OtpPurpose.LOGIN : OtpPurpose.REGISTRATION,
          optTypes,
          user?.id,
          ipAddress,
          userAgent
        );
      // Generate and send OTP using OtpService
      return {
        ...message,
        isExistingUser: user !== null
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(
        error.message || 'Failed to send OTP'
      );
    }
  }

  async verifyLoginOtp(
    dto: VerifyOtpDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponseDto> {
    try {
      let otpPurpose: OtpPurpose = OtpPurpose.LOGIN;

      let user = await this.usersService.findByPhoneNumber(dto.phoneNumber);

      if (!user) {
        otpPurpose = OtpPurpose.REGISTRATION;
      }

      // Verify OTP using OtpService
      const otpVerification = await this.otpService.verifyOtp(
        dto.phoneNumber,
        dto.otp,
        otpPurpose,
        ipAddress
      );

      if (!otpVerification.isValid) {
        // Log failed login attempt
        await this.logLoginAttempt(
          user,
          false,
          'Invalid or expired OTP',
          ipAddress,
          userAgent
        );
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      if (otpPurpose === OtpPurpose.REGISTRATION) {
        if (!dto.user) {
          throw new UnauthorizedException('User not found');
        }

        let role = await  this.roleService.findOneByRoleName('');


        user = await this.usersService.createWithReferral({
          email: dto.user?.email,
          firstName: dto.user?.firstName,
          lastName: dto.user?.lastName,
          phoneNumber: dto.phoneNumber,
          isActive: true,
          referredByCode: dto.user?.referralCode
        });
      }

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        await this.logLoginAttempt(
          user,
          false,
          'Account deactivated',
          ipAddress,
          userAgent
        );
        throw new UnauthorizedException('Account deactivated');
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log successful login
      await this.logLoginAttempt(
        user,
        true,
        'OTP login successful',
        ipAddress,
        userAgent
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: await this.mapUserToUserInfoDto(user)
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }

  async mapUserToUserInfoDto(user: User): Promise<UserInfoDto> {
    const dto = new UserInfoDto();

    dto.id = user.id;
    dto.email = user.email;
    dto.phoneNumber = user.phoneNumber ?? null;
    dto.firstName = user.firstName;
    dto.lastName = (user as any).lastName ?? null;
    dto.isActive = (user as any).isActive ?? false;

    // Map roles to a simple list (adjust if UserInfoDto expects a different shape)
    dto.roles =
      user.roles ?? [];
    dto.agent = new AgentProfileInfoDto();

    let agentCompanyProfile =
      await this.agentCompanyProfileService.findAllByUserId(user.id, {});
    let agent = agentCompanyProfile[0];
    if (agentCompanyProfile && agentCompanyProfile.length > 0) {
      dto.agent.agent_id = agent.id;
      dto.agent.agent_name = agent.companyName;
      dto.agent.agent_profile_name = agent.profileName;
    }

    return dto;
  }
}
