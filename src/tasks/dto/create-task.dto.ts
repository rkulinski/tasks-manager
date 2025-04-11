import {
  IsDateString,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
} from 'class-validator';

export enum TaskStatus {
  OPEN = 'open',
  COMPLETED = 'completed',
}

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;
}
