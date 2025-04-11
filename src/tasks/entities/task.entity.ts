import { TaskStatus } from '../dto/create-task.dto';
import { v4 as uuidv4 } from 'uuid';

export class Task {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  userId: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Task>) {
    Object.assign(this, partial);
    this.id = uuidv4();
    this.status = partial.status ?? TaskStatus.OPEN;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  markCompleted() {
    this.status = TaskStatus.COMPLETED;
    this.updatedAt = new Date();
  }
}
