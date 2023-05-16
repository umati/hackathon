import { NestFactory } from '@nestjs/core';
import { AppModule as OpcuaModule } from './opcua.module';
import { OpcuaServerService } from './opcua-server.service';
import { catchError, switchMap } from 'rxjs';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(OpcuaModule);
  const uaServer = app.get(OpcuaServerService);

  uaServer
    .initialize()
    .pipe(
      switchMap(() => uaServer.start()),
      catchError((error) => {
        console.log(error);
        return app.close();
      }),
    )
    .subscribe();

  process.on('SIGINT', async () => await app.close());
  process.on('SIGTERM', async () => await app.close());
}

bootstrap();
