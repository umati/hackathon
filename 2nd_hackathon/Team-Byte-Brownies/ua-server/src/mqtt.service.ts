import { Injectable, ConsoleLogger } from '@nestjs/common';
import {
  AsyncMqttClient,
  IClientSubscribeOptions,
  connectAsync,
} from 'async-mqtt';

@Injectable()
export class MqttService {
  private _client: AsyncMqttClient;
  constructor(private readonly _logger: ConsoleLogger) {
    this._logger.setContext(MqttService.name);
  }

  async onApllicationShutdown() {
    await this.disconnectClient();
  }

  async connectClient(brokerURL: string) {
    this._client = await connectAsync(brokerURL);
  }

  async disconnectClient(force: boolean = false) {
    this._client.end(force);
  }

  async publish(topic: string, message: any) {
    if (this._client.connected) {
      try {
        await this._client.publish(topic, message);
      } catch (e) {
        this._logger.log(e.stack);
      }
    }
  }

  async subscribe(
    topic: string,
    options: IClientSubscribeOptions = { qos: 2 },
  ) {
    if (this._client.connected) {
      await this._client.subscribe(topic, options);
      this._logger.log('subscribed to topic - ' + topic);
    }
  }

  async unsubscribe(topic: string) {
    if (this._client.connected) {
      await this._client.unsubscribe(topic);
    }
  }

  async listenToMessages(callback: (topic: string, message: any) => any) {
    this._client.on('message', (topic, message) => {
      console.log('original', topic, message);
      return callback(topic, message);
    });
  }
}
