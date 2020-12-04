const config = require('./config/config.json')
const process = require('process')
const express = require('express');
const app = express();
const router = express.Router();

let port = 3000;
if (process.argv.length > 2)
    port = process.argv[2];

var mysql = require('mysql');

connInfo = config;
console.log(config);


class SqlClient {
  constructor(connInfo) {
    this.connInfo = connInfo;
  }

  getConn() {
    return mysql.createConnection(this.connInfo);
  }

  executeQuery(sql, params, okCallback, failCallback) {
      var conn = this.getConn();
      conn.connect(function(err) {
          if (err) {
              failCallback && failCallback();
              throw err;
          }
          conn.query(sql, params, function (err, result, fields) {
              if (err) throw err;
              okCallback && okCallback(result, fields);
          });
          conn.end();
      });
  }
}

function validateUser(user_id, user_pass, callback) {
    client = new SqlClient(connInfo);
    sql = "select * from tb_user where id = ? and pass = md5(?) and status = 0";
    client.executeQuery(sql, [user_id, user_pass], function(res) {
        // console.log(res);
        callback && callback(res.length > 0);
    }, function(res) {
        console.log("No result");
        callback && callback(0);
    });
}

function clockInOrOut(user_id, type, clockTime, callback) {
    client = new SqlClient(connInfo);
    sql = "insert into tb_timeclock(user_id, clock_type, clock_time) values(?, ?, ?)";
    // remove the ms
    var time = new Date(clockTime);
    time.setMilliseconds(0);
    client.executeQuery(sql, [user_id, type, time], function(res) {
        callback && callback(res.length > 0);
    }, function(res) {
        console.log("No result");
        callback && callback(0);
    });
}

app.use('/', express.static('static'));

// setup middleware to do logging
app.use((req, res, next) => { // for all routes
    console.log(`${req.method} request for ${req.url}`)
    next(); // keep going
});

// parse data in body as JSON
router.use(express.json());

/***************Clock API start*******************/
router.route('/')
    .get((req, res) => {
        var apTime = new Date();
        res.send("" + apTime.getTime());
    })
    .post((req, res) => {
        let userId = req.body.username;
        let password = req.body.password;
        let type = req.body.type; // 1: clock in, 2: clock out
        let clockTime = req.body.clockTime;
        console.log(req.body);

        validateUser(userId,  password, function(status) {
            if (status == 0) { // failed
                res.send("0");
            } else {
                clockInOrOut(userId, type, clockTime, function(clockStatus) {
                    if (clockStatus == 0) {
                        res.send("1");
                    } else {
                        res.send("0");
                    }
                });
            }
        });
    })
/***************Clock API End*******************/
app.use('/api/clock', router);

app.listen(port, '0.0.0.0', () => {
    console.log(`Listening on port ${port}`);
});
