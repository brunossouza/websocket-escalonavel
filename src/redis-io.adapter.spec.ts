import { INestApplicationContext } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { RedisIoAdapter } from './redis-io.adapter';

jest.mock('@socket.io/redis-adapter', () => ({
  createAdapter: jest.fn(),
}));

jest.mock('redis', () => ({
  createClient: jest.fn(),
}));

describe('RedisIoAdapter', () => {
  let adapter: RedisIoAdapter;
  let mockApp: Partial<INestApplicationContext>;
  let mockPubClient: any;
  let mockSubClient: any;
  let mockAdapterConstructor: any;

  beforeEach(async () => {
    mockApp = {};
    mockPubClient = {
      connect: jest.fn().mockResolvedValue(undefined),
      duplicate: jest.fn().mockReturnValue(mockSubClient),
    };
    mockSubClient = { connect: jest.fn().mockResolvedValue(undefined) };
    mockAdapterConstructor = jest.fn();

    (createClient as jest.Mock).mockReturnValue(mockPubClient);
    (createAdapter as jest.Mock).mockReturnValue(mockAdapterConstructor);

    adapter = new RedisIoAdapter(mockApp as INestApplicationContext);
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  describe('connectToRedis', () => {
    it('should connect to Redis and create adapter', async () => {
      const loggerSpy = jest.spyOn(adapter['logger'], 'log');

      await adapter.connectToRedis();

      expect(createClient).toHaveBeenCalledWith({
        url: 'redis://localhost:6379',
      });
      expect(mockPubClient.duplicate).toHaveBeenCalled();
      expect(mockPubClient.connect).toHaveBeenCalled();
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ Redis adapter conectado com sucesso'),
      );
    });

    it('should use custom Redis URL from env', async () => {
      process.env.REDIS_URL = 'redis://custom:6379';
      const newAdapter = new RedisIoAdapter(mockApp as INestApplicationContext);

      await newAdapter.connectToRedis();

      expect(createClient).toHaveBeenCalledWith({ url: 'redis://custom:6379' });
      delete process.env.REDIS_URL;
    });
  });

  describe('createIOServer', () => {
    beforeEach(async () => {
      await adapter.connectToRedis();
    });

    it('should create server with adapter', () => {
      const mockServer = {
        adapter: jest.fn(),
      };
      const superCreateIOServer = jest
        .spyOn(IoAdapter.prototype, 'createIOServer')
        .mockReturnValue(mockServer);

      const result = adapter.createIOServer(3000, {});

      expect(superCreateIOServer).toHaveBeenCalledWith(3000, {});
      expect(mockServer.adapter).toHaveBeenCalledWith(mockAdapterConstructor);
      expect(result).toBe(mockServer);
    });
  });

  describe('bindClientConnect', () => {
    it('should bind client connect handler', () => {
      const mockServer = {
        on: jest.fn(),
      };
      const callback = jest.fn();

      adapter.bindClientConnect(mockServer, callback);

      expect(mockServer.on).toHaveBeenCalledWith(
        'connection',
        expect.any(Function),
      );
    });
  });
});
