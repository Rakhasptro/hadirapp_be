import { Test, TestingModule } from '@nestjs/testing';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

describe('TeachersController', () => {
  let controller: TeachersController;
  let service: TeachersService;

  beforeEach(async () => {
    const mockTeachersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeachersController],
      providers: [
        {
          provide: TeachersService,
          useValue: mockTeachersService,
        },
      ],
    }).compile();

    controller = module.get<TeachersController>(TeachersController);
    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a teacher', async () => {
      const createTeacherDto: CreateTeacherDto = {
        userId: 'user-uuid',
        nip: '123456',
        name: 'John Doe',
        phone: '08123456789',
      };

      const expectedResult = {
        id: 'teacher-uuid',
        ...createTeacherDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      jest.spyOn(service, 'create').mockResolvedValue(expectedResult);

      const result = await controller.create(createTeacherDto);

      expect(service.create).toHaveBeenCalledWith(createTeacherDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all teachers', async () => {
      const expectedTeachers = [
        {
          id: 'teacher-1',
          nip: '123456',
          name: 'John Doe',
          phone: '08123456789',
          createdAt: new Date(),
          users: { email: 'john@example.com', role: 'TEACHER' as any },
        },
      ];

      jest.spyOn(service, 'findAll').mockResolvedValue(expectedTeachers);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedTeachers);
    });
  });

  describe('findOne', () => {
    it('should return a teacher by id', async () => {
      const teacherId = 'teacher-uuid';
      const expectedTeacher = {
        id: teacherId,
        userId: 'user-uuid',
        nip: '123456',
        name: 'John Doe',
        phone: '08123456789',
        createdAt: new Date(),
        updatedAt: new Date(),
        users: { email: 'john@example.com', isActive: true },
        courses: [],
        schedules: [],
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(expectedTeacher);

      const result = await controller.findOne(teacherId);

      expect(service.findOne).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(expectedTeacher);
    });
  });

  describe('update', () => {
    it('should update a teacher', async () => {
      const teacherId = 'teacher-uuid';
      const updateTeacherDto: UpdateTeacherDto = {
        name: 'Updated Name',
        phone: '08111111111',
      };

      const expectedUpdatedTeacher = {
        id: teacherId,
        userId: 'user-uuid',
        nip: '123456',
        name: 'Updated Name',
        phone: '08111111111',
        updatedAt: new Date(),
      } as any;

      jest.spyOn(service, 'update').mockResolvedValue(expectedUpdatedTeacher);

      const result = await controller.update(teacherId, updateTeacherDto);

      expect(service.update).toHaveBeenCalledWith(teacherId, updateTeacherDto);
      expect(result).toEqual(expectedUpdatedTeacher);
    });
  });

  describe('remove', () => {
    it('should delete a teacher', async () => {
      const teacherId = 'teacher-uuid';
      const expectedResult = {
        message: `Teacher with ID "${teacherId}" successfully deleted.`,
      };

      jest.spyOn(service, 'remove').mockResolvedValue(expectedResult);

      const result = await controller.remove(teacherId);

      expect(service.remove).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(expectedResult);
    });
  });
});
