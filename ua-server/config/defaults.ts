export class Defaults {
  static readonly OpcuaServerPort = 4334;
  static readonly OpcuaServerResourcePath = '/ua/umati';

  static readonly OpcuaServerNodeSetPath = 'nodeset';
  static readonly OpcuaServerNodeSet = [
    'Opc.Ua.NodeSet2.xml',
    'Opc.Ua.Di.NodeSet2.xml',
    'Opc.Ua.IA.NodeSet2.xml',
    'Opc.Ua.Machinery.NodeSet2.xml',
    'Opc.Ua.MachineTool.NodeSet2.xml',
    'byte_brownie_ua1.05.xml',
  ];
}
