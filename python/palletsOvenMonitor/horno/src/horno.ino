/**************************************************************************
 * MAX31865 Basic Example
 *
 * Copyright (C) 2015 Ole Wolf <wolf@blazingangles.com>
 *
 *
 * Example code that reads the temperature from an MAX31865 and outputs
 * it on the serial line.
 *
 * Wire the circuit as follows, assuming that level converters have been
 * added for the 3.3V signals:
 *
 *    Arduino Uno   -->  MAX31865
 *    ---------------------------
 *    CS: pin 10    -->  CS
 *    MOSI: pin 11  -->  SDI (must not be changed for hardware SPI)
 *    MISO: pin 12  -->  SDO (must not be changed for hardware SPI)
 *    SCK: pin 13   -->  SCLK (must not be changed for hardware SPI)
 *
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **************************************************************************/

#include <MAX31865.h>
#include <SPI.h>

#define RTD_CS_PIN_0 3
#define RTD_CS_PIN_1 4
#define RTD_CS_PIN_2 5
#define RTD_CS_PIN_3 6
#define RTD_CS_PIN_4 7
#define RTD_CS_PIN_5 8
#define ENVIO 10000

MAX31865_RTD rtd0(MAX31865_RTD::RTD_PT100, RTD_CS_PIN_0);
MAX31865_RTD rtd1(MAX31865_RTD::RTD_PT100, RTD_CS_PIN_1);
MAX31865_RTD rtd2(MAX31865_RTD::RTD_PT100, RTD_CS_PIN_2);
MAX31865_RTD rtd3(MAX31865_RTD::RTD_PT100, RTD_CS_PIN_3);
MAX31865_RTD rtd4(MAX31865_RTD::RTD_PT100, RTD_CS_PIN_4);
MAX31865_RTD rtd5(MAX31865_RTD::RTD_PT100, RTD_CS_PIN_5);

double array_lecturas[8];
unsigned long t_init;

void setup() {
    pinMode(23, OUTPUT);
    Serial.begin(9600);
    Serial.println("<<INIT>>");
    Serial1.begin(9600);
    Serial1.println("<<INIT>>");

    /* Initialize SPI communication. */
    SPI.begin();
    SPI.setClockDivider(SPI_CLOCK_DIV16);
    SPI.setDataMode(SPI_MODE3);

    /* Allow the MAX31865 to warm up. */
    delay(100);

    /* Configure:

       V_BIAS enabled
       Auto-conversion
       1-shot disabled
       3-wire enabled
       Fault detection:  automatic delay
       Fault status:  auto-clear
       50 Hz filter
       Low threshold:  0x0000
       High threshold:  0x7fff
    */
    rtd0.configure(true, true, false, true, MAX31865_FAULT_DETECTION_NONE, true,
                 true, 0x0000, 0x7fff);
    rtd1.configure(true, true, false, true, MAX31865_FAULT_DETECTION_NONE, true,
                 true, 0x0000, 0x7fff);
    rtd2.configure(true, true, false, true, MAX31865_FAULT_DETECTION_NONE, true,
              true, 0x0000, 0x7fff);
    rtd3.configure(true, true, false, true, MAX31865_FAULT_DETECTION_NONE, true,
              true, 0x0000, 0x7fff);
    rtd4.configure(true, true, false, true, MAX31865_FAULT_DETECTION_NONE, true,
               true, 0x0000, 0x7fff);
    rtd5.configure(true, true, false, true, MAX31865_FAULT_DETECTION_NONE, true,
               true, 0x0000, 0x7fff);
    t_init = millis();

}

void loop() {
    char buffer[100];
    rtd0.read_all();
    rtd1.read_all();
    rtd2.read_all();
    rtd3.read_all();
    rtd4.read_all();
    rtd5.read_all();

    guardar_lectura(&rtd0, &array_lecturas[0]);
    Serial.prins
    t("Lectura en array 0:");Serial.println(array_lecturas[0]);
    delay(500);
    guardar_lectura(&rtd1, &array_lecturas[1]);
    Serial.print("Lectura en array 1:");Serial.println(array_lecturas[1]);
    delay(500);
    guardar_lectura(&rtd2, &array_lecturas[2]);
    Serial.print("Lectura en array 2:");Serial.println(array_lecturas[2]);
    delay(500);
    guardar_lectura(&rtd3, &array_lecturas[3]);
    Serial.print("Lectura en array 3:");Serial.println(array_lecturas[3]);
    delay(500);
    guardar_lectura(&rtd4, &array_lecturas[4]);
    Serial.print("Lectura en array:");Serial.println(array_lecturas[4]);
    delay(500);
    guardar_lectura(&rtd5, &array_lecturas[5]);
    Serial.print("Lectura en array:");Serial.println(array_lecturas[5]);
    delay(500);

    if (timer(t_init, ENVIO)){
        char val0[8];
        dtostrf(array_lecturas[0],5,2,val0 );
        char val1[8];
        dtostrf(array_lecturas[1],5,2,val1 );
        char val2[8];
        dtostrf(array_lecturas[2],5,2,val2 );
        char val3[8];
        dtostrf(array_lecturas[3],5,2,val3 );
        char val4[8];
        dtostrf(array_lecturas[4],5,2,val4 );
        char val5[8];
        dtostrf(array_lecturas[5],5,2,val5 );
        sprintf(buffer,"[%s,%s,%s,%s,%s,%s]",val0,val1,val2,val3,val4,val5);
        // sprintf(buffer,"[%f,%f,%f,%f,%f,%f]")

        delay(10);
        digitalWrite(23, HIGH);
        //requerido para que el primer bit enviado tenga
        //suficiente tiempo pra ser enviado
        delay(20);
        Serial1.println(buffer);
        delay(45);
        digitalWrite(23, LOW);

        t_init = millis();
    }

}
