#!/usr/bin/python

#imports
import MySQLdb
# import RPi.GPIO as GPIO
import time
import serial
import re
#import serial

usb = "/dev/tty.usbserial-AL00F056"
timeout = .5
#setup puerto serial
try:
    port = serial.Serial(usb, baudrate=9600, timeout=timeout)
    print "Serial conectado"
except e:
    print "Serial no disponible"

#archivo = open("log.txt", "a")

#asignacion pines.
dePin = 21 #pin 40

#setup
# GPIO.setmode(GPIO.BCM)
# GPIO.setup(dePin, GPIO.OUT)
# GPIO.output(dePin, GPIO.LOW)
log=open("log.txt","a")
def insertar_datos(lista_valores):
    print "insertando"
    db = MySQLdb.connect("localhost","root","D0tergr0up","Pallets" )
    cursor = db.cursor()
    s0='1.00';
    s1='0.00';
    s2='0.00';
    s3='0.00';
    s4='0.00';
    s5='0.00';
    for sensor in lista_valores:
    	if ((not sensor.isalpha())and(len(lista_valores) >=6)):
    	    print "es numerica"+sensor
    	    log.write("numero "+sensor+"\n");
    	    s0 = str(lista_valores[0])
            s1 = lista_valores[1]
            s2 = lista_valores[2]
            s3 = lista_valores[3]
            s4 = lista_valores[4]
            s5 = lista_valores[5]
        else:
    	    print "contiene otros datos"+sensor
    	    log.write("contiene otros datos")
    try:
        #s0 = float(filter(str.isdigit, s0))
        s0 = re.findall("\d+\.\d+", s0)
        # s5 = float(filter(str.isdigit, s5))
        print "sensor ";print str(s0)[1:-1]
        print str(s5)
        sql = "INSERT INTO sensors(sensor0,sensor1, sensor2, sensor3, sensor4, sensor5) VALUES ('"+str(s0)[2:-2]+"','"+str(s1)+"', '"+str(s2)+"','"+str(s3)+"', '"+str(s4)+"','"+str(s5)+"');"
        print sql
    except:
	print "error Sql"
	log.write("eror SQL")

    try:
        cursor.execute(sql)
        db.commit()
    except:
        print "Fallo insercion"
	log.write("Fallo insercion \n")
        db.rollback()
    db.close()


def main():
    try:
        flag=0
        while 1:
           try:
                time.sleep(1)
    	    	flag+=1
                # print "read: "+str(port.readline())
    	    	# print "inWaiting: "+str(port.inWaiting)
    	    	# print "flag:"+str(flag)
    	    	# print "port read line: "+str(port.readline())
            	if port.inWaiting > 6:
               	    rxLine = port.readline()
                    ts = time.time()
                    logLine = "[rxdat]:{}:{}".format(ts,rxLine)
                    # print logLine
                    if rxLine != '':
                        removed = rxLine.replace("[","")
                        removed2 = removed.replace("]","")
                        removedList = removed2.split(',')
                        sn0 = float(filter(str.isdigit, removedList[0]))
                        removedList[5] = str(float(filter(str.isdigit, removedList[5])))
                        print sn0
                        print str(removedList[5])
                        print "%s,%s,%s,%s,%s,%s" % (str(sn0),str(removedList[1]),str(removedList[2]),str(removedList[3]),str(removedList[4]), str(removedList[5]))
                        if (flag >= 1) :
            		    	print "list "+str(removedList)
            		    	insertar_datos(removedList)
            		    	log.write(logLine)
            		    	flag=5
    #                   	archivo.write(logLine)
                    port.flush()
    	    	else:
    		        print "port inWaiting"+str(port.inWaiting)
           except Exception as e: print(e)
    except KeyboardInterrupt:
        # GPIO.cleanup()
        port.close()
	log.write("End script")
        log.close()

if __name__ == '__main__':
    print "==Inicio=="
    main()
