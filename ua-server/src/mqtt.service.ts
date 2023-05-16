import { Injectable, ConsoleLogger  } from "@nestjs/common";
import { OpcuaServerService } from "./opcua-server.service";
import { AsyncMqttClient, connectAsync } from "async-mqtt";

@Injectable()
export class MqttService {
    private _client: AsyncMqttClient;
    constructor(private readonly _logger: ConsoleLogger, private _opcuaService: OpcuaServerService) {
        this._logger.setContext(MqttService.name);
        this._logger.log('I AM RUNNING!');
        this.connectClient('mqtt://test.mosquitto.org');
        this._initializeListeners();
    }

   async connectClient(brokerURL: string) {
       this._client = await connectAsync(brokerURL);
    }

    private _initializeListeners(){
        if(this._client.connected){
            console.log('Successfully Connected!');
        }
    }

}