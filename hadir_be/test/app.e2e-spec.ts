import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

describe('Teachers (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/teachers (GET) - should return all teachers', () => {
    return request(app.getHttpServer())
      .get('/teachers')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/teachers (POST) - should create a teacher', () => {
    const createTeacherDto = {
      userId: 'test-user-uuid',
      nip: '987654',
      name: 'Jane Doe',
      phone: '08198765432',
    };

    return request(app.getHttpServer())
      .post('/teachers')
      .send(createTeacherDto)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.nip).toBe(createTeacherDto.nip);
        expect(res.body.name).toBe(createTeacherDto.name);
      });
  });

  it('/teachers/:id (GET) - should return a teacher by id', async () => {
    // First create a teacher
    const createTeacherDto = {
      userId: 'test-user-uuid-2',
      nip: '555555',
      name: 'Bob Smith',
      phone: '08155555555',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/teachers')
      .send(createTeacherDto)
      .expect(201);

    const teacherId = createResponse.body.id;

    // Then get the teacher
    return request(app.getHttpServer())
      .get(`/teachers/${teacherId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(teacherId);
        expect(res.body.nip).toBe(createTeacherDto.nip);
        expect(res.body.name).toBe(createTeacherDto.name);
      });
  });

  it('/teachers/:id (PATCH) - should update a teacher', async () => {
    // First create a teacher
    const createTeacherDto = {
      userId: 'test-user-uuid-3',
      nip: '666666',
      name: 'Alice Johnson',
      phone: '08166666666',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/teachers')
      .send(createTeacherDto)
      .expect(201);

    const teacherId = createResponse.body.id;
    const updateTeacherDto = {
      name: 'Alice Updated',
      phone: '08177777777',
    };

    // Then update the teacher
    return request(app.getHttpServer())
      .patch(`/teachers/${teacherId}`)
      .send(updateTeacherDto)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(teacherId);
        expect(res.body.name).toBe(updateTeacherDto.name);
        expect(res.body.phone).toBe(updateTeacherDto.phone);
      });
  });

  it('/teachers/:id (DELETE) - should delete a teacher', async () => {
    // First create a teacher
    const createTeacherDto = {
      userId: 'test-user-uuid-4',
      nip: '777777',
      name: 'Charlie Brown',
      phone: '08177777777',
    };

    const createResponse = await request(app.getHttpServer())
      .post('/teachers')
      .send(createTeacherDto)
      .expect(201);

    const teacherId = createResponse.body.id;

    // Then delete the teacher
    return request(app.getHttpServer())
      .delete(`/teachers/${teacherId}`)
      .expect(204);
  });

  it('/teachers/:id (GET) - should return 404 for non-existent teacher', () => {
    return request(app.getHttpServer())
      .get('/teachers/non-existent-id')
      .expect(404);
  });
});
