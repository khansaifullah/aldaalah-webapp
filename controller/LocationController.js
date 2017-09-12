var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' })
mongoose.createConnection(db.url);

                             
exports.updateUserLocation=function(reqData,res){
    var phoneNo=reqData.phoneNo;
	var longitude=reqData.longitude;
	var latitude=reqData.latitude;
    //Check valid Location -180 to 180
    logger.info('LocationController.updateUserLocation called  :' 
                  + phoneNo+ '**'+ longitude +'**'+ latitude);
	
	AppController.userExists(phoneNo, function(user){
		if (user){
			user.loc=[longitude,latitude];
			user.save(function (err, user){
                if(err){
                        logger.error('Some Error while updating user' + err );
                         
                    }
                else{
					logger.info('User updated With Phone Num ' + phoneNo );
                                  
                    res.jsonp({status:"success",
                    message:"Location Updated!",
                     object:[]}); 
                         }
                     
                  
              });
                
			logger.info('location : '+user.loc );
		}
		
	});
}