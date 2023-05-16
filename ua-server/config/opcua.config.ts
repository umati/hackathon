import { Defaults } from './defaults';

export interface OpcuaServerInfoConfig {
  port: number;
  resourcePath: string;
}

export interface OpcuaServerConfig {
  serverInfo: OpcuaServerInfoConfig;
  nodeSetPath: string;
  nodeset: string[];
  hostname: string;
}

export default (): OpcuaServerConfig => ({
  serverInfo: {
    port:
      parseInt(process.env.OPCUA_SERVER_PORT, 10) || Defaults.OpcuaServerPort,
    resourcePath:
      process.env.OPCUA_SERVER_RESOURCE_PATH ||
      Defaults.OpcuaServerResourcePath,
  },
  nodeset: Defaults.OpcuaServerNodeSet,
  nodeSetPath:
    process.env.OPCUA_SERVER_NODESET_PATH || Defaults.OpcuaServerNodeSetPath,
  hostname: process.env.OPCUA_SERVER_HOST
});
