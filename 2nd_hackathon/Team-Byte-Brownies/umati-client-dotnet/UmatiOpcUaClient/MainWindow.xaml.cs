using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Windows;
using MQTTnet;
using MQTTnet.Client;
using Opc.Ua;
using Opc.Ua.Export;
using Opc.UaFx;
using Opc.UaFx.Client;
using Opc.UaFx.Server;
using LocalizedText = Opc.Ua.Export.LocalizedText;

namespace UmatiOpcUaClient
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow
    {
        private const string OpcUaNodeSet2 = @"D:\GitRepos\team-byte-brownies\2nd_hackathon\Team-Byte-Brownies\ua-server\nodeset\Opc.Ua.NodeSet2.xml";
        private const string OpcUaMachineToolNodeSet2 = @"D:\GitRepos\team-byte-brownies\2nd_hackathon\Team-Byte-Brownies\ua-server\nodeset\Opc.Ua.MachineTool.NodeSet2.xml";
        private const string OpcUaMachineryNodeSet2 = @"D:\GitRepos\team-byte-brownies\2nd_hackathon\Team-Byte-Brownies\ua-server\nodeset\Opc.Ua.Machinery.NodeSet2.xml";
        private const string OpcUaAiNodeSet2 = @"D:\GitRepos\team-byte-brownies\2nd_hackathon\Team-Byte-Brownies\ua-server\nodeset\Opc.Ua.IA.NodeSet2.xml";
        private const string OpcUaDiNodeSet2 = @"D:\GitRepos\team-byte-brownies\2nd_hackathon\Team-Byte-Brownies\ua-server\nodeset\Opc.Ua.Di.NodeSet2.xml";
        private const string ByteBrownieNodeSet = @"D:\GitRepos\team-byte-brownies\2nd_hackathon\Team-Byte-Brownies\ua-server\nodeset\byte_brownie_ua1.05.xml";

        private OpcServer _server;
        private bool _opcUaServerIsRunning;
        private OpcClient _client;
        private bool _opcUaClientIsRunning;

        private OpcDataVariableNode<int> _testNode;

        private OpcDataVariableNode<int> _operationNode = new OpcDataVariableNode<int>("");
        private OpcDataVariableNode<bool> _spindelIsRotating;
        private OpcDataVariableNode<bool> _wssSpindelIsRotating;
        private OpcDataVariableNode<LocalizedText> _productionState;

        private List<UANode> _allNodes = new List<UANode>();

        private string _mqttServerUri = "mqtt.192.168.1.17:1883";
        private IMqttClient _mqttClient;

        public MainWindow()
        {
            InitializeComponent();

            Loaded += Window_OnLoaded;

            Application.Current.Exit += App_OnExit;
            Unloaded += Window_OnUnloaded;
        }

        private void Window_OnLoaded(object sender, RoutedEventArgs e)
        {
            StartOpcUaClient();

            Task.Run(ConnectMqttClient);
        }

        private void Window_OnUnloaded(object sender, RoutedEventArgs e)
        {
            StopOpcUaClient();
        }

        private void App_OnExit(object sender, ExitEventArgs e)
        {
            StopOpcUaClient();

            Task.Run(DisconnectMqttClient);
        }

        private void StartUpcUaServer()
        {
            _server = new OpcServer("opc.tcp://localhost:4840/", _testNode);

            var thread = new Thread(OpcUaServerThread);
            thread.Start();
        }

        private void OpcUaServerThread()
        {
            _opcUaServerIsRunning = true;

            _server.Start();

            while (_opcUaServerIsRunning)
            {
                if (_testNode.Value == 110)
                    _testNode.Value = 100;
                else
                    _testNode.Value++;

                _testNode.ApplyChanges(_server.SystemContext);

                Thread.Sleep(1000);
            }
        }

        private void StopOpcUaServer()
        {
            _opcUaServerIsRunning = false;
        }

        private void LoadExternalReferences()
        {
            var externalReferences = new Dictionary<NodeId, IList<IReference>>();

            _testNode = new OpcDataVariableNode<int>("Temperature", 100);

            // ensure the reverse refernces exist.
            AddReverseReferences(externalReferences);
        }

        private void LoadUmatiNodeSet(string resourcepath)
        {
            try
            {
                var predefinedNodes = new NodeStateCollection();

                var stream = new FileStream(resourcepath, FileMode.Open);
                var nodeSet = UANodeSet.Read(stream);

                foreach (var node in nodeSet.Items)
                {
                    //systemContext.NamespaceUris.GetIndexOrAppend(namespaceUri);
                    Console.WriteLine($"BrowsName:{node.BrowseName} NodeId:{node.NodeId} DisplayName:{GetDisplayName(node.DisplayName)}");
                    _allNodes.Add(node);
                }

                Console.WriteLine();
                //nodeSet.Import(systemContext, predefinedNodes);

                for (var i = 0; i < predefinedNodes.Count; i++)
                {
                    //AddPredefinedNode(systemContext, predefinedNodes[i]);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }

        private string GetDisplayName(LocalizedText[] displayName)
        {
            if(!displayName.Any())
                return string.Empty;

            return displayName[0].Value;
        }
        
        private void AddPredefinedNode(SystemContext systemContext, NodeState nodeState)
        {

        }

        private void AddReverseReferences(IDictionary<NodeId, IList<IReference>> externalReferences)
        {

        }

        private void StartOpcUaClient()
        {
            _client = new OpcClient("opc.tcp://192.168.1.42:4334");

            //LoadExternalReferences();

            //LoadUmatiNodeSet(OpcUaNodeSet2);
            //LoadUmatiNodeSet(OpcUaMachineToolNodeSet2);
            //LoadUmatiNodeSet(OpcUaMachineryNodeSet2);
            //LoadUmatiNodeSet(OpcUaAiNodeSet2);
            //LoadUmatiNodeSet(OpcUaDiNodeSet2);
            LoadUmatiNodeSet(ByteBrownieNodeSet);

            var thread = new Thread(OpcUaClientThread);
            thread.Start();
        }

        private void OpcUaClientThread()
        {
            try
            {
                _opcUaClientIsRunning = true;

                _client.Connect();

                while (_client.State == OpcClientState.Connecting)
                {
                    Console.WriteLine("OpcUaClient is Connecting...");

                    Thread.Sleep(1000);
                }

                Console.WriteLine("OpcUaClient Connected !");

                //Subscribe
                foreach (var node in _allNodes)
                {
                    try
                    {
                        _client.SubscribeNodes(CreateCommands(_client, node.NodeId));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex);
                    }
                }

                while (_opcUaClientIsRunning)
                {
                    //var temperature = _client.ReadNode("ns=2;s=Temperature");
                    //Console.WriteLine("Current Temperature is {0} °C", temperature);

                    //Console.WriteLine("ReadNode: {0}", _client.ReadNode("ns=2;s=Machine_1/IsActive"));
                    //_client.WriteNode("ns=2;s=Machine_1/IsActive", false);
                    //Console.WriteLine("ReadNode: {0}", _client.ReadNode("ns=2;s=Machine_1/IsActive"));

                    foreach (var node in _allNodes)
                    {
                        try
                        {
                            //Console.WriteLine($"GetValue -> DisplayName:{GetDisplayName(node.DisplayName)} Value:{_client.ReadNode(node.NodeId)}");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine(ex);
                        }
                    }

                    Thread.Sleep(1000);
                }

                if (_client.State == OpcClientState.Connected)
                    _client.Disconnect();
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
            finally
            {
                _client.Dispose();
            }
        }

        private static IEnumerable<OpcSubscribeDataChange> CreateCommands(OpcClient client, OpcNodeId nodeId)
        {
            yield return new OpcSubscribeDataChange(nodeId, HandleDataChange);
        }

        private static void HandleDataChange(object sender, OpcDataChangeReceivedEventArgs e)
        {
            var nodeId = e.MonitoredItem.NodeId;
            var displayName = e.MonitoredItem.DisplayName;
        }

        private void StopOpcUaClient()
        {
            _opcUaClientIsRunning = false;
        }

        public async Task ConnectMqttClient()
        {
            /*
             * This sample creates a simple MQTT client and connects to a public broker.
             *
             * Always dispose the client when it is no longer used.
             * The default version of MQTT is 3.1.1.
             */

            var mqttFactory = new MqttFactory();

            using (_mqttClient = mqttFactory.CreateMqttClient())
            {
                // Use builder classes where possible in this project.
                var mqttClientOptions = new MqttClientOptionsBuilder().WithTcpServer(_mqttServerUri).Build();

                // This will throw an exception if the server is not available.
                // The result from this message returns additional data which was sent 
                // from the server. Please refer to the MQTT protocol specification for details.
                var response = await _mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);

                Console.WriteLine("The MQTT client is connected.");

                //response.DumpToConsole();

                // Send a clean disconnect to the server by calling _DisconnectAsync_. Without this the TCP connection
                // gets dropped and the server will handle this as a non clean disconnect (see MQTT spec for details).
                var mqttClientDisconnectOptions = mqttFactory.CreateClientDisconnectOptionsBuilder().Build();

                await _mqttClient.DisconnectAsync(mqttClientDisconnectOptions, CancellationToken.None);
            }
        }

        public async Task DisconnectMqttClient()
        {
            /*
             * This sample disconnects in a clean way. This will send a MQTT DISCONNECT packet
             * to the server and close the connection afterwards.
             *
             * See sample _Connect_Client_ for more details.
             */

            //var mqttFactory = new MqttFactory();

            //using (var mqttClient = mqttFactory.CreateMqttClient())
            //{
            //    var mqttClientOptions = new MqttClientOptionsBuilder().WithTcpServer("broker.hivemq.com").Build();
            //    await mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);

            //    // This will send the DISCONNECT packet. Calling _Dispose_ without DisconnectAsync the 
            //    // connection is closed in a "not clean" way. See MQTT specification for more details.
            //    await mqttClient.DisconnectAsync(new MqttClientDisconnectOptionsBuilder().WithReason(MqttClientDisconnectOptionsReason.NormalDisconnection).Build());
            //}

            var mqttClientOptions = new MqttClientOptionsBuilder().WithTcpServer(_mqttServerUri).Build();
            await _mqttClient.ConnectAsync(mqttClientOptions, CancellationToken.None);

            // This will send the DISCONNECT packet. Calling _Dispose_ without DisconnectAsync the 
            // connection is closed in a "not clean" way. See MQTT specification for more details.
            await _mqttClient.DisconnectAsync(new MqttClientDisconnectOptionsBuilder().WithReason(MqttClientDisconnectOptionsReason.NormalDisconnection).Build());
        }

        public async Task PublishMqttMessage(string topic, string data)
        {
            try
            {
                var applicationMessage = new MqttApplicationMessageBuilder()
                    .WithTopic(topic)
                    .WithPayload(data)
                    .Build();

                await _mqttClient.PublishAsync(applicationMessage, CancellationToken.None);
            
                Console.WriteLine("MQTT application message is published.");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }
}
