import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { FilterTasksDto } from './dto/filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  create(createTaskDto: CreateTaskDto): Task {
    const task = new Task(createTaskDto);
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
