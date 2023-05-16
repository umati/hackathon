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
import { Signal } from './signal';

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
      switchMap(() => from(this._mqtt.subscribe('brownie/#'))),
      switchMap(() =>
        from(this._mqtt.listenToMessages(this._handleMqttMessages)),
      ),
    );
  }

  private _handleMqttMessages = (topic: string, message) => {
    this._handleValues(
      this._getSignal(topic),
      !!Buffer.from(message, 'binary').readInt8(),
    );
  };

  _handleValues(signal: Signal, value: boolean) {
    switch (signal) {
      case Signal.SteuerungEin:
        console.log(signal, value);
        break;
      case Signal.Notaus:
        console.log(signal, value);
        break;
      case Signal.EnergieEin:
        console.log(signal, value);
        break;
      case Signal.SpindelEin:
        console.log(signal, value);
        break;
      case Signal.StartLader:
        console.log(signal, value);
        break;
      case Signal.ZyklusStart:
        console.log(signal, value);
        break;
      case Signal.ZyklusStopp:
        console.log(signal, value);
        break;
    }
  }

  _getSignal(topic: string) {
    const parts = topic.split('/');
    return parseInt(parts[2], 10) as Signal;
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
