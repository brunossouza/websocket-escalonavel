import { Test, TestingModule } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { ChatGateway } from './chat.gateway';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let mockServer: Partial<Server>;
  let mockSocket: Partial<Socket>;

  beforeEach(async () => {
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatGateway],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    gateway.server = mockServer as Server;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should log client connection', () => {
      const loggerSpy = jest.spyOn(gateway['logger'], 'log');
      mockSocket = { id: 'test-client-id' };

      gateway.handleConnection(mockSocket as Socket);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cliente conectado: test-client-id'),
      );
    });
  });

  describe('handleRegistrar', () => {
    it('should join room and emit registered', async () => {
      const loggerSpy = jest.spyOn(gateway['logger'], 'log');
      mockSocket = {
        id: 'test-client-id',
        join: jest.fn().mockResolvedValue(undefined),
        emit: jest.fn(),
      };

      await gateway.handleRegistrar(mockSocket as Socket);

      expect(mockSocket.join).toHaveBeenCalledWith('roomChatTest');
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Cliente test-client-id registrado na room roomChatTest',
        ),
      );
      expect(mockSocket.emit).toHaveBeenCalledWith('registrado', {
        room: 'roomChatTest',
      });
    });
  });

  describe('handleMessages', () => {
    it('should emit message to rooms', () => {
      const loggerSpy = jest.spyOn(gateway['logger'], 'log');
      const debugSpy = jest.spyOn(gateway['logger'], 'debug');
      mockSocket = {
        id: 'test-client-id',
        rooms: new Set(['roomChatTest']),
      };
      const data = { nickname: 'test-nick', message: 'test-msg' };

      gateway.handleMessages(mockSocket as Socket, data);

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Mensagem recebida no de test-client-id: test-nick - test-msg',
        ),
      );
      expect(debugSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Cliente test-client-id está nas rooms: roomChatTest',
        ),
      );
      expect(mockServer.to).toHaveBeenCalledWith(['roomChatTest']);
      expect(mockServer.emit).toHaveBeenCalledWith('messages', {
        nickname: 'test-nick',
        message: 'test-msg',
        server: expect.any(String),
      });
    });

    it('should handle no rooms', () => {
      mockSocket = {
        id: 'test-client-id',
        rooms: new Set(),
      };
      const data = { nickname: 'test-nick', message: 'test-msg' };

      gateway.handleMessages(mockSocket as Socket, data);

      expect(mockServer.to).toHaveBeenCalledWith([]);
    });
  });
});
