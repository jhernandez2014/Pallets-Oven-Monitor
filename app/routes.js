module.exports = function (app, passport) {
  // app/routes.js
  var mysql = require("mysql");
  var bcrypt = require("bcrypt-nodejs");
  var dbconfig = require("./../config/database");
  var connection = mysql.createConnection(dbconfig.connection);
  var bodyParser = require("body-parser");
  var moment = require("moment");

  connection.query("USE " + dbconfig.database);

  function querySelect(table) {
    var query = "SELECT * FROM " + table + "";
    return query;
  }
  function querySelectD(table) {
    var query = "SELECT * FROM " + table + " ORDER BY id DESC";
    return query;
  }

  function updateQuery(
    table,
    title,
    cycle,
    certificate,
    institution,
    phone,
    street,
    suburb,
    town,
    company,
    cp,
    c_street,
    c_suburb,
    c_town,
    product,
    scaffold,
    crust,
    thick,
    quantity,
    id
  ) {
    var query =
      "UPDATE " +
      table +
      ' SET title = "' +
      title +
      '", cycle = "' +
      cycle +
      '", certificate = "' +
      certificate +
      '",\
			institution = "' +
      institution +
      '", phone = "' +
      phone +
      '", street = "' +
      street +
      '", suburb = "' +
      suburb +
      '", \
			town = "' +
      town +
      '",company = "' +
      company +
      '",cp = "' +
      cp +
      '",c_street = "' +
      c_street +
      '",c_suburb = "' +
      c_suburb +
      '",c_town = "' +
      c_town +
      '",\
			product = "' +
      product +
      '",scaffold = "' +
      scaffold +
      '", crust = ' +
      crust +
      ', \
			thick = "' +
      thick +
      '", quantity = ' +
      quantity +
      " WHERE id =" +
      id +
      "";
    return query;
  }

  function insertQuery(
    table,
    title,
    cycle,
    certificate,
    institution,
    phone,
    street,
    suburb,
    town,
    company,
    cp,
    c_street,
    c_suburb,
    c_town,
    product,
    scaffold,
    crust,
    thick,
    quantity,
    status
  ) {
    var query =
      "INSERT INTO " +
      table +
      ' (title, cycle,certificate,institution,phone,street,suburb,\
			town,company,cp,c_street,c_suburb,c_town,product,scaffold,crust,thick,quantity,status,date_start,date_end)\
			VALUES("' +
      title +
      '","' +
      cycle +
      '","' +
      certificate +
      '","' +
      institution +
      '","' +
      phone +
      '","' +
      street +
      '","' +
      suburb +
      '","' +
      town +
      '",\
			"' +
      company +
      '","' +
      cp +
      '","' +
      c_street +
      '","' +
      c_suburb +
      '","' +
      c_town +
      '",\
			"' +
      product +
      '","' +
      scaffold +
      '",' +
      crust +
      ',"' +
      thick +
      '",' +
      quantity +
      "," +
      status +
      ",now(),now());";

    return query;
  }

  function crustValue(crust) {
    if (crust == "0") {
      crust = false;
    } else {
      crust = true;
    }
    return crust;
  }

  function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
  }

  Date.prototype.toMysqlFormat = function () {
    return (
      this.getUTCFullYear() +
      "-" +
      twoDigits(1 + this.getUTCMonth()) +
      "-" +
      twoDigits(this.getUTCDate()) +
      " " +
      twoDigits(this.getHours()) +
      ":" +
      twoDigits(this.getUTCMinutes()) +
      ":" +
      twoDigits(this.getUTCSeconds())
    );
  };

  function empty(object) {
    for (var i in object) if (object.hasOwnProperty(i)) return false;

    return true;
  }

  app.get("/", isLoggedIn, function (req, res) {
    var user = req.user;
    connection.query(querySelectD("pallets_data"), function (
      err,
      pallets_data
    ) {
      if (err) {
        console.log("error query");
      }
      if (empty(pallets_data)) {
        console.log("Sin Datos ");
        connection.query(
          "SELECT * FROM data_default",
          function (err, raference) {
            res.render("dashboard.ejs", {
              user: user,
              empty: "true",
              dataDefault: raference,
            });
          }
        );
      } else {
        connection.query(
          "SELECT * FROM data_default",
          function (err, raference) {
            var ciclo = [],
              num = [],
              certificate = [],
              status = [],
              cycleArrays = [],
              numArrays = [],
              certificateArrays = [],
              statusArrays = [];
            //set default variables
            var dataTotal = pallets_data.length,
              pageSize = 20,
              pageCount = Math.ceil(dataTotal / pageSize),
              currentPage = 1,
              data = [],
              dataArray = [],
              cycleList = [],
              numList = [],
              certificateList = [],
              statusList = [],
              dataList = [];
            //console.log(dataTotal);
            //genreate list of students
            console.log("total datos" + pallets_data.length);
            for (var i = 0; i <= pallets_data.length - 1; i++) {
              ciclo.push(pallets_data[i].cycle);
              num.push(pallets_data[i].id);
              certificate.push(pallets_data[i].certificate);
              status.push(pallets_data[i].status);
            }

            console.log(num + " " + num.length);
            while (num.length > 0) {
              cycleArrays.push(ciclo.splice(0, pageSize));
              numArrays.push(num.splice(0, pageSize));
              certificateArrays.push(certificate.splice(0, pageSize));
              statusArrays.push(status.splice(0, pageSize));
            }

            //set current page if specifed as get variable (eg: /?page=2)
            if (typeof req.query.page !== "undefined") {
              currentPage = +req.query.page;
            }

            //show list of students from group
            cycleList = cycleArrays[+currentPage - 1];
            numList = numArrays[+currentPage - 1];
            certificateList = certificateArrays[+currentPage - 1];
            statusList = statusArrays[+currentPage - 1];
            console.log(cycleList);
            dataList.push({
              cycle: cycleList,
              id: numList,
              certificate: certificateList,
              status: statusList,
            });
            console.log(dataList);
            //console.log(dataList);
            res.render("dashboard.ejs", {
              user: user,
              empty: "false",
              dataDefault: raference,
              data: dataList,
              pageSize: pageSize,
              dataTotal: dataTotal,
              pageCount: pageCount,
              currentPage: currentPage,
            });
          }
        );
      }
    });
  });

  app.get("/dashboard", isLoggedIn, function (req, res) {
    var user = req.user;
    connection.query(querySelectD("pallets_data"), function (
      err,
      pallets_data
    ) {
      if (err) {
        console.log("error query");
      }
      if (empty(pallets_data)) {
        console.log("Sin Datos  asdasd");
        connection.query(
          "SELECT * FROM data_default",
          function (err, raference) {
            res.render("dashboard.ejs", {
              user: user,
              empty: "true",
              dataDefault: raference,
            });
          }
        );
      } else {
        connection.query(
          "SELECT * FROM data_default",
          function (err, raference) {
            var ciclo = [],
              num = [],
              certificate = [],
              status = [],
              cycleArrays = [],
              numArrays = [],
              certificateArrays = [],
              statusArrays = [];
            //set default variables
            var dataTotal = pallets_data.length,
              pageSize = 20,
              pageCount = Math.ceil(dataTotal / pageSize),
              currentPage = 1,
              data = [],
              dataArray = [],
              cycleList = [],
              numList = [],
              certificateList = [],
              statusList = [],
              dataList = [];
            //console.log(dataTotal);
            //genreate list of students
            console.log("total datos" + pallets_data.length);
            for (var i = 0; i <= pallets_data.length - 1; i++) {
              ciclo.push(pallets_data[i].cycle);
              num.push(pallets_data[i].id);
              certificate.push(pallets_data[i].certificate);
              status.push(pallets_data[i].status);
            }

            console.log(num + " " + num.length);
            while (num.length > 0) {
              cycleArrays.push(ciclo.splice(0, pageSize));
              numArrays.push(num.splice(0, pageSize));
              certificateArrays.push(certificate.splice(0, pageSize));
              statusArrays.push(status.splice(0, pageSize));
            }

            //set current page if specifed as get variable (eg: /?page=2)
            if (typeof req.query.page !== "undefined") {
              currentPage = +req.query.page;
            }

            //show list of students from group
            cycleList = cycleArrays[+currentPage - 1];
            numList = numArrays[+currentPage - 1];
            certificateList = certificateArrays[+currentPage - 1];
            statusList = statusArrays[+currentPage - 1];
            console.log(cycleList);
            dataList.push({
              cycle: cycleList,
              id: numList,
              certificate: certificateList,
              status: statusList,
            });
            console.log(dataList);
            //console.log(dataList);
            res.render("dashboard.ejs", {
              user: user,
              empty: "false",
              dataDefault: raference,
              data: dataList,
              pageSize: pageSize,
              dataTotal: dataTotal,
              pageCount: pageCount,
              currentPage: currentPage,
            });
          }
        );
      }
    });
  });

  app.get("/report", isLoggedIn, function (req, res) {
    res.render("report_chart.html");
  });

  // Module Chart
  app.get("/chart/new", isLoggedIn, function (req, res) {
    var user = req.user;
    var folio = "";
    connection.query(querySelect("data_default"), function (err, data_default) {
      connection.query(
        "SELECT id FROM pallets_data ORDER BY id DESC LIMIT 1",
        function (err, data) {
          if (data.length == 0) {
            folio = 1;
          } else {
            folio = data[0].id + 1;
            console.log(folio);
          }

          res.render("chart.ejs", {
			user: user,
			data:[],
            dataDefault: data_default,
            showDate: "true",
            update: "false",
            folio: folio,
          });

          console.log(data_default);
        }
      );
    });
  });

  app.get("/chart/:id", isLoggedIn, function (req, res) {
    var id = req.params.id;
    var user = req.user;
    connection.query(querySelect("data_default"), function (err, data_default) {
      connection.query(
        "SELECT * FROM pallets_data WHERE id=" +
          id +
          " ORDER BY id DESC LIMIT 1",
        function (err, data) {
          var text = JSON.stringify(data);
          obj = JSON.parse(text);
          console.log(obj[0].date_start);

          var m1 = moment(obj[0].date_start);
          var m2 = moment(obj[0].date_end);

          var t1 = m1.format("YYYY-MM-DD  HH:mm:ss");
          var t2 = m2.format("YYYY-MM-DD  HH:mm:ss");

          console.log(t1 + " " + t2);

          res.render("chart.ejs", {
			user: user,
			dataDefault: data_default,
            data: data,
            showDate: "false",
            update: "true",
            folio: id,
            start: t1,
            end: t2,
          });
        }
      );
    });
  });

  app.post("/chart/put/:id", isLoggedIn, function (req, res) {
    var id = req.params.id;
    var user = req.user;

    var crust = crustValue(req.body.crust);
    var queryUpdate = updateQuery(
      "pallets_data",
      req.body.title,
      req.body.cycle,
      req.body.certificate,
      req.body.institution,
      req.body.phone,
      req.body.street,
      req.body.suburb,
      req.body.town,
      req.body.company,
      req.body.cp,
      req.body.c_street,
      req.body.c_suburb,
      req.body.c_town,
      req.body.product,
      req.body.scaffold,
      crust,
      req.body.thick,
      req.body.quantity,
      id
    );

    connection.query(queryUpdate, function (err, data) {
      console.log("update success");
      res.json({ data: data });
      console.log(data);
    });
  });

  // Add new cycle
  app.post("/newCycle", function (req, res) {
    var crust = crustValue(req.body.crust);

    var queryInsert = insertQuery(
      "pallets_data",
      req.body.title,
      req.body.cycle,
      req.body.certificate,
      req.body.institution,
      req.body.phone,
      req.body.street,
      req.body.suburb,
      req.body.town,
      req.body.company,
      req.body.cp,
      req.body.c_street,
      req.body.c_suburb,
      req.body.c_town,
      req.body.product,
      req.body.scaffold,
      crust,
      req.body.thick,
      req.body.quantity,
      req.body.status
    );

    connection.query(queryInsert, function (err, data) {
      connection.query(
        "SELECT * FROM pallets_data ORDER BY id DESC LIMIT 1",
        function (err, data) {
          var text = JSON.stringify(data);
          obj = JSON.parse(text);
          console.log(obj[0].date_start);
          var m = moment(obj[0].date_start);
          var s = m.format("YYYY-MM-DD  HH:mm:ss");
          console.log(s);
          res.json({ data: data, update: "true", start: s });
        }
      );
    });
  });

  // Add End cycle
  app.post("/endCycle", function (req, res) {
    var id = req.body.id;
    var status = req.body.status;
    console.log(id);
    connection.query(
      "UPDATE pallets_data SET date_end = now(), status = " +
        status +
        " WHERE id=" +
        id +
        ";",
      function (err, data) {
        connection.query(
          "SELECT date_end FROM pallets_data WHERE id=" + id + ";",
          function (err, dateUpdate) {
            var text = JSON.stringify(dateUpdate);
            obj = JSON.parse(text);
            console.log(obj[0].date_end);
            var m = moment(obj[0].date_end);
            var s = m.format("YYYY-MM-DD  HH:mm:ss");
            console.log(s);
            res.json({ end: s });
          }
        );
      }
    );
  });

  // Module Settings
  app.get("/settings", isLoggedIn, function (req, res) {
    var user = req.user;
    connection.query("SELECT * FROM data_default", function (
      err,
      data_default
    ) {
      res.render("settings.ejs", {
        user: user,
        dataDefault: data_default,
        message: req.flash("successUpdate"),
      });
    });
  });

  // Update Info on Settings
  app.post("/update_info", function (req, res) {
    var crust = crustValue(req.body.crust);
    var queryUpdate = updateQuery(
      "data_default",
      req.body.title,
      req.body.cycle,
      req.body.certificate,
      req.body.institution,
      req.body.phone,
      req.body.street,
      req.body.suburb,
      req.body.town,
      req.body.company,
      req.body.cp,
      req.body.c_street,
      req.body.c_suburb,
      req.body.c_town,
      req.body.product,
      req.body.scaffold,
      crust,
      req.body.thick,
      req.body.quantity,
      req.body.id
    );

    connection.query(queryUpdate, function (err, data) {
      console.log("update success");
      req.flash("successUpdate", "Successfully Update");
      res.redirect("/settings");
    });
  });
  // Value Reference Chart
  app.post("/reference", isLoggedIn, function (req, res) {
  const {reference, wet, timeOut, sensor0, sensor1, sensor2, sensor3, sensor4, sensor5} = req.body	
  console.log(req.body)
  const queryString = `UPDATE data_default set reference=${reference||0} , wet=${wet||0}, timeOut=${timeOut||0}, sensor0=${sensor0 || 0}, sensor1=${sensor1 || 0}, 
                      sensor2=${sensor2 || 0}, sensor3=${sensor3 || 0}, sensor4=${sensor4 || 0}, sensor5=${sensor5||0} where id = 1; `
    connection.query(queryString, function (err, data) {	  
      console.log("Error ? ", err)
      res.json({ reference: data });
    });
  });

  // Module Profile
  app.get("/profile", isLoggedIn, function (req, res) {
    connection.query(
      "SELECT * FROM data_default",
      function (err, data) {
        console.log(data);
        res.render("profile.ejs", {
          user: req.user,
          dataDefault: data,
        });
      }
    );
  });

  app.post("/profile/put/:id", isLoggedIn, function (req, res) {
    var id = req.params.id;
    var nick = req.body.nick;
    var user = req.body.user;
    var psw = req.body.psw;
    var pswReal = bcrypt.hashSync(psw, null, null);

    connection.query(
      'UPDATE users SET nickname="' +
        nick +
        '", username="' +
        user +
        '",password="' +
        pswReal +
        '" WHERE id=' +
        id +
        ";",
      function (err, data) {
        console.log("update success");
        res.json({ data: data });
        console.log(data);
      }
    );
  });

  //Copy report
  app.get("/copy/report/:id", isLoggedIn, function(req, res){
    const { id } = req.params
    const {date, hour} = req.query
    const dateFormat = "YYYY-MM-DD HH:mm:ss"
    const queryReportData = `SELECT * FROM pallets_data WHERE id=${id}`          

    connection.query(queryReportData, function(err, reportData){
      
      const { date_start, date_end}  = reportData[0]
      const momentDate = moment(date);
      let momentStart  = moment(date_start);

      momentStart.date(momentDate.date());
      momentStart.month(momentDate.month());
      momentStart.year(momentDate.year());
      momentStart.hour(hour);

      const diffDates = moment(date_end).diff(moment(date_start), "seconds")
      const diffOldDate = moment(momentStart).diff(moment(date_start), "seconds")
      let momentEnd = moment(momentStart).add(diffDates, 'seconds')

      let queryInsert = `INSERT INTO pallets_data(title, cycle,certificate,institution,phone,street,suburb, town,company,cp,c_street,c_suburb,c_town,product,scaffold,crust,thick,quantity,status,date_start,date_end ) 
                        SELECT title, cycle,certificate,institution,phone,street,suburb, town,company,cp,c_street,c_suburb,c_town,product,scaffold,crust,thick,quantity,status,date_start,date_end 
                        FROM pallets_data where id = ${id}`

      const queryInsertSensors = `INSERT INTO sensors(date_insert, sensor0, sensor1, sensor2, sensor3, sensor4, sensor5)
                          SELECT DATE_ADD(date_insert, INTERVAL ${diffOldDate} SECOND) as date_insert, sensor0, sensor1, sensor2, sensor3, sensor4, sensor5
                          FROM sensors where date_insert BETWEEN "${moment(date_start).format(dateFormat)}" AND "${moment(date_end).format(dateFormat)}"`

      connection.query(queryInsert, function(error, report){
        const {insertId} = report

        connection.query( `UPDATE pallets_data set date_start="${momentStart.format(dateFormat)}", date_end = "${momentEnd.format(dateFormat)}" WHERE id = ${insertId}`,function(errorUpdate, update){
          if(errorUpdate){
            console.log("Erorr update", errorUpdate);            
          }
          console.log("Update ::", update)
        })

        connection.query( queryInsertSensors, function(errorInsert, sensors){
          if(errorInsert){
            console.log("Error :: ", errorInsert)
          }
          console.log("sensors:: ", sensors)
          res.json({sensors})
        })
      })


    })
  })

  app.get("/login", isNotLoggedIn, function (req, res) {
    res.render("login.ejs", { message: req.flash("loginMessage") });
  });

  app.post(
    "/login",
    passport.authenticate("local-login", {
      successRedirect: "/dashboard",
      failureRedirect: "/",
      failureFlash: true,
    }),
    function (req, res) {
      console.log("hello");

      if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
      } else {
        req.session.cookie.expires = false;
      }
      res.redirect("/");
    }
  );

  app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
  });
};

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();

  res.redirect("/login");
}

function isNotLoggedIn(req, res, next) {
  if (req.isAuthenticated()) res.redirect("/");

  return next();
}