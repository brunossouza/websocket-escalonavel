import { Module } from '@nestjs/common';
import { RedisIoAdapter } from './infrastructure/redis-io.adapter';
import { ChatGateway } from './presentation/chat.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [ChatGateway, RedisIoAdapter],
  exports: [RedisIoAdapter],
})
export class ChatModule {}
