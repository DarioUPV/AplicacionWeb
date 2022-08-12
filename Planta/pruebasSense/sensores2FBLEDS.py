import time
from sense_hat import SenseHat
import pyrebase

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
        

def stream_handler(message):
    print(message)
    
    if (message['path']=='/actuador1'):
        if (message['data']):
           sense.set_pixel(0, 0, rojo)
        else:
           sense.set_pixel(0, 0, negro)
    if (message['path']=='/actuador2'):
        if (message['data']):
           sense.set_pixel(0, 1, rojo)
        else:
           sense.set_pixel(0, 1, negro)

    if (message['path']=='/'):
        if (message['data']['actuador1']):
           sense.set_pixel(0, 0, rojo)
        else:
           sense.set_pixel(0, 0, negro)

        if (message['data']['actuador2']):
           sense.set_pixel(0, 1, rojo)
        else:
           sense.set_pixel(0, 1, negro)

        fila_leds(2, int(message['data']['regulador1']))
        fila_leds(3, int(message['data']['regulador2']))
        
        
    if (message['path']=='/regulador1'):
        fila_leds(2, int(message['data']))
        
    if (message['path']=='/regulador2'):
        fila_leds(3, int(message['data']))
       


my_stream = db.child("actuadores").stream(stream_handler)


while(True):

  temp = sense.get_temperature()
  pressure = sense.get_pressure()
  humidity = sense.get_humidity()

  print("temperatura: %5.2f ºC, presion: %7.2f mm Hg, humedad rel.: %5.2f %%" % (temp, pressure, humidity))


  datoTemperatura = {"valor": temp, "unidades": "ºC"}
  db.child("sensores").child("temperatura").set(datoTemperatura)

  datoPresion = {"valor": pressure, "unidades": "mm Hg"}
  db.child("sensores").child("presion").set(datoPresion)

  datoHumedad = {"valor": humidity, "unidades": "%"}
  db.child("sensores").child("humedad").set(datoHumedad)

  time.sleep(5)
