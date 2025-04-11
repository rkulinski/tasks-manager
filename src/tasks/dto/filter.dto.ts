import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TaskStatus } from './create-task.dto';

export class FilterTasksDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
