var User = require('../models/User.js');
var Country = require('../models/Country.js');
var ConversationMessages = require('../models/ConversationMessages.js');
var Conversation = require('../models/Conversation.js');ConversationUser
var ConversationUser = require('../models/ConversationUser.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');

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
        logger.info(users.length + ' Users Found');
        callback(users);
        //process.exit();
    } 
    });
}



exports.findAllCountries=function(callback){
    
    
    Country.find({}, function(err, countries) {
    if (err){
         res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
                                });
    }
    
    else{ 
       // console.log(countries);
        callback(countries);
       // process.exit();
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
       // process.exit();
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
               logger.info("user found with phone no "+phoneNo);
                callback (user);
            }
            else{
                logger.info("user not found with phone no "+phoneNo);
                callback( user);
                
            }
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
       // process.exit();
    } 
    });
}


exports.findAllGroups=function(callback){
     
    //query with mongoose
   Conversation.find({'isGroupConversation': true}, function(err, groups) {
    if (err){
         res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
                                });
    }
    
    else{ 
        logger.info(groups.length + ' groups Found');
        callback(groups);
        //process.exit();
    } 
    });
}

              