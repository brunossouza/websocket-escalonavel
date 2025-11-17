import { Module } from '@nestjs/common';
import { AppModule as AppSubModule } from './modules/app/app.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [AppSubModule, ChatModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
