import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesService } from './roles.service';
import { Role } from '../../entities';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('RolesService', () => {
  let service: RolesService;
  let repository: Repository<Role>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRepository
        }
      ]
    }).compile();

    service = module.get<RolesService>(RolesService);
    repository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new role', async () => {
      const createRoleDto = { name: 'ADMIN', description: 'Administrator' };
      const role = { id: '1', ...createRoleDto } as Role;

      jest.spyOn(repository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(repository, 'create').mockReturnValue(role);
      jest.spyOn(repository, 'save').mockResolvedValue(role);

      const result = await service.create(createRoleDto);
      expect(result).toEqual(role);
    });

    it('should throw ConflictException if role name already exists', async () => {
      const createRoleDto = { name: 'ADMIN', description: 'Administrator' };

      jest
        .spyOn(repository, 'findOne')
        .mockResolvedValueOnce({ id: '1', ...createRoleDto } as Role);

      await expect(service.create(createRoleDto)).rejects.toThrow(
        ConflictException
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const roles = [
        { id: '1', name: 'ADMIN', description: 'Administrator' },
        { id: '2', name: 'USER', description: 'Regular user' }
      ] as Role[];

      jest.spyOn(repository, 'find').mockResolvedValue(roles);

      const result = await service.findAll();
      expect(result).toEqual(roles);
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const role = {
        id: '1',
        name: 'ADMIN',
        description: 'Administrator'
      } as Role;

      jest.spyOn(repository, 'findOne').mockResolvedValue(role);

      const result = await service.findOne('1');
      expect(result).toEqual(role);
    });

    it('should throw NotFoundException if role not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });
});
describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesService]
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
