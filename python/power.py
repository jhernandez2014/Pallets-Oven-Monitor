#!/usr/bin/env python
import RPi.GPIO as GPIO
import time
import os

pwr=17
reset=27
led=22

GPIO.setmode(GPIO.BCM)
GPIO.setup(pwr,GPIO.IN)
GPIO.setup(reset,GPIO.IN)
GPIO.setup(led,GPIO.IN)

GPIO.output(ledPin, GPIO.HIGH)

try:
	while True:
		button_pwr = GPIO.input(pwr);
		button_reboot = GPIO.input(reset);

		if (button_pwr):
			os.system("sudo shutdown -h now")
			GPIO.output(ledPin, GPIO.LOW)
		if (button_reboot):	
			os.system("sudo shutdown -r now")
			GPIO.output(ledPin, GPIO.LOW) 
	    	break
	    time.sleep(0.03)
except KeyboardInterrupt:
	GPIO.cleanup()