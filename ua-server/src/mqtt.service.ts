import { Injectable, ConsoleLogger  } from "@nestjs/common";
import { OpcuaServerService } from "./opcua-server.service";
import { AsyncMqttClient, IClientSubscribeOptions, ISubscriptionMap, connectAsync } from "async-mqtt";

@Injectable()
export class MqttService {
    private _client: AsyncMqttClient;
    constructor(private readonly _logger: ConsoleLogger, private _opcuaService: OpcuaServerService) {
        this._logger.setContext(MqttService.name);
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

    async subscribe(topic: string, options: IClientSubscribeOptions= {qos: 2}) {
        if(this._client.connected){
            await this._client.subscribe(topic, options);
        }
    }

    async unsubscribe(topic: string) {
        if(this._client.connected){
            await this._client.unsubscribe(topic);
        }
    }

    async listenToMessages(){
        this._client.on('message', (topic, message) => {
            this._logger.log(`Received a message of topic: ${topic}, and message: ${message}`);
        })
    }
}