var express  = require('express'), http = require('http');
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var app = express();

var server = http.createServer(app);

var mysql = require('mysql');
var moment = require('moment');

var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'dtr+123',
  database : 'Pallets'
});

server.listen(8080);

var io = require('socket.io').listen(server);

var passport = require('passport');
var flash    = require('connect-flash');

var json2csv = require('json2csv');
var fs = require('fs');

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
// route public files
app.use(express.static('public'));
//app.set('view engine', 'ejs'); // set up ejs for templating
app.set('view engine', 'ejs');
// required for passport
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================

function querySensorsGroup({t1, t2, rango, orderBy = "ASC"}){

	let query =  `SELECT max(date_insert) as date_insert, AVG(sensor0) as sensor0, AVG(sensor1) as sensor1, AVG(sensor2) as sensor2, AVG(sensor3) as sensor3,
					AVG(sensor4) as sensor4, AVG(sensor5) as sensor5 FROM sensors;`

	if(t1 !== undefined & t2 !== undefined){
		query += `WHERE date_insert BETWEEN "${t1}" AND "${t2}"`
	}

	query += `GROUP BY year(date_insert), month(date_insert), day(date_insert), hour(date_insert), minute(date_insert) ORDER BY date_insert DESC `

	if(rango !== undefined){
		query += `LIMIT ${rango}`
	}

	return `SELECT * FROM (${query}) tmp ORDER BY tmp.date_insert ${orderBy} `
}

