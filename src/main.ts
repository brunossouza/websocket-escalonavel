import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './redis-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir conexões do navegador
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Aplicação rodando em http://0.0.0.0:${port}`);
}
void bootstrap();
