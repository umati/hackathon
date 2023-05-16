import { Injectable, ConsoleLogger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpcuaServerConfig, OpcuaServerInfoConfig } from 'config/opcua.config';
import { OPCUAServer } from 'node-opcua';
import { catchError, from, map, mergeMap, switchMap, tap } from 'rxjs';

@Injectable()
export class OpcuaServerService {
  private _server: OPCUAServer;

  constructor(
    private readonly _config: ConfigService<OpcuaServerConfig>,
    private readonly _logger: ConsoleLogger,
  ) {
    const serverInfo = this._config.get<OpcuaServerInfoConfig>('serverInfo');
    this._server = new OPCUAServer({
      port: serverInfo.port,
      resourcePath: serverInfo.resourcePath,
      buildInfo: {
        productName: 'umatiserver',
        buildNumber: '42',
        buildDate: new Date(),
        manufacturerName: 'codewerk',
      },
      hostname: this._config.get('hostname'),
      nodeset_filename: this._config
        .get('nodeset')
        .map((filename) =>
          [this._config.get('nodeSetPath'), filename].join('/'),
        ),
    });
  }

  initialize() {
    return from(this._server.initialize()).pipe(
      tap(() =>
        this._logger.log('server initialized', OpcuaServerService.name),
      ),
      catchError((error) => {
        this._logger.error(error, OpcuaServerService.name);
        throw error;
      }),
    );
  }

  start() {
    return from(this._server.start()).pipe(
      tap(() => {
        this._logger.log('server initialized', OpcuaServerService.name);
        this._logger.log(
          'Server is now listening ... ( press CTRL+C to stop)',
          OpcuaServerService.name,
        );
        this._logger.log(
          'port ' + this._server.endpoints[0].port,
          OpcuaServerService.name,
        );
        this._logger.log(
          'endpoint url: ' +
            this._server.endpoints[0].endpointDescriptions()[0].endpointUrl,
          OpcuaServerService.name,
        );
      }),
    );
  }
}
