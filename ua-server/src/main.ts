import { NestFactory } from '@nestjs/core';
import { AppModule as OpcuaModule } from './opcua.module';
import { OpcuaServerService } from './opcua-server.service';
import { catchError, switchMap } from 'rxjs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(OpcuaModule);

  process.on('SIGINT', async () => await app.close());
  process.on('SIGTERM', async () => await app.close());
}

bootstrap();
