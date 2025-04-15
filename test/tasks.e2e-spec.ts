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
    // @ts-expect-error: clear tasks after each test
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

    const responsePayload = response.body as ReturnType<
      TasksController['create']
    >;
    expect(responsePayload).toMatchObject({
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

  it('/tasks (GET with filter) should return only tasks for a specific user', async () => {
    await request(app.getHttpServer())
      .post('/tasks')
      .send(createTask({ userId: 'user1' }));
    await request(app.getHttpServer())
      .post('/tasks')
      .send(createTask({ userId: 'user2' }));

    const response = await request(app.getHttpServer())
      .get('/tasks?userId=user1')
      .expect(200);

    const responsePayload = response.body as ReturnType<
      TasksController['findAll']
    >;
    expect(responsePayload.length).toBe(1);
    expect(responsePayload[0].userId).toBe('user1');
  });

  it('/tasks/:id (GET) should return a single task by id', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send(createTask());
    const createdTask = res.body as ReturnType<TasksController['create']>;

    const getRes = await request(app.getHttpServer())
      .get(`/tasks/${createdTask.id}`)
      .expect(200);

    const responsePayload = getRes.body as ReturnType<
      TasksController['findOne']
    >;
    expect(responsePayload.id).toBe(createdTask.id);
    expect(responsePayload.title).toBe(createdTask.title);
  });

  it('/tasks/:id (PATCH) should update a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send(createTask());
    const createdTask = res.body as ReturnType<TasksController['create']>;

    const updatedTitle = 'Updated Task Title';

    const patchRes = await request(app.getHttpServer())
      .patch(`/tasks/${createdTask.id}`)
      .send({ title: updatedTitle })
      .expect(200);

    const responsePayload = patchRes.body as ReturnType<
      TasksController['update']
    >;
    expect(responsePayload.title).toBe(updatedTitle);
  });

  it('/tasks/:id (DELETE) should delete a task', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .send(createTask());
    const createdTask = res.body as ReturnType<TasksController['create']>;

    await request(app.getHttpServer())
      .delete(`/tasks/${createdTask.id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/tasks/${createdTask.id}`)
      .expect(404);
  });
});
