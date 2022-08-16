#!/usr/bin/python
# -*- coding: utf-8 -*-
import MySQLdb
import time
from random import randint

DB_HOST = 'localhost'
DB_USER = 'root'
DB_PASS = 'dtr+123'
DB_NAME = 'Pallets'


def run_query(query=''):
    datos = [DB_HOST, DB_USER, DB_PASS, DB_NAME]

    conn = MySQLdb.connect(*datos)
    cursor = conn.cursor()
    cursor.execute(query)

    if query.upper().startswith('SELECT'):
        data = cursor.fetchall()
    else:
        conn.commit()
        data = None

    cursor.close()
    conn.close()
    return data


def main():

    while True:
        #s0 = str(randint(50, 70))
        s0 = str(0)
        data1 = randint(50, 70)
        s1 = str(data1)
        data2 = randint(50, 70)
        s2 = str(data2)
        data3 = randint(50, 70)
        s3 = str(data3)
        data4 = randint(50, 70)
        s4 = str(data4)
        s5 = str(0)

        query = \
            'INSERT INTO sensors (sensor0, sensor1,sensor2,sensor3,sensor4, sensor5,date_insert) VALUES (' \
            + s0 + "," + s1 + ',' + s2 + ',' + s3 + ',' + s4 + ","+ s5 + ', now())'
        run_query(query)
        print('insert:', query)
        time.sleep(20)


try:
    main()
except KeyboardInterrupt:
    print('Stop')
