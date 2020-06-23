const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const Router = require("./Router");

app.use(express.static(path.join(__dirname, "build")));
app.use(express.json());

//Database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "job_db",
});

db.connect(function (err) {
  if (err) {
    console.log("DB error");
    throw err;
    return false;
  }
});

const sessionStore = new MySQLStore(
  {
    expiration: 1825 * 86400 * 1000,
    endConnectionOnClose: false,
  },
  db
);

app.use(
  session({
    key: "asdfweaga",
    secret: "tshers",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1825 * 86400 * 1000,
      httpOnly: false,
    },
  })
);

new Router(app, db);

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  console.log("abcd");
  username = username.toLowerCase();

  if (username.length > 12 || password.length > 12) {
    res.json({
      success: false,
      msg: "An error occured, please try again",
    });
    return;
  }

  let cols = [username];
  db.query(
    "SELECT * from myuser WHERE username = ? LIMIT 1",
    cols,
    (err, data, fields) => {
      if (err) {
        res.json({
          success: false,
          msg: "An error occured, please try again",
        });
        return false;
      }

      if (data && data.length === 1) {
        bcrypt.compare(password, data[0].password_, (bcryptErr, verified) => {
          if (verified) {
            req.session.userID = data[0].id;

            res.json({
              success: true,
              usename: data[0].username,
            });
            return;
          } else {
            res.json({
              success: false,
              msg: "Invalid password",
            });
          }
        });
      } else {
        res.json({
          success: false,
          msg: "User not found, please try again",
        });
      }
    }
  );
});

app.listen(3000);
