import {
  Controller,
  Get,
  Body,
  Patch,
  Request,
} from '@nestjs/common';
import { ProfileService } from './services/profile.service';
import { ProfileResponseDto, UpdateProfileDto, LoginHistoryItemDto } from './dto';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieves the authenticated user\'s profile information including roles and account details'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the user profile information',
    type: ProfileResponseDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000'
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @Get()
  getProfile(@Request() userId :string): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(userId) as unknown as Promise<ProfileResponseDto>;
  }

  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Updates the authenticated user\'s profile information. Only provided fields will be updated.'
  })
  @ApiBody({ 
    type: UpdateProfileDto,
    description: 'Profile data to update',
    examples: {
      updateName: {
        summary: 'Update full name',
        value: {
          fullName: 'John Smith'
        }
      },
      updatePhone: {
        summary: 'Update phone number',
        value: {
          phoneNumber: '+1987654321'
        }
      },
      updateBoth: {
        summary: 'Update multiple fields',
        value: {
          fullName: 'John Smith',
          phoneNumber: '+1987654321'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile has been successfully updated',
    type: ProfileResponseDto,
    example: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john.doe@example.com',
      fullName: 'John Smith',
      phoneNumber: '+1987654321',
      isActive: true,
      roles: [
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          name: 'AGENT',
          description: 'Real estate agent'
        }
      ],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T12:30:00.000Z'
    }
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid input data or validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @Patch()
  updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(req.user.id, updateProfileDto) as unknown as Promise<ProfileResponseDto>;
  }

  @ApiOperation({ 
    summary: 'Get user login history',
    description: 'Retrieves the authenticated user\'s login history including IP addresses and timestamps'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the user login history',
    type: 'array',
    example: {
      loginHistory: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          loginAt: '2024-01-01T10:30:00.000Z'
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          ipAddress: '192.168.1.2',
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
          loginAt: '2024-01-01T08:15:00.000Z'
        }
      ]
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @Get('login-history')
  getLoginHistory(@Request() req): Promise<LoginHistoryItemDto[]> {
    return this.profileService.getLoginHistory(req.user.id).then(history =>
      history.map((h) => ({
        id: h.id,
        // Normalize nullable columns to satisfy DTO non-nullable types
        ipAddress: h.ipAddress ?? '',
        userAgent: h.userAgent ?? '',
        loginAt: h.loginAt,
      })),
    );
  }
}
