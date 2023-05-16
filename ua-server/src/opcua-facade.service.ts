import { Injectable } from '@nestjs/common';
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

@Injectable()
export class OpcuaFacadeService {
  constructor(private readonly _server: OpcuaServerService) {
    this._server
      .initialize()
      .pipe(
        switchMap(() => this._server.start()),
        catchError((error) => {
          console.log(error);
          return of(error);
        }),
        mergeMap(() =>
          from([
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
          ]),
        ),
        map((newValue) => {
          this._server.writeSingleNode(
            newValue.ns,
            newValue.id,
            newValue.dt,
            newValue.value,
          );
          return this._server.readSingleNode(newValue.ns, newValue.id).value;
        }),
        toArray(),
      )
      .subscribe((result) => console.log(result));
  }
}
