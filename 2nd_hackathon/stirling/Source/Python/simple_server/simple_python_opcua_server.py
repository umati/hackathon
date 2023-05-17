import asyncio
import logging

from asyncua import Server, ua
from asyncua.common.methods import uamethod

server = Server()
await server.init()


server.set_security_policy([ua.SecurityPolicyType.NoSecurity])
server.set_security_IDs(["Anonymous"])

server.set_endpoint("opc.tcp://127.0.0.1:4840")

#await server.import_xml("C://Projects//umati//UA1.04//Opc.Ua.NodeSet2.xml")

await server.import_xml("C://Projects//umati//UA1.04//Opc.Ua.Di.NodeSet2.xml")
await server.import_xml("C://Projects//umati//UA1.04//Opc.Ua.IA.NodeSet2.xml")

await server.import_xml("C://Projects//umati//UA1.04//Opc.Ua.Machinery.NodeSet2.xml")
await server.import_xml("C://Projects//umati//UA1.04//Opc.Ua.MachineTool.NodeSet2.xml")


await server.import_xml("C://Projects//umati//UA1.04//umati_brownfield_ua1.04.xml")


manufacturer = server.get_node(f"ns=6;i=6008")
serialnumber = server.get_node(f"ns=6;i=6010")
await manufacturer.write_value(ua.LocalizedText("Sterling"))
await serialnumber.write_value("1000")

async with server:
    while True:
        await asyncio.sleep(1)
		
		