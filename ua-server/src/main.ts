import { NestFactory } from '@nestjs/core';
import { AppModule as OpcuaModule } from './opcua.module';
import { OpcuaServerService } from './opcua-server.service';
import { catchError, switchMap } from 'rxjs';
import { MqttService } from './mqtt.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(OpcuaModule);
  const uaServer = app.get(OpcuaServerService);
  const mqttService = app.get(MqttService);

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

    await mqttService.connectClient('mqtt://localhost:1883');
    await mqttService.subscribe('Hello/World');
    await mqttService.publish('Hello/World', 'Bye World');
    await mqttService.disconnectClient();

  process.on('SIGINT', async () => await app.close());
  process.on('SIGTERM', async () => await app.close());
}

bootstrap();
