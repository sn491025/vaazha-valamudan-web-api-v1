import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './services/roles.service';
import { CreateRoleDto, UpdateRoleDto } from './dto';
import { Role } from '../entities';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  const mockRolesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'ADMIN',
        description: 'Administrator',
      };
      const expectedResult = { id: '1', ...createRoleDto } as Role;

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(createRoleDto);
      expect(result).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of roles', async () => {
      const expectedResult = [
        { id: '1', name: 'ADMIN', description: 'Administrator' },
        { id: '2', name: 'USER', description: 'Regular user' },
      ] as Role[];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);

      const result = await controller.findAll();
      expect(result).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role by id', async () => {
      const expectedResult = {
        id: '1',
        name: 'ADMIN',
        description: 'Administrator',
      } as Role;

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedResult);

      const result = await controller.findOne('1');
      expect(result).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const updateRoleDto: UpdateRoleDto = {
        description: 'Updated Administrator',
      };
      const expectedResult = {
        id: '1',
        name: 'ADMIN',
        description: 'Updated Administrator',
      } as Role;

      jest.spyOn(service, 'update').mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateRoleDto);
      expect(result).toBe(expectedResult);
      expect(service.update).toHaveBeenCalledWith('1', updateRoleDto);
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await controller.remove('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});
describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
