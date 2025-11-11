import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

const mockTeachers = {
  findFirst: jest.fn(),
  create: jest.fn(),
  findMany: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockPrismaService = {
  teachers: mockTeachers,
};

describe('TeachersService', () => {
  let service: TeachersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a teacher successfully', async () => {
      const createTeacherDto: CreateTeacherDto = {
        userId: 'user-uuid',
        nip: '123456',
        name: 'John Doe',
        phone: '08123456789',
      };

      const expectedTeacher = {
        id: 'teacher-uuid',
        ...createTeacherDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTeachers.findFirst.mockResolvedValue(null);
      mockTeachers.create.mockResolvedValue(expectedTeacher);

      const result = await service.create(createTeacherDto);

      expect(mockTeachers.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { userId: createTeacherDto.userId },
            { nip: createTeacherDto.nip },
          ],
        },
      });
      expect(mockTeachers.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          updatedAt: expect.any(Date),
          ...createTeacherDto,
        },
      });
      expect(result).toEqual(expectedTeacher);
    });

    it('should throw NotFoundException if userId or nip already exists', async () => {
      const createTeacherDto: CreateTeacherDto = {
        userId: 'user-uuid',
        nip: '123456',
        name: 'John Doe',
        phone: '08123456789',
      };

      mockTeachers.findFirst.mockResolvedValue({
        id: 'existing-teacher',
        userId: 'user-uuid',
        nip: '123456',
        name: 'Existing Teacher',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.create(createTeacherDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTeachers.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all teachers with selected fields', async () => {
      const expectedTeachers = [
        {
          id: 'teacher-1',
          nip: '123456',
          name: 'John Doe',
          phone: '08123456789',
          createdAt: new Date(),
          users: { email: 'john@example.com', role: 'TEACHER' },
        },
      ];

      mockTeachers.findMany.mockResolvedValue(expectedTeachers);

      const result = await service.findAll();

      expect(mockTeachers.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          nip: true,
          name: true,
          phone: true,
          createdAt: true,
          users: {
            select: { email: true, role: true },
          },
        },
      });
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

      mockTeachers.findUnique.mockResolvedValue(expectedTeacher);

      const result = await service.findOne(teacherId);

      expect(mockTeachers.findUnique).toHaveBeenCalledWith({
        where: { id: teacherId },
        include: {
          users: {
            select: { email: true, isActive: true },
          },
          courses: true,
          schedules: true,
        },
      });
      expect(result).toEqual(expectedTeacher);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      const teacherId = 'non-existent-id';

      mockTeachers.findUnique.mockResolvedValue(null);

      await expect(service.findOne(teacherId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a teacher successfully', async () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTeachers.update.mockResolvedValue(expectedUpdatedTeacher);

      const result = await service.update(teacherId, updateTeacherDto);

      expect(mockTeachers.update).toHaveBeenCalledWith({
        where: { id: teacherId },
        data: updateTeacherDto,
      });
      expect(result).toEqual(expectedUpdatedTeacher);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      const teacherId = 'non-existent-id';
      const updateTeacherDto: UpdateTeacherDto = { name: 'Updated Name' };

      mockTeachers.update.mockRejectedValue({
        code: 'P2025',
        message: 'Record not found',
      });

      await expect(service.update(teacherId, updateTeacherDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a teacher successfully', async () => {
      const teacherId = 'teacher-uuid';

      mockTeachers.delete.mockResolvedValue({
        id: teacherId,
        userId: 'user-uuid',
        nip: '123456',
        name: 'John Doe',
        phone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.remove(teacherId);

      expect(mockTeachers.delete).toHaveBeenCalledWith({
        where: { id: teacherId },
      });
      expect(result).toEqual({
        message: `Teacher with ID "${teacherId}" successfully deleted.`,
      });
    });

    it('should throw NotFoundException if teacher not found', async () => {
      const teacherId = 'non-existent-id';

      mockTeachers.delete.mockRejectedValue({
        code: 'P2025',
        message: 'Record not found',
      });

      await expect(service.remove(teacherId)).rejects.toThrow(NotFoundException);
    });
  });
});
