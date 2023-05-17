import { NestFactory } from '@nestjs/core';
import { AppModule as OpcuaModule } from './opcua.module';
import { INestApplicationContext } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(OpcuaModule);

  process.on('SIGINT', async () => await closeAll(app));
  process.on('SIGTERM', async () => await closeAll(app));
}

async function closeAll(app: INestApplicationContext) {
  await app.close();
}

bootstrap();
