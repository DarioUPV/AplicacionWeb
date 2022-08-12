import time
from sense_hat import SenseHat

sense = SenseHat()
sense.clear()

pressure = sense.get_pressure()
print("Press.:") 
print(pressure)



temp = sense.get_temperature()
print("Temp:")
print(temp)



humidity = sense.get_humidity()
print("Humidity:")
print(humidity)


while(True):

  temp = sense.get_temperature()
  pressure = sense.get_pressure()
  humidity = sense.get_humidity()

  print("temperatura: %4.1f ºC, presion: %4.0f mm Hg, humedad rel.: %4.1f %%" % (temp, pressure, humidity))


  time.sleep(3)
