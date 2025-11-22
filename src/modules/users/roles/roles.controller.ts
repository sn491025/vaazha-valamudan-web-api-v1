import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam, 
  ApiBody,
  ApiBearerAuth 
} from '@nestjs/swagger';
import { RolesService } from './services/roles.service';
import { CreateRoleDto, UpdateRoleDto, RoleResponseDto } from './dto';
import { ApiStandardResponses } from '../../../common';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Create a new role' })
  @ApiBody({ 
    type: CreateRoleDto,
    description: 'Role data to create',
    examples: {
      example1: {
        summary: 'Create ADMIN role',
        value: {
          name: 'ADMIN',
          description: 'Real estate admin with property management access'
        }
      },
      example2: {
        summary: 'Create AGENT role',
        value: {
          name: 'AGENT',
          description: 'Real estate agent with property management access'
        }
      }
    }
  })
  @ApiStandardResponses(RoleResponseDto, {
    successStatus: 201,
    includeAuth: true,
    includeValidation: true,
    includeConflict: true
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.create(createRoleDto);
  }

  @ApiOperation({ summary: 'Get all roles' })
  @ApiStandardResponses([RoleResponseDto], {
    successStatus: 200,
    includeAuth: true
  })
  @Get()
  findAll(): Promise<RoleResponseDto[]> {
    return this.rolesService.findAll();
  }

  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ 
    name: 'id', 
    type: 'string', 
    description: 'Role UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiStandardResponses(RoleResponseDto, {
    successStatus: 200,
    includeAuth: true,
    includeNotFound: true
  })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.rolesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update role by ID' })
  @ApiParam({ 
    name: 'id', 
    type: 'string', 
    description: 'Role UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiBody({ 
    type: UpdateRoleDto,
    description: 'Updated role data',
    examples: {
      example1: {
        summary: 'Update role description',
        value: {
          description: 'Updated role description'
        }
      }
    }
  })
  @ApiStandardResponses(RoleResponseDto, {
    successStatus: 200,
    includeAuth: true,
    includeValidation: true,
    includeNotFound: true
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @ApiOperation({ summary: 'Delete role by ID' })
  @ApiParam({ 
    name: 'id', 
    type: 'string', 
    description: 'Role UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiStandardResponses(undefined, {
    successStatus: 204,
    includeAuth: true,
    includeNotFound: true
  })
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(id);
  }
}
