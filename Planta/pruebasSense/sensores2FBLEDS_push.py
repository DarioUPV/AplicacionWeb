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

  fecha = datetime.now()
  tiempoUNIX = datetime.timestamp(fecha)

  temp = sense.get_temperature()
  pressure = sense.get_pressure()
  humidity = sense.get_humidity()

  print("Date and time is:", fecha)
  print("Timestamp is:", tiempoUNIX)

  print("temperatura: %5.2f ºC, presion: %7.2f hPa, humedad rel.: %5.2f %%" % (temp, pressure, humidity))


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
