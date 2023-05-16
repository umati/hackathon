import { ConsoleLogger, Injectable } from '@nestjs/common';
import { OpcuaServerService } from './opcua-server.service';
import {
  catchError,
  from,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  timer,
  toArray,
} from 'rxjs';
import { DataType, coerceLocalizedText } from 'node-opcua';
import { read } from 'fs';
import { MqttService } from './mqtt.service';

@Injectable()
export class OpcuaFacadeService {
  constructor(
    private readonly _server: OpcuaServerService,
    private readonly _mqtt: MqttService,
    private readonly _logger: ConsoleLogger,
  ) {
    this._server
      .initialize()
      .pipe(
        switchMap(() => this._server.start()),
        catchError((error) => {
          console.log(error);
          return of(error);
        }),
        mergeMap(() => this._initialOverwrites()),
        tap((newValue) => {
          this._server.writeSingleNode(
            newValue.ns,
            newValue.id,
            newValue.dt,
            newValue.value,
          );
        }),
        toArray(),
        switchMap(() => this.initMqtt()),
      )
      .subscribe();
  }

  initMqtt() {
    return from(this._mqtt.connectClient('mqtt://192.168.1.17:1883')).pipe(
      switchMap(() => from(this._mqtt.subscribe('Brownie/#'))),
      switchMap(() =>
        from(
          this._mqtt.listenToMessages((topic, message) => {
            const buffer = Buffer.from(message, 'binary');
            this._logger.log(
              `Received a message of topic ${topic} and content ${buffer.toString(
                'hex',
              )}`,
            );
          }),
        ),
      ),
    );
  }

  private _initialOverwrites() {
    return from([
      {
        ns: 6,
        id: 6008,
        dt: DataType.LocalizedText,
        value: coerceLocalizedText({
          locale: 'en',
          text: 'Byte Brownies',
        }),
      },
      {
        ns: 6,
        id: 6009,
        dt: DataType.String,
        value: 'https://github.com/cwtimobarth/team-byte-brownies/',
      },
      {
        ns: 6,
        id: 6010,
        dt: DataType.String,
        value: '42',
      },
    ]);
  }
}
