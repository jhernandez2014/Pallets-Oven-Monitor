var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../config/database');

var connection = mysql.createConnection(dbconfig.connection);

connection.query('CREATE DATABASE ' + dbconfig.database);

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.pallet_data + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `title` VARCHAR(50), \
    `cycle` VARCHAR(30), \
    `certificate` VARCHAR(30), \
    `institution` VARCHAR(50), \
    `phone` VARCHAR(30), \
    `street` VARCHAR(30), \
    `suburb` VARCHAR(30), \
    `town` VARCHAR(30), \
    `company` VARCHAR(30), \
    `cp` VARCHAR(30), \
    `c_street` VARCHAR(30), \
    `c_suburb` VARCHAR(30), \
    `c_town` VARCHAR(30), \
    `product` VARCHAR(30), \
    `scaffold` VARCHAR(30), \
    `crust` boolean, \
    `thick` VARCHAR(30), \
    `quantity` INT, \
    `status` BOOLEAN, \
    `date_start` TIMESTAMP default "0000-00-00 00:00:00", \
    `date_end` TIMESTAMP , \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)');



connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `nickname` VARCHAR(30) NOT NULL, \
    `username` VARCHAR(30) NOT NULL, \
    `password` CHAR(60) NOT NULL, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC), \
    UNIQUE INDEX `username_UNIQUE` (`username` ASC) \
)');


var psw = bcrypt.hashSync("password", null, null);

connection.query('\
	INSERT INTO `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( nickname, username , password )\
    VALUES ( "Admin","admin", "'+ psw +'" )');
    
    console.log('\
	INSERT INTO `' + dbconfig.database + '`.`' + dbconfig.users_table + '` ( nickname, username , password )\
	VALUES ( "Admin","admin", "'+ psw +'" )')

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.data_default + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `title` VARCHAR(50), \
    `cycle` VARCHAR(30), \
    `certificate` VARCHAR(30), \
    `institution` VARCHAR(50), \
    `phone` VARCHAR(30), \
    `street` VARCHAR(30), \
    `suburb` VARCHAR(30), \
    `town` VARCHAR(30), \
    `company` VARCHAR(30), \
    `cp` VARCHAR(30), \
    `c_street` VARCHAR(30), \
    `c_suburb` VARCHAR(30), \
    `c_town` VARCHAR(30), \
    `product` VARCHAR(30), \
    `scaffold` VARCHAR(30), \
    `crust` boolean, \
    `thick` VARCHAR(30), \
    `quantity` INT, \
    `wet` INT, \
    `reference` INT, \
    `timeOut` INT, \
    `sensor0` FLOAT, \
    `sensor1` FLOAT, \
    `sensor2` FLOAT, \
    `sensor3` FLOAT, \
    `sensor4` FLOAT, \
    `sensor5` FLOAT, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)');

connection.query('\
    INSERT INTO `' + dbconfig.database + '`.`' + dbconfig.data_default + '` \
    (title, cycle, certificate, institution, phone, street, suburb, town, product, scaffold, crust, thick, quantity ,wet,reference,timeOut)\
    VALUES ( "CERTIFICADO HT SEGUN NOM144 MEXICO", "Esteriliz 1_", "MX-031-HT", "UNIVERSAL PALLET DE MEXICO S.A. DE C.V",\
    "83212107", "CECILIO GARZA No.- 400", "COL. EL MILAGRO", "APODACA N.L.", "Tarimas", "Barrote", False, "38 mm", 540, 25,57,30)');

connection.query('\
CREATE TABLE `' + dbconfig.database + '`.`' + dbconfig.sensor + '` ( \
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT, \
    `sensor0` DECIMAL(5,2), \
    `sensor1` DECIMAL(5,2), \
    `sensor2` DECIMAL(5,2), \
    `sensor3` DECIMAL(5,2), \
    `sensor4` DECIMAL(5,2), \
    `sensor5` DECIMAL(5,2), \
    `date_insert` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`), \
    UNIQUE INDEX `id_UNIQUE` (`id` ASC) \
)');


console.log('Success: Database Created!')

connection.end();