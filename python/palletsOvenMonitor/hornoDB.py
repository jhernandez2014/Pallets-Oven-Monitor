#!/usr/bin/python

#imports
import MySQLdb
import RPi.GPIO as GPIO
import time
import serial

import serial

#setup puerto serial
try:
    port = serial.Serial("/dev/ttyUSB0", baudrate=9600)
except e:
    print "Serial no disponible"

#archivo = open("log.txt", "a")

#asignacion pines.
dePin = 21 #pin 40

#setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(dePin, GPIO.OUT)
GPIO.output(dePin, GPIO.LOW)

def insertar_datos(lista_valores):
    print "insertando"
    db = MySQLdb.connect("localhost","root","dtr+123","Pallets" )
    cursor = db.cursor()

    sql = "INSERT INTO sensors(sensor0,sensor1, sensor2, sensor3, sensor4, sensor5) VALUES ('%s', '%s', '%s', '%s', '%s', '%s')" % (str(lista_valores[0]),str(lista_valores[1]),str(lista_valores[2]),str(lista_valores[3]),str(lista_valores[4]),str(lista_valores[5]))

    try:
        cursor.execute(sql)
        db.commit()
    except:
        print "Fallo insercion"
        db.rollback()
    db.close()


def main():
    try:
        while 1:
            time.sleep(1)
            if port.inWaiting > 6:
                rxLine = port.readline()
                ts = time.time()
                logLine = "[rxdat]:{}:{}".format(ts,rxLine)
                print logLine,
                removed = rxLine.replace("[","")
                removed2 = removed.replace("]","")
                removedList = removed2.split(',')
                print "%s,%s,%s,%s,%s,%s" % (str(removedList[0]),str(removedList[1]),str(removedList[2]),str(removedList[3]),str(removedList[4]), str(removedList[5]))
                insertar_datos(removedList)
#                    archivo.write(logLine)
                port.flush()
    except KeyboardInterrupt:
        GPIO.cleanup()
        port.close()
        archivo.close()

if __name__ == '__main__':
    print "==Inicio=="
    main()
