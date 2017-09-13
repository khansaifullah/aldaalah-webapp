
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var db = require('../config/db');
var oneSignalConfig = require('../config/OneSignalConfig');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
//User = mongoose.model('User')
mongoose.createConnection(db.url);
var https = require('https');
 var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic OWU2NTgxNDUtOTViNi00N2VmLWIyOWEtZGM0YzZhOGZlZWQ0"
  };
   var options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };
 var sendNotification = function(data) {
 
  
 
  
  
  
};

var message = { 
  app_id: "8c415ffd-a41d-41cb-9f32-01111cc9dbac",
  contents: {"en": "Hello Saif"},
  include_player_ids: ["a894091c-17a8-4e21-ac79-ddba3db81a73"]
};

sendNotification(message);

export.funcName = function (req. res){
	
}

