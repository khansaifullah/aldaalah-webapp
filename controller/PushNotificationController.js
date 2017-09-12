
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


export.funcName = function (req. res){
	
}

