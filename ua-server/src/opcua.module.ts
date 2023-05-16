import { Module, ConsoleLogger } from '@nestjs/common';
import { OpcuaServerService } from './opcua-server.service';
import { ConfigModule } from '@nestjs/config';
import { OpcuaFacadeService } from './opcua-facade.service';
import opcuaConfig from 'config/opcua.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [opcuaConfig],
    }),
  ],
  controllers: [],
  providers: [OpcuaServerService, ConsoleLogger, OpcuaFacadeService],
})
export class AppModule {}
