import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [TasksModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
