# PALLETS OVEN MONITOR

## Instrucciones para Instalar Mysql

1. Actualizar la lista de paquete: `sudo apt-get update && sudo apt-get upgrade`
2. Instalamos el MySQL actual: `sudo apt-get install mariadb-server`
3. Al finalizar ejecutamos el comando para inciar la configurarcion: `sudo mysql_secure_installation`
4. Agregamos el nuevo password: `dtr+123` 
5. Comprobamos la intalación con el comando: `mysql --version`
6. Para acceder al CLI de MySQL usamos el siguiente comando. `sudo mysql -u root -p -h localhost`

## Instrucciones para Instalar Node js
Para poder instalar una version ARM de Node:

1. `curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -` 
2. `sudo apt install -y nodejs`
Basicamente es todo. Solo debes esperar a que se decargue e instale.

Para verificar que este instalado correctamente, use el comando `node -v`. De esta forma, podrá ver la versión de node

## Instrucciones para Instalar el Proyecto

1. Instalamos git: `sudo apt-get install git`
1. Para clonar el repositorio, nos dirigimos a: `cd /var`
1. Creamos una carpeta que contendrá el Proyecto: `sudo mkdir www`
1. Para evitar el uso de `sudo` cuando se desea colocar los archivos en el web raíz , se puede cambiar el propietario a su usuario Pi , y el grupo al `www-data` , que es utilizado por Nginx : `sudo chown -R pi:www-data www`
1. Clonamos el repositorio: `git clone http://git.doter.mx/doter/Pallets-Oven-Monitor.git`
1. Ingresamos al proyecto: `cd /Pallets-Oven-Monitor`
1. Instalamos los packetes: `npm install`
1. Editamos la configuración de la base de datos: `config/database.js`
1. Creamos el esquema de la base de datos: `node scripts/create_database.js`
1. Corremos el server.js para verificar: `node server.js`
1. Ingresa a tu navegador con la direccion: `http://localhost:8080`
1. Ahora creamos un `.sh` para iniciar el server.js: `sudo nano start.sh`
1. Pegamos lo siquiente: 
```sleep 5
   cd /var/www/Pallets-Oven-Monitor
   sleep 1
   sudo node server.js```
1. Guardamos y Cerramos.
1. Creamos un nuevo crontab para que cada que reinicie, levante el node: `crontab -e`
1. Al final del archivo, escribimos la siguiente linea: `@reboot sudo sh /home/pi/start.sh &`
1. Guardamos y cerramos.

### Ahora instalamos Nginx.

1. Actualizamos la lista de paquetes: `sudo apt-get update`
1. Instalamos Nginx con el comando: `sudo apt-get install nginx`
1. Cuando la instalacion este completa, iniciamos el server : `sudo service nginx start`

### Configuramos Nginx como servidor:

1. Nos posicionamos en la siguiente dirección:  `cd /etc/nginx/sites-available/`
1. Editamos el documento default:  `sudo nano default`
```
server {
   listen 80;
   root /var/www/Pallets-Oven-Monitor/;                  # identifies the location of the application you are configuring
   server_name _;                 # identifies the hostname used by this application's traffic
   location / {
      proxy_pass http://127.0.0.1:8080/;   # configures the back-end destination for this traffic
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
   }
}
```
1. Reiniciamos el servicio para activar los cambios: `sudo service nginx reload`

### Configuramos el Hostname de la Raspi:

1. Instalamos Avahi: `sudo apt-get install avahi-daemon`
1. Ya instalado, configuramos el Host: `sudo nano /etc/hosts`
1. Deja todas las entradas a excepción de la última `127.0.1.1` etiquetada con el nombre de host `"Raspberry Pi"`. Esta es la única línea que desea editar . Reemplazar `"Raspberry Pi"` con cualquier nombre de host que desee . Hemos sustituido en nuestro dispositivo con `"Pallets"` . Presione CTRL + X para cerrar el editor ; de acuerdo con sobreescribir el archivo existente y guardarlo
1. Devuelta ala teminal, editamos el Hostname: `sudo nano /etc/hostname`
1. Remplace el hostaname default `" Raspberry Pi "` por defecto con el mismo nombre de host del paso anterior
1. Por último , hay que confirmar los cambios en el sistema y reinicie el sistema para que los cambios surtan efecto. En la terminal , introduzca el siguiente comando para confirmar los cambios : `sudo /etc/init.d/hostname.sh`
1. Ahora reinicie: `sudo reboot`


