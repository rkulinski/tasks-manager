import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter.dto';
import { Task } from './entities/task.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: TasksService;

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  it('should call service.create()', () => {
    const spy = jest.spyOn(tasksService, 'create');
    const taskDto: CreateTaskDto = {
      title: 'Test task',
      userId: 'user123',
      startTime: String(new Date()),
      endTime: String(new Date()),
    };
    const expectedTask = new Task(taskDto);
    spy.mockReturnValueOnce(expectedTask);

    const result = controller.create(taskDto);

    expect(result).toEqual(expectedTask);
    expect(spy).toHaveBeenCalledWith(taskDto);
  });

  it('should call service.findAll() with filters', () => {
    const spy = jest.spyOn(tasksService, 'findAll');
    const filters: FilterTasksDto = { status: TaskStatus.OPEN };
    const expectedTasks = [
      new Task({
        title: 'Task 1',
        userId: 'user1',
        startTime: String(new Date()),
        endTime: String(new Date()),
      }),
    ];
    spy.mockReturnValueOnce(expectedTasks);

    const result = controller.findAll(filters);

    expect(result).toEqual(expectedTasks);
    expect(spy).toHaveBeenCalledWith(filters);
  });

  it('should call service.findOne() with id', () => {
    const spy = jest.spyOn(tasksService, 'findOne');
    const expectedTask = new Task({
      title: 'Task 1',
      userId: 'user1',
      startTime: String(new Date()),
      endTime: String(new Date()),
    });
    spy.mockReturnValueOnce(expectedTask);

    const result = controller.findOne(expectedTask.id);

    expect(result).toEqual(expectedTask);
    expect(spy).toHaveBeenCalledWith(expectedTask.id);
  });

  it('should call service.update() with id and UpdateTaskDto', () => {
    const spy = jest.spyOn(tasksService, 'update');
    const updateDto: UpdateTaskDto = { title: 'Updated title' };
    const updatedTask = new Task({
      title: updateDto.title,
      userId: 'user1',
      startTime: String(new Date()),
      endTime: String(new Date()),
    });
    spy.mockReturnValueOnce(updatedTask);

    const result = controller.update(updatedTask.id, updateDto);

    expect(result).toEqual({ ...updatedTask, ...updateDto });
    expect(spy).toHaveBeenCalledWith(updatedTask.id, updateDto);
  });

  it('should call service.remove() with id', () => {
    const spy = jest.spyOn(tasksService, 'remove');
    const expectedResult = { deleted: true };
    spy.mockReturnValueOnce();

    const result = controller.remove('t1');

    expect(result).toEqual(expectedResult);
    expect(spy).toHaveBeenCalledWith('t1');
  });
});
