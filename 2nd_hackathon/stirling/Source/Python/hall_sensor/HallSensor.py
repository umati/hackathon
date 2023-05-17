import RPi.GPIO as GPIO
import paho.mqtt.client as mqtt
import time

#MQTT Publisher
def on_connect(client, userdata, flags, rc):
    #def on_connect(client, userdata, flags, rc):
    print(f"Connected with result code {rc}")

client = mqtt.Client()
client.on_connect = on_connect
client.connect("10.151.36.153", 1883, 60)

#GPIO Mode (BOARD / BCM)
GPIO.setmode(GPIO.BCM)
 
#set GPIO Pins
GPIO_REED = 4

#set GPIO direction (IN / OUT)
GPIO.setup(GPIO_REED, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

pulseActive = False
stopActive = False

StopTime = 0.0
StartTime = 0.0
PulseTime = 0.0

pulseCount = 0

while True:
    time.sleep(0.007)
    #Signal Active
    if GPIO.input(GPIO_REED) == 0:
        if pulseActive == False:
            pulseCount = pulseCount +1
            PulseTime = time.time()
            #client.publish('raspberry/topic/isRotating', payload=True, qos=0, retain=False)
            print(pulseCount)
            pulseActive = True
    
    #Signal Off
    if GPIO.input(GPIO_REED) == 1:
        pulseActive = False
    
    #8 impulse per round
    if pulseCount >= 8:
        pulseCount = 0
        TempTime = float(time.time())
        StopTime = TempTime
         
    #Calculate speed
    if StopTime > StartTime:
        calcTime = StopTime - StartTime
        speed = (1.15 / calcTime) * 60
        print(speed)
        StartTime = StopTime
        client.publish('raspberry/topic/speed', payload=speed, qos=0, retain=False)
        client.publish('raspberry/topic/isRotating', payload=True, qos=0, retain=False)
        stopActive = False
    
    #Stop detection
    if time.time() - PulseTime > 1:
        if stopActive == False:
            print("stop")
            client.publish('raspberry/topic/isRotating', payload=False, qos=0, retain=False)
            client.publish('raspberry/topic/speed', payload=0, qos=0, retain=False)
            pulseCount = 0
            stopActive = True
