import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import * as os from 'os';

@WebSocketGateway({
  cors: {
    origin: '*', // ajuste conforme necessário para produção
  },
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  // loga quando um cliente se conecta
  handleConnection(client: Socket) {
    this.logger.log(`[${os.hostname()}] - Cliente conectado: ${client.id}`);
  }

  private readonly logger = new Logger(ChatGateway.name);

  @SubscribeMessage('registrar')
  async handleRegistrar(@ConnectedSocket() client: Socket): Promise<void> {
    await client.join('roomChatTest');
    this.logger.log(
      `[${os.hostname()}] - Cliente ${client.id} registrado na room roomChatTest`,
    );
    // confirma para o cliente que ele foi registrado
    client.emit('registrado', { room: 'roomChatTest' });
  }

  @SubscribeMessage('messages')
  handleMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { nickname: string; message: string },
  ): void {
    this.logger.log(
      `[${os.hostname()}] - Mensagem recebida no de ${client.id}: ${data.nickname} - ${data.message}`,
    );
    //pega a room do cliente
    const rooms = Array.from(client.rooms);
    this.logger.debug(
      `[${os.hostname()}] - Cliente ${client.id} está nas rooms: ${rooms.join(
        ', ',
      )}`,
    );

    // envia a mensagem para todos os clientes na room roomChatTest
    this.server.to(rooms.length ? rooms : 'roomChatTest').emit('messages', {
      nickname: data.nickname,
      message: data.message,
      server: os.hostname(),
    });
  }
}
