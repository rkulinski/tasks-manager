import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app.module';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { TaskStatus } from 'src/tasks/dto/create-task.dto';
import { TasksService } from 'src/tasks/tasks.service';
import { TasksController } from 'src/tasks/tasks.controller';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let tasksService: TasksService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    tasksService = app.get<TasksService>(TasksService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    // @ts-expect-error skip for testing
    tasksService.tasks = [];
  });

  const createTask = (overrides: Partial<CreateTaskDto> = {}) => {
    const now = new Date();
    const later = new Date(now.getTime() + 1);
    return {
      title: 'Test Task',
      userId: 'user1',
      startTime: now.toISOString(),
      endTime: later.toISOString(),
      ...overrides,
    };
  };

  it('/tasks (POST) should create a task', async () => {
    const mockTask = createTask();

    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send(mockTask)
      .expect(201);

    expect(response.body).toMatchObject({
      title: mockTask.title,
      userId: mockTask.userId,
      status: TaskStatus.OPEN,
    });
  });

  it('/tasks (GET) should return correct task', async () => {
    const mockTask = createTask();
    await request(app.getHttpServer())
      .post('/tasks')
      .send(mockTask)
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);
    const responsePayload = response.body as ReturnType<
      TasksController['findAll']
    >;

    expect(Array.isArray(responsePayload)).toBe(true);
    expect(responsePayload.length).toEqual(1);
    expect(responsePayload[0].title).toEqual(mockTask.title);
  });

  it('/tasks (GET) should return all tasks', async () => {
    const now = new Date();
    await request(app.getHttpServer())
      .post('/tasks')
      .send(
        createTask({
          startTime: new Date(now.getTime() + 1).toISOString(),
          endTime: new Date(now.getTime() + 2).toISOString(),
        }),
      )
      .expect(201);
    await request(app.getHttpServer())
      .post('/tasks')
      .send(
        createTask({
          startTime: new Date(now.getTime() + 2).toISOString(),
          endTime: new Date(now.getTime() + 3).toISOString(),
        }),
      )
      .expect(201);

    const response = await request(app.getHttpServer())
      .get('/tasks')
      .expect(200);
    const responsePayload = response.body as ReturnType<
      TasksController['findAll']
    >;

    expect(responsePayload.length).toEqual(2);
  });
});