function empty(object) {
  for (var i in object) 
    if (object.hasOwnProperty(i))
      return false;
 
  return true;
}
function setTime(time) {

    /* var str = String(time);
	var res = str.substring(16, 21); */
	
    return moment(time).format("HH:mm");
}
// Sockets
io.on('connection', function(socket){
  	console.log('a user connected');
  	var flag=0;
	var loopSensor,loopChartSensor;

	function selectQuery(){
		var rango = 40;
		const querySensors = querySensorsGroup({rango, orderBy: "ASC"})

		db.query( querySensors , function(err, results){		
			
	      if (err) { console.log("error query") }
	      if ( empty(results) ){
			console.log("Result ::: ", results)	
	        console.log("Sin Datos ");
	      }else{
	      	db.query('SELECT * FROM data_default',function(err, data) {			
				  let s0=[], s1=[],s2=[], s3=[], s4=[], s5=[], t=[], reference=[];
				  
				const {reference: refDB} = data[0]	      		
				  
				for (var i=0; i <= (results.length -1) ; i++) {
					let sensorObj = addVariableError(results[i], data[0])

					const {
						sensor0,
						sensor1,
						sensor2,
						sensor3,
						sensor4,
						sensor5,
						date_insert
					} = sensorObj
					
					s0.push(sensor0);
					s1.push(sensor1);
					s2.push(sensor2);
					s3.push(sensor3);
					s4.push(sensor4);
					s5.push(sensor5);

					reference.push(refDB);
					const date = setTime(date_insert)
					t.push(date);		  
				};	

				const dataSensors = {labels:t, series:[s0, s1, s2, s3, s4, s5, reference]}

				socket.emit('dataSensors', dataSensors);	   	

		    });
	   	  }
		});
	};

	function chartCompleate({ id }) {
		db.query( `SELECT date_start AS start, date_end AS end FROM pallets_data WHERE id=${id}`,
		function (err, results) {
			if (err){ console.log("error query") }
			if (empty(results)){ console.log("Sin Datos ") } 
			else {
				const { start, end } = results[0];
				var t1 = moment(start).format("YYYY-MM-DD  HH:mm:ss");
				var t2 = moment(end).format("YYYY-MM-DD  HH:mm:ss");
				const queryReport = querySensorsGroup({t1, t2, orderBy: "ASC"})
				db.query( queryReport, function (err, data) {
					if (err) { console.log("error query") }
					if (empty(data)) { console.log("Sin Datos ") } 
					else {
						var numRows1 = data.length;
						db.query( "SELECT * FROM data_default",
							function (err, ref) {
							const {reference: referenceDB} = ref[0]

							var aux = "",
								txt = "",
								csv = "",
								reference = [];

							let s0 = [], s1 = [], s2 = [], s3 = [], s4 = [], s5 = [], t = []
								
							var fields = [
								"fecha/hora",
								"sensor1",
								"sensor2",
								"sensor3",
								"sensor4",
							];
							let jsonData = []

							for (var i = 0; i <= numRows1 - 1; i++) {								
								let sensorObj = addVariableError(data[i], ref[0])								
								const {
									sensor0,
									sensor1,
									sensor2,
									sensor3,
									sensor4,
									sensor5,
									date_insert,
								} = sensorObj
								
								const t1 = moment(date_insert).format("YYYY-MM-DD  HH:mm:ss");

								s0.push(sensor0);
								s1.push(sensor1);
								s2.push(sensor2);
								s3.push(sensor3);
								s4.push(sensor4);
								s5.push(sensor5);
								
								t.push(setTime(date_insert));
								
								reference.push(referenceDB);

								jsonData.push({"fecha/hora": t1, sensor0, sensor1, sensor2, sensor3, sensor4, sensor5})
							}

							s0.push("");
							s1.push("");
							s2.push("");
							s3.push("");
							s4.push("");
							s5.push("");

							reference.push(referenceDB);

							t.push("");

							aux = { labels: t, series: [s0, s1, s2, s3, s4, s5, reference] };

							socket.emit("dataSensors", aux);

							json2csv({ data: jsonData, fields: fields }, function (err, csv) {
								if (err) console.log(err);
								var file = "public/data/file.csv";
								fs.writeFile(file, csv, function (err) {
								if (err) throw err;
								console.log("file saved");
								});
							});
							}
						);
					}
				});
			}
		}
		);
	}
	function Sensors(){
		var queryDataDefault  = 'SELECT sensor0, sensor1, sensor2, sensor3, sensor4, sensor5 FROM data_default limit 1;'
		//var querySensors	= "SELECT id, AVG(sensor0) as s0, AVG(sensor1) as s1, AVG(sensor2) as s2,AVG(sensor3) as s3,AVG(sensor4) as s4, AVG(sensor5) as s5 FROM sensors ORDER BY id DESC LIMIT 1";
		db.query(queryDataDefault, function(error, dataDefault){
			console.log("Error:", error)
			db.query(querySensorsGroup({rango: 1}),function(err,data){
				if (err) {console.log("error loopSensors");}
				if (empty(data)) {
					console.log("Results::: ", data)
					console.log("Sin Datos ");
				}else{									
					const sensorsVariableError = addVariableError(data[0], dataDefault[0])
					console.log("Data:", data[0])
					console.log("Sensor var Error:", dataDefault[0]);
					console.log("Data with var error:", sensorsVariableError)
					socket.emit('panelSensor',{	... sensorsVariableError });
				}
			});

		})
	}

	function addVariableError(sensors, varError){
		let obj = {}	

		Object.keys(sensors).forEach(function(key){
			if(key !== "date_insert"){
				obj[key] = (sensors[key] > 0)? (sensors[key] + (varError[key])).toFixed(2) : 0
			}else{
				obj[key] = sensors[key]
			}
		})

		return obj
	}
	var getSensors=setInterval(function(){ Sensors() }, 5000);

	function verify() {				
		db.query(querySensorsGroup({rango: 1}),function(err,data){
			if (err) {console.log("error verifySensors");}
			if (empty(data)) {
				console.log("Sin Datos ");
			}else{
				const min	 = 4
				let validate = 0

				Object.keys(data[0]).map(function(key){
					if(data[0][key] > 0 && key !== "date_insert"){
						validate ++
					}
				})

				if(validate < min){
					socket.emit('dataSensors',{msg: 'error'});
	      			clearInterval(verifySensors);
				}
			};
		});
	};
	
	var verifySensors=setInterval(function(){ verify() }, 5000);

	function querySensor(){
		var queryT = 'SELECT timeOut, reference FROM data_default;'
		
		db.query(queryT,function(err, timeOut){
		 	db.query(querySensorsGroup({rango: 1}),function(err,data){
				if (err) {
					console.log("error query");
				}
				if ( empty(data) ){
					console.log("Results::: ", data)
					console.log("Sin Datos ");
				}else{
					const min = 4;
					let validate = 0;

					const {timeOut: timeOutDb, reference} = timeOut[0]
					const {s0, s1, s2, s3, s4, s5} = data[0]

					Object.keys(data[0]).map(function(key){
						if(data[0][key] >= reference){
							validate ++
						}
					})

					if(validate <= min){
						console.log("mayor a "+reference, data[0]);
						var aux=((timeOutDb*60)*1000);
						stopInterval(aux);
						console.log(aux);
					}else{
						console.log("menor a "+reference, data[0]);
					}
		      	}
			});
		});		 
	};
	socket.on('showChart',function(id){
		clearInterval(loopSensor);
		clearInterval(loopChartSensor);
		chartCompleate(id);
	});
	
	
	socket.on('startChart',function(data){
		console.log(data);		
		selectQuery();
		loopChartSensor = setInterval(function(){ selectQuery() }, 5000);
		loopSensor = setInterval(function(){ querySensor() }, 5000);
	});

	function stopInterval(timeOut){
		clearInterval(loopSensor);
		setTimeout(function(){ 
			socket.emit('stopSensor',{msg: "success Start Chart"});  
		}, timeOut); 		

		console.log("stop"+timeOut);
	}

	socket.on('setReference',function(data) { 
		selectQuery();
		console.log(data);
	});
	// Close socket
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

console.log('Pallet Oven Monitor System on port 8080');