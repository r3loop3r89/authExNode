var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var mySql = require('mysql');

var jwt = require('jsonwebtoken');
var config = require('../config');

var connection = mySql.createPool(
  {
    connectionLimit:50,
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'authappdb'
  }
);

router.use(
  bodyParser.urlencoded(
    {
      extended: true
    }
  )
);

router.use(
  bodyParser.json()
);

router.get("/:name", function(req, res){
  var name = req.params.name;
  res.write("Hello " + name);
  res.end();
});

router.get("/me/:token", function(req, res){
  var token = req.params.token;
  jwt.verify(token, config.secret, function(error, decoded){
    if(!!error){
      res.json({
        success: 0,
        message: "there was an error",
        error
      });
    }else{
      res.json({
        success: 1,
        message: "Authenticated",
        decoded
      });
    }
  })
});

router.post("/login", function(req, res){
  console.log("Request Params : ", req.body);
  var email = req.body.email;
  var password = req.body.password;

  var queryString = "SELECT * FROM user_master where email='"+email+"'";

  connection.getConnection(
    function(error, tempConnection){
      if(!!error){
        //ERROR IN GET CONNECTION
        res.write("Error : " + error)
        res.end();
      }else{
        console.log("connected to db successfully");
        tempConnection.query(
          queryString,
          function(error, data, fields){
            if(!!error){
              //ERROR IN FIRING QUERY
              res.json({
                success: 0,
                message: "Error : " + error
              });
            }else{
              console.log("query executed successfully");              
              if(data.length>0){
                if(data[0].password===password){
                  var token = jwt.sign(
                    {
                      user_id: data[0].user_id
                    },
                    config.secret,
                    {
                      expiresIn: 120
                    }
                  );
                  res.json({
                    success: 1,
                    message: "User Found",
                    token,
                    data
                  });
                  
                }else{
                  res.json({
                    success: 0,
                    message: "Wrong credentials"
                  });
                }
              }else{
                res.json({
                  success: 0,
                  message: "Wrong credentials"                  
                });
              }
            }
          }
        );
      }
    }
  );
});

module.exports = router;