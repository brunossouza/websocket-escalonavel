import { INestApplicationContext, Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import * as os from 'os';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  // use a permissive type to match the adapter factory returned by createAdapter
  private adapterConstructor: any;
  private readonly logger = new Logger(RedisIoAdapter.name);

  // accept the Nest application instance and pass it to super()
  constructor(app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.logger.log(`[${os.hostname()}] - Conectando ao Redis: ${redisUrl}`);

    const pubClient = createClient({
      url: redisUrl,
    });
    this.logger.debug(`[${os.hostname()}] - PubClient criado`);

    const subClient = pubClient.duplicate();
    this.logger.debug(`[${os.hostname()}] - SubClient duplicado`);

    this.logger.debug(
      `[${os.hostname()}] - Iniciando conexão dos clientes Redis...`,
    );
    await Promise.all([pubClient.connect(), subClient.connect()]);
    this.logger.debug(
      `[${os.hostname()}] - Clientes Redis conectados com sucesso`,
    );

    this.adapterConstructor = createAdapter(pubClient, subClient);
    this.logger.debug(`[${os.hostname()}] - Adapter criado`);

    this.logger.log(
      `[${os.hostname()}] - ✅ Redis adapter conectado com sucesso`,
    );
  }

  createIOServer(port: number, options?: any): any {
    this.logger.debug(
      `[${os.hostname()}] - Criando servidor Socket.IO na porta ${port}`,
    );
    const server = super.createIOServer(port, options);
    this.logger.debug(
      `[${os.hostname()}] - Aplicando Redis adapter ao servidor`,
    );
    server.adapter(this.adapterConstructor);

    this.logger.log(
      `[${os.hostname()}] - Servidor Socket.IO criado com Redis adapter`,
    );
    return server;
  }

  // satisfy WebSocketAdapter interface (required by app.useWebSocketAdapter)
  bindClientConnect(server: any, callback: Function): any {
    this.logger.debug(
      `[${os.hostname()}] - Registrando handler de conexão de clientes`,
    );
    // socket.io emits 'connection' for each client
    server.on('connection', (socket: any) => {
      this.logger.debug(
        `[${os.hostname()}] - Nova conexão detectada: ${socket.id}`,
      );
      callback(socket);
    });
  }
}
