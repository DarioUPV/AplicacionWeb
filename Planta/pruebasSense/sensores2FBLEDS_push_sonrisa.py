import time
from sense_hat import SenseHat
import pyrebase
from datetime import datetime

sense = SenseHat()
sense.clear()

config = {
  "apiKey": "dTMestnzCFplWJZ9Ggga6qGUKWe4LLkkMY4bMEyc",
  "authDomain": "telenube-590a3.firebaseapp.com",
  "databaseURL": "https://telenube-590a3-default-rtdb.europe-west1.firebasedatabase.app",
  "storageBucket": "telenube-590a3.appspot.com"
}

firebase = pyrebase.initialize_app(config)
db = firebase.database()

negro = [0, 0, 0]
rojo  = [255, 0, 0]
verde = [0, 255, 0]
azul  = [0, 0, 255]


def fila_leds(fila,x):
    print("datos bucle")
    for i in range(8):
        sense.set_pixel(i, fila, negro)
        if (x>100./8.*i):
            sense.set_pixel(i, fila, rojo)
        


valor_actuador_1 = True;
valor_actuador_2 = True;

pepe= 100;

def stream_handler(message):
    print(message)

    global valor_actuador_1
    global valor_actuador_2

    global pepe
    pepe = pepe + 1;
    
    if (message['path']=='/actuador1'):
        if (message['data']):
           sense.set_pixel(0, 0, rojo)
           valor_actuador_1 = True;
        else:
           sense.set_pixel(0, 0, negro)
           valor_actuador_1 = False;
    if (message['path']=='/actuador2'):
        if (message['data']):
           sense.set_pixel(0, 1, rojo)
           valor_actuador_2 = True;
        else:
           sense.set_pixel(0, 1, negro)
           valor_actuador_2 = False



    if (message['path']=='/'):
        if (message['data']['actuador1']):
           sense.set_pixel(0, 0, rojo)
           valor_actuador_1 = True;
        else:
           sense.set_pixel(0, 0, negro)
           valor_actuador_1 = False;
        if (message['data']['actuador2']):
           sense.set_pixel(0, 1, rojo)
           valor_actuador_2 = True;
        else:
           sense.set_pixel(0, 1, negro)
           valor_actuador_2 = False;

        fila_leds(2, int(message['data']['regulador1']))
        fila_leds(3, int(message['data']['regulador2']))
        
        
    if (message['path']=='/regulador1'):
        fila_leds(2, int(message['data']))
        
    if (message['path']=='/regulador2'):
        fila_leds(3, int(message['data']))


    if ( (valor_actuador_1 == valor_actuador_2) and valor_actuador_1 ):
        sense.set_pixel(0, 7, rojo)
    else: 
        sense.set_pixel(0, 7, negro)    
       

my_stream = db.child("actuadores").stream(stream_handler)


while(True):

  print("pepe: " +  str(pepe));

  fecha = datetime.now()
  tiempoUNIX = datetime.timestamp(fecha)

  temp = sense.get_temperature()
  pressure = sense.get_pressure()
  humidity = sense.get_humidity()

  print("Date and time is:", fecha)
  print("Timestamp is:", tiempoUNIX)

  print("temperatura: %5.2f ºC, presion: %7.2f hPa, humedad rel.: %5.2f %%" % (temp, pressure, humidity))

  print("valor_actuador_1 (while true): " + str(valor_actuador_1));



  datoTemperatura = {"valor": temp, "unidades": "ºC", "tiempo": tiempoUNIX}
  db.child("sensores").child("temperatura").set(datoTemperatura)
  db.child("historicos").child("sensores").child("temperatura").push(datoTemperatura);


  datoHumedad = {"valor": humidity, "unidades": "%", "tiempo": tiempoUNIX}
  db.child("sensores").child("humedad").set(datoHumedad)
  db.child("historicos").child("sensores").child("humedad").push(datoHumedad);


  datoPresion = {"valor": pressure, "unidades": "hPa", "tiempo": tiempoUNIX}
  db.child("sensores").child("presion").set(datoPresion)
  db.child("historicos").child("sensores").child("presion").push(datoPresion);




  time.sleep(5)
