var User = require('../models/User.js');
var db = require('../config/db');
require('datejs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.createConnection(db.url);
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



exports.findAllUser=function(callback){
    
    
    User.find({}, function(err, users) {
    if (err){
         res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
                                });
    }
    
    else{ 
        console.log(users);
        callback(users);
        process.exit();
    } 
    });
}

exports.findAllPhoneNo=function(callback){
     
    //query with mongoose
   User.find({}, {'_id': 0, 'phone' :1}, { sort: { '_id': 1 } }, function(err,usersContactNumber) {
        if (err) {

         res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
                                });
    }
    
    else{ 
        console.log(usersContactNumber);
        callback(usersContactNumber);
        process.exit();
    } 
    });
}

exports.userExists=function(phoneNo,callback){
     var query = { phone : phoneNo };
     User.findOne(query).exec(function(err, user){
        if (err){
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (user){
                console.log("user found with phone no "+phoneNo);
                callback (user);
            }
            else{
                console.log("user not found with phone no "+phoneNo);
                callback( user);
                
            }
       }
     });
}
              