import { Injectable, ConsoleLogger  } from "@nestjs/common";
import { OpcuaServerService } from "./opcua-server.service";
import { AsyncMqttClient, IClientSubscribeOptions, ISubscriptionMap, connectAsync } from "async-mqtt";

@Injectable()
export class MqttService {
    private _client: AsyncMqttClient;
    constructor(private readonly _logger: ConsoleLogger, private _opcuaService: OpcuaServerService) {
        this._logger.setContext(MqttService.name);
        //this._initializeListeners();
    }

   async connectClient(brokerURL: string) {
       this._client = await connectAsync(brokerURL);
    }

    async disconnectClient(force: boolean = false){
        this._client.end(force);
    }

    async publish(topic: string, message: any){
        if(this._client.connected){
            try {
                await this._client.publish(topic, message);
            } catch (e){
                this._logger.log(e.stack);
            }
        }
    }

    async subscribe(topic: string, options?: IClientSubscribeOptions) {
        if(this._client.connected){
            let grants = await this._client.subscribe(topic, options);
            grants.forEach(grant => {
                console.log(grant);
            })
        }
    }
}