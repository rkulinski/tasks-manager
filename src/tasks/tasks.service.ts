import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTasksDto } from './dto/filter.dto';
import { Task } from './entities/task.entity';

const ONE_MINUTE = 60 * 1000;

const TasksCreationLimits = {
  user: {
    timeWindow: ONE_MINUTE,
    limit: 5,
  },
  global: {
    timeWindow: 5 * ONE_MINUTE,
    limit: 20,
  },
} as const;

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  create(createTaskDto: CreateTaskDto): Task {
    const now = new Date();
    const task = new Task(createTaskDto);

    const recentUserTasks = this.tasks.filter(
      (t) =>
        t.userId === createTaskDto.userId &&
        now.getTime() - new Date(t.createdAt).getTime() <=
          TasksCreationLimits.user.timeWindow,
    );
    if (recentUserTasks.length >= TasksCreationLimits.user.limit) {
      throw new BadRequestException(
        'User cannot create more than 5 tasks per minute',
      );
    }

    const newStart = new Date(createTaskDto.startTime).getTime();
    const newEnd = new Date(createTaskDto.endTime).getTime();

    const overlapping = this.tasks.find((t) => {
      if (t.userId !== createTaskDto.userId) return false;
      const existingStart = new Date(t.startTime).getTime();
      const existingEnd = new Date(t.endTime).getTime();
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (overlapping) {
      throw new BadRequestException(
        'Task overlaps with an existing task for this user',
      );
    }

    const recentAllTasks = this.tasks.filter(
      (t) =>
        now.getTime() - new Date(t.createdAt).getTime() <=
        TasksCreationLimits.global.timeWindow,
    );
    if (recentAllTasks.length >= TasksCreationLimits.global.limit) {
      throw new BadRequestException(
        'Global task creation limit exceeded (20 tasks / 5 minutes)',
      );
    }

    this.tasks.push(task);
    return task;
  }

  findAll(filter: FilterTasksDto): Task[] {
    const { userId, status } = filter;

    return this.tasks.filter((task) => {
      const matchesUser = userId ? task.userId === userId : true;
      const matchesStatus = status ? task.status === status : true;
      return matchesUser && matchesStatus;
    });
  }

  findOne(id: string): Task {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const task = this.findOne(id);

    if (updateTaskDto.startTime && updateTaskDto.endTime) {
      const newStart = new Date(updateTaskDto.startTime).getTime();
      const newEnd = new Date(updateTaskDto.endTime).getTime();

      const overlapping = this.tasks.find((t) => {
        if (t.userId !== task.userId || t.id === task.id) return false;
        const existingStart = new Date(t.startTime).getTime();
        const existingEnd = new Date(t.endTime).getTime();
        return newStart < existingEnd && newEnd > existingStart;
      });

      if (overlapping) {
        throw new BadRequestException(
          'Task update would overlap with another task for this user',
        );
      }
    }

    Object.assign(task, updateTaskDto);
    task.updatedAt = new Date();
    return task;
  }

  remove(id: string): void {
    const index = this.tasks.findIndex((task) => task.id === id);
    if (index === -1) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    this.tasks.splice(index, 1);
  }
}
