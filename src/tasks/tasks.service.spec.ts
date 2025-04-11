import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { v4 as uuidv4 } from 'uuid';

const ONE_HOUR = 3600000;

describe('TasksService', () => {
  let service: TasksService;
  const userId = uuidv4();

  const createDto = (
    overrides: Partial<CreateTaskDto> = {},
  ): CreateTaskDto => ({
    title: 'Test task',
    description: 'Test desc',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + ONE_HOUR).toISOString(),
    userId,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task', () => {
    const task = service.create(createDto());
    expect(task).toHaveProperty('id');
    expect(task.title).toBe('Test task');
    expect(task.status).toBe(TaskStatus.OPEN);
  });

  it('should complete a task', () => {
    const task = service.create(createDto());
    const updated = service.update(task.id, { status: TaskStatus.COMPLETED });
    expect(updated.status).toBe(TaskStatus.COMPLETED);
  });

  it('should filter tasks by status', () => {
    service.create(createDto());
    const task2 = service.create(
      createDto({
        title: 'done task',
        startTime: new Date(Date.now() + 2 * ONE_HOUR).toISOString(),
      }),
    );
    service.update(task2.id, { status: TaskStatus.COMPLETED });

    const open = service.findAll({ status: TaskStatus.OPEN });
    const completed = service.findAll({ status: TaskStatus.COMPLETED });

    expect(open).toHaveLength(1);
    expect(completed).toHaveLength(1);
    expect(completed[0].title).toBe('done task');
  });

  it('should filter tasks by userId and status', () => {
    const otherUser = uuidv4();
    service.create(createDto());
    service.create(createDto({ userId: otherUser }));

    const userTasks = service.findAll({ userId });
    expect(userTasks.every((t) => t.userId === userId)).toBe(true);
  });

  it('should limit user to 5 tasks per minute', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) {
      service.create(
        createDto({
          startTime: new Date(now + i * 60000).toISOString(),
          endTime: new Date(now + (i + 1) * 60000).toISOString(),
        }),
      );
    }

    expect(() => {
      service.create(
        createDto({
          startTime: new Date(now + 6 * 60000).toISOString(),
          endTime: new Date(now + 7 * 60000).toISOString(),
        }),
      );
    }).toThrow('User cannot create more than 5 tasks per minute');
  });

  it('should prevent overlapping tasks for a user', () => {
    const start = new Date(Date.now());
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    service.create(
      createDto({
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      }),
    );

    expect(() => {
      service.create(
        createDto({
          startTime: new Date(start.getTime() + 30 * 60 * 1000).toISOString(), // 30min overlap
          endTime: new Date(end.getTime() + 30 * 60 * 1000).toISOString(),
        }),
      );
    }).toThrow('Task overlaps with an existing task for this user');
  });

  it('should enforce global 20 task limit in 5 minutes (optional)', () => {
    const fiveMinAgo = Date.now() - 4 * 60 * 1000;

    for (let i = 0; i < 20; i++) {
      const uid = uuidv4();
      const offset = i * 10000;
      service.create(
        createDto({
          userId: uid,
          startTime: new Date(fiveMinAgo + offset).toISOString(),
          endTime: new Date(fiveMinAgo + offset + 60000).toISOString(),
        }),
      );
    }

    expect(() => {
      service.create(
        createDto({
          userId: uuidv4(),
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 60000).toISOString(),
        }),
      );
    }).toThrow('Global task creation limit exceeded (20 tasks / 5 minutes)');
  });
});
