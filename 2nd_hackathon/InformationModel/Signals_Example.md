# Example according to figure/nodeset

| BrowsePath | example Value | Value Source | possible Source |
|--|--|--|--|
| Identification/Manufacturer | "Werner Maschinenbau" | static variable in OPC UA Server| Value from Nameplate |
| Identification/ProductInstanceURI | "http://www.werner-mabau.com/DKT67834" | static variable in OPC UA Server | Value from Nameplate |
| Identification/SerialNumber | "DKT67834" | static variable in OPC UA Server | Value from Nameplate |
| Monitoring/Channel1/ChannelMode | 0/Automatic | Enum Value | Machine Controller or static variable in OPC UA Server |
| Monitoring/Channel1/ChannelState | 0/Active | Enum Value | Machine Controller or static variable in OPC UA Server |
| Monitoring/Channel1/FeedOverride | 100 | From Source | Machine Controller |
| Monitoring/Channel1/FeedOverride/EngineeringUnits | percent [UNECE P1] | From Source | Static variable in OPC UA Server |
| Monitoring/Channel1/FeedOverride/EURange | [0-150] | static variable in OPC UA Server | Machine Controller |
| Monitoring/Channel1/Name | "Channel 1" | Machine Controller (if variable during runtime) or static variable in OPC UA Server| Machine Controller |
| Monitoring/MachineTool/OperationMode| 1/Automatic | Enum Value | Machine Controller (if variable during runtime) or static variable in OPC UA Server |
| Monitoring/MachineTool/PowerOnDuration| 4287 | counts up by 1 every hour | Can be realized in OPC UA Server, if not available from Machine. Save to storage, e.g. of the OPC UA Server (shall not be reset on restart) |
| Monitoring/Spindle1/IsRotating | True  | From Source | Machine Controller |
| Monitoring/Spindle1/Name| "Spindle 1" | Machine Controller (if variable) or static variable in OPC UA Server | Machine Controller |
| Production/ActiveProgram/Name | "Program1" | Machine Controller (if variable) or static variable in OPC UA Server | Machine Controller |
| Production/ActiveProgram/NumberInList | 0 | static variable in OPC UA Server | static value |
| Production/ActiveProgram/State/CurrentState | "[no locale];Running" | static variable in OPC UA Server | Machine Controller (if variable) or static |
| Production/ActiveProgram/State/CurrentState/Id | [NodeId of "Running" in ProductionProgramStateMachineType] | static variable in OPC UA Server | Machine controller or static |
| Production/ActiveProgram/State/CurrentState/Number | 1 | static variable in OPC UA Server | Machine Controller or static |


# Example for mini machine with stacklight and two inputs
| BrowsePath | example Value | Value Source | possible Source |
|--|--|--|--|
| Identification/Manufacturer | "MeCompany" | static variable in OPC UA Server | Nameplate or creativity |
| Identification/ProductInstanceURI | "http://me.com/001" | static variable in OPC UA Server | Nameplate or creativity |
| Identification/SerialNumber | 001 | static variable in OPC UA Server | Nameplate or creativity |
| Monitoring/MachineTool/OperationMode | 1/Automatic | Enum Value | Static variable in OPC UA Server |
| Monitoring/MachineTool/PowerOnDuration| 5 | counts up by 1 every hour | Can be realized in OPC UA Server, if not available from Machine. Save to storage, e.g. of the OPC UA Server (shall not be reset on restart) |
| Monitoring/Spindle1/IsRotating | True  | From Source | Machine Controller |
| Monitoring/Spindle1/Name| "Spindle 1" | static variable in OPC UA Server | Machine Controller |
| Monitoring/Stacklight/StacklightMode | Segmented | enum value | static |
| Monitoring/Stacklight/Light0 [StackElementLightType]/SignalOn | True | source | light signal |
| Monitoring/Stacklight/Light0 [StackElementLightType]/NumberInList | 0 | static value | bottommost light |
| Monitoring/Stacklight/Light0 [StackElementLightType]/SignalColor | 1/Red | Enum value | bottommost light |
| Monitoring/Stacklight/Light1 [StackElementLightType]/SignalOn | False | source | light signal |
| Monitoring/Stacklight/Light1 [StackElementLightType]/NumberInList | 1 | static value | middle light |
| Monitoring/Stacklight/Light1 [StackElementLightType]/SignalColor | 4/Yellow | Enum value | middle light |
| Monitoring/Stacklight/Light2 [StackElementLightType]/SignalOn | False | source | light signal |
| Monitoring/Stacklight/Light2 [StackElementLightType]/NumberInList | 2 | static value | top light |
| Monitoring/Stacklight/Light2 [StackElementLightType]/SignalColor | 2/Green | Enum value | top light |
| Production/ActiveProgram/Name | "Program1" | Device | Device or Creativity |
| Production/ActiveProgram/NumberInList | 0 | static variable in OPC UA Server | static value |
| Production/ActiveProgram/State/CurrentState | "[no locale];Running" | static variable in OPC UA Server | static |
| Production/ActiveProgram/State/CurrentState/Id | [NodeId of "Running" in ProductionProgramStateMachineType] | static variable in OPC UA Server | static |
| Production/ActiveProgram/State/CurrentState/Number | 1 | static variable in OPC UA Server | static |
