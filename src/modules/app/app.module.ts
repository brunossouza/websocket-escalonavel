import { Module } from '@nestjs/common';
import { AppService } from './application/app.service';
import { AppController } from './presentation/app.controller';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
