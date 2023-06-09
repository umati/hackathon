# UA Server

Provides opcua server with umati nodeset.

To start:

```shell
yarn start:dev
```

## Docker

The docker build was created following this [GUIDE](https://www.tomray.dev/nestjs-docker-production)

To build the production image, the following command will execute the docker build:

```shell
yarn docker:build
```

To run the server, simply run

```shell
yarn docker:up umati.server
```

## MQTT Broker

The image used for the MQTT broker on the WAGO plc can be found [here](https://hub.docker.com/r/arm32v6/eclipse-mosquitto/)