## Instrucciones para Instalar Script Poweroff & Reboot

1. El script se encuentra en: `Pallets-Oven-Monitor/python/power.py`
1. Copiamos el script a la carpeta "pi": 
```
    cp /var/www/Pallets-Oven-Monitor/python/start.sh /home/pi/
    cp /var/www/Pallets-Oven-Monitor/python/power.py /home/pi/
    cp /var/www/Pallets-Oven-Monitor/python/hornoDB2.py /home/pi/
```
1. Creamos un nuevo crontabe: `crontab -e` 
1. Al final del archivo ponemos las siguiente linea: 
```
    @reboot sudo python /home/pi/start.sh &
    @reboot sudo python /home/pi/power.py &
    @reboot sudo python /home/pi/hornoDB2.py &
```

### Nota!! Los pines de la GPIO configurados son: `17 para Apagado` y `27 para Reiniciar`

## Instrucciones para instalar Chromium Browser

1. wget http://ftp.us.debian.org/debian/pool/main/libg/libgcrypt11/libgcrypt11_1.5.0-5+deb7u3_armhf.deb
1. wget http://launchpadlibrarian.net/218525709/chromium-browser_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb
1. wget http://launchpadlibrarian.net/218525711/chromium-codecs-ffmpeg-extra_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb
1. sudo dpkg -i libgcrypt11_1.5.0-5+deb7u3_armhf.deb
1. sudo dpkg -i chromium-codecs-ffmpeg-extra_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb
1. sudo dpkg -i chromium-browser_45.0.2454.85-0ubuntu0.14.04.1.1097_armhf.deb

### Configurar Para iniciar desde Boot

1. Haga clic en el menú de inicio , seleccione INTERNET , a continuación, haga clic derecho en Chromium Browser , y hace clic en el icono de enviar al escritorio.
1. seguimos los siguientes comandos: 
1. `sudo cp /home/pi/Desktop/chromium-browser.desktop /home/pi/.config/autostart/chromium-browser.desktop`
1. `cd /home/pi/.config/autostart/`
1. `sudo leafpad chromium-browser.desktop`
1. Busca la linea que diga : `Exec=chromium-browser %u` y remplacelo por : `python /home/pi/.config/MPKPyTimer/pytimer4.py`
1. Ahora Creamos un script para correr Chromium como kiosk:
1. `cd /home/pi/.config`
1. `mkdir MKPyTimer`
1. `cd MKPyTimer`
1. `touch pytimer4.py `
1. Modificamos el archivo: sudo leafpad pytimer4.py
1. El script inicia el Browser Full Screen e Ingresa a localhost 

```
import os
from time import *

sleep(10)
os.system('chromium-browser --kiosk --disable-infobars --disable-session-crashed-bubble "http://localhost/login"')```
```
1. Guardar y salir.

## Modificar detalles de Boot

1. Para quitar el logo del Boot. Agregamos` logo.nologo` al archivo `/boot/cmdline.txt`.
1. Configuramos el overscren_left,right,top y bottom a 0 y rotamos la pantalla `lcd_rotate=2` en el archivo `/boot/config.txt`
1. Para quitar el icono en el boton de Menu, damos click derecho sobre de este y seleccionamos `Menu Settings`, ahi podremos cambiar la imagen.
1. Para cambiar el fondo de pantalla: click derecho sobre el backgraound y seleccionar `Desktop Preference`, en la opcion de `Wallpaper`, podremos cambiar la imagen de fondo.

#Referencias
* [Instalar MySql](https://pimylifeup.com/raspberry-pi-mysql/)
* [Instalar Node](https://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/)
* [Modulo de Sensor](https://www.mouser.mx/ProductDetail/Maxim-Integrated/MAX31865PMB1?qs=%2fha2pyFadugzPBIFKo2sF67U9oxj3Brsz1xuhHOjWnkrBiEkgg6ehA%3d%3d)