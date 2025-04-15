import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { TaskStatus } from './create-task.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterTasksDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
