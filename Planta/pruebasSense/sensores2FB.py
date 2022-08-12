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

def stream_handler(message):
    print(message)
    # print(message["actuador1"]) # put
    # print(message["actuador2"]) # /-K7yGTTEp7O549EzTYtI
    # print(message["regulador1"]) # {'title': 'Pyrebase', "body": "etc..."}
    # print(message["regulador2"]) # {'title': 'Pyrebase', "body": "etc..."}


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
