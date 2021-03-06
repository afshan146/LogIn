const bcrypt = require("bcrypt");

class Router {
  constructor(app, db) {
    this.getData(app, db);
    this.login(app, db);
    this.logout(app, db);
    this.isLoggedIn(app, db);
  }

  getData(app, db) {
    console.log("query data");

    app.post("/getData", (req, res) => {
      console.log("processing http request");

      db.query("select * from matching_file_temp", (err, data, fields) => {
        if (err) {
          res.json({
            success: false,
            msg: "An error occured, cannot fetch data",
          });
          return false;
        }
        if (data && data.length > 1) {
          res.json({
            success: true,
            rowData: data,
          });
        }
      });
    });
  }

  login(app, db) {
    app.post("/login", (req, res) => {
      let username = req.body.username;
      let password = req.body.password;

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
            bcrypt.compare(
              password,
              data[0].password_,
              (bcryptErr, verified) => {
                if (verified) {
                  req.session.userID = data[0].id;

                  res.json({
                    success: true,
                    username: data[0].firstname,
                    userPriority: data[0].privilege,
                  });
                  return;
                } else {
                  res.json({
                    success: false,
                    msg: "Invalid password",
                  });
                }
              }
            );
          } else {
            res.json({
              success: false,
              msg: "User not found, please try again",
            });
          }
        }
      );
    });
  }

  logout(app, db) {
    app.post("/logout", (req, res) => {
      if (req.session.userID) {
        req.session.destroy();
        res.json({
          success: true,
        });
        return true;
      } else {
        res.json({
          success: false,
        });
        return false;
      }
    });
  }

  isLoggedIn(app, db) {
    console.log("abcd2");
    app.post("/isLoggedIn", (req, res) => {
      if (req.session.userID) {
        let cols = [req.session.userID];
        db.query(
          "SELECT * from myuser WHERE id= ? LIMIT 1",
          cols,
          (err, data, field) => {
            if (data && data.length === 1) {
              res.json({
                success: true,
                username: data[0].firstname,
                userPriority: data[0].privilege,
              });
              return true;
            } else {
              res.json({
                success: false,
              });
            }
          }
        );
      } else {
        res.json({
          success: false,
        });
      }
    });
  }
}

module.exports = Router;
