#!/usr/bin/python

#imports
import RPi.GPIO as GPIO
import time
import serial

import serial

#setup puerto serial
port = serial.Serial("/dev/ttyUSB0", baudrate=9600)

archivo = open("log.txt", "a")

#asignacion pines.
dePin = 21 #pin 40

#setup
GPIO.setmode(GPIO.BCM)
GPIO.setup(dePin, GPIO.OUT)
GPIO.output(dePin, GPIO.LOW)


def main():
    with archivo:
        try:
            while 1:
                time.sleep(1)
                if port.inWaiting > 6:
                    print '====RX===='
                    rxLine = port.readline()
                    ts = time.time()
                    logLine = "[rxdat]:{}:{}".format(ts,rxLine)
                    print logLine,
                    archivo.write(logLine);
                    port.flush()
        except KeyboardInterrupt:
                GPIO.cleanup()
                port.close()
                archivo.close()

if __name__ == '__main__':
    print "==Inicio=="
    main()
