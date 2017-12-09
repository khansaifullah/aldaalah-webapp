
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");
//package to generate a random number
var randomize = require('randomatic');
//mongoose.createConnection(db.url);

//mongoose.connect(db.url);

//Get the default connection
//var dbCon = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
//dbCon.on('error', console.error.bind(console, 'MongoDB connection error:'));


var userExists=function(phoneNo,callback){
    
    logger.info('UserExists Method Called');
     var query = { phone : phoneNo };
     User.findOne(query).exec(function(err, user){
        if (err){
            logger.error('Some Error while finding user' + err );
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (user){
                
                  logger.info('User Found with Phone Num. :' 
                  +phoneNo);
                
                console.log("user found with phone no "+phoneNo);
                callback (user);
            }
            else{
                
                 logger.info('User Not Found with Phone Num. :' 
                  +phoneNo);
                console.log("user not found with phone no "+phoneNo);
                callback( user);
                
            }
       }
     });
    
    logger.info(' Exit UserExists Method');
	
}
                              
exports.sendVerificationCode=function(reqData,res){
    
    try{
    logger.info('RegistrationController.sendVerificationCode called  :' 
                  + reqData.phoneNo );
    
    var phoneNo = reqData.phoneNo;
    var countryCode = reqData.countryCode;
    var resend =reqData.resend
	var code;
	var verificationMsg;
	var requestUrl;
	//var host;
	//generate a code and set to user.verification_code
	code=randomize('0', 4);
	verificationMsg="Verification code for Aldaalah Application : " + code;
	//host="http://sendpk.com/api/sms.php?username=923345022570&password=2375&mobile=";
	
    //find user by phone no.
    userExists(phoneNo,function(user){
		logger.info('User Exists Response : ' + user );
        if (!user){
             console.log (" User do not exist,  Creating user");
            if (resend==="true"||resend==1){
            res.jsonp({status:"failure",
            message:"Please Create User First",
            object:[]}); 
            
            }
            else{
            
                     var newuser = new User({  

                    phone: phoneNo,
                    country_code:countryCode,
                    verified_user:false,                            
                    verification_code:code
                     });
                     newuser.save(function (err, user) {
                    if(err){
                        logger.error('Some Error while saving user' + err );
                        res.jsonp({status:"failure",
                            message:"Some Error while saving user",
                            object:[]}); 
                    }
					else{
						 //Http Request to send message
						
						requestUrl="http://sendpk.com/api/sms.php?username=923370768876&password=5823&mobile="+user.phone+"&sender=umer%22&message="+verificationMsg;
						request.get(requestUrl,
									function(error,response,body){
										   if(error){
												 console.log(error);
										   }else{
												 console.log(response);
										 }
						});

							logger.info('User Created With Phone Num ' + phoneNo );
							res.jsonp({status:"success",
							message:"Verification code Sent!",
							object:[]});
						 
					 }
                   
                     });
            }
            
                   
        }
        else{
  
                console.log (" User Exists  sending verification code again");
                 // send verification code logic
                 //generate a code and set to user.verification_code
                 user.verification_code=code;
				 user.save(function (err, user) {
					 if (err){
						 logger.info ('Error While Updating verification_code ');
					 }
				 });
				 //"http://sendpk.com/api/sms.php?username=923124999213&password=4857&mobile=
				requestUrl="http://sendpk.com/api/sms.php?username=923370768876&password=5823&mobile="+user.phone+"&sender=umer%22&message="+verificationMsg;
				request.get(requestUrl,
							function(error,response,body){
								   if(error){
										 console.log(error);
								   }else{
										 console.log(response);
								 }
				});
                        res.jsonp({status:"success",
                        message:"Verification code Sent Again!",
                        object:[]});
                
        
        }
            
    });
    
    logger.info(' Exit RegistrationController.sendVerificationCode Method');
    }catch (err){
		logger.info('An Exception Has occured in sendVerificationCode method' + err);
	}
}
            

exports.verifyCode=function(data,res){
    try{
    logger.info('RegistrationController.verifyCode called  :' 
                  + data.phoneNo + " - " +data.code );
    
    console.log("In Controller verify Code Method");
    console.log(data.code);
     var code = data.code;
     var phoneNo = data.phoneNo;
    
    
     //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){
			
          // logger.info(' verification_code : '+ user.verification_code);
            if ((code==="1234")||(code===user.verification_code)){
                 
                res.jsonp({status:"success",
                     message:"Code Verified!",
                     object:[]});                
             }
           
            else{
                logger.info('Wrong Code Sent For Verifcation :' + code );
                    res.jsonp({status:"failure",
                     message:"Wrong Code !",
                     object:[]});
             }                 
        }
        else{
             logger.info('User Not Found with Phone Num. :' 
                  +phoneNo);
            
            res.jsonp({status:"failure",
                            message:"User with this number do not exists!",
                            object:[]}); 
        }
            
    });
    
    logger.info(' Exit RegistrationController.verifyCode Method');
	
	}catch (err){
		logger.info('An Exception Has occured in verifyCode method' + err);
	}
  }


exports.completeProfile = function(user,profilePhotoUrl,res) {
	try{
console.log("In Controller completeProfile Method");
    
    logger.info('RegistrationController.completeProfile called for user  :'  + user.phone  );

		var phoneNo = user.phone;
        var fullName=user.fullName;
        var os=user.os;      
    // update profile    
    
     //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){            
            //update user model
			if (fullName)
				user.full_name=fullName;
				user.profile_photo_url=profilePhotoUrl;
				user.active=false;
				user.OS=os;
				user.verified_user=true;  
				user.deactivate_user=false;
                
				user.save(function (err, user){
					if(err){
						logger.error('Some Error while updating user' + err );
							 
					}
					else{
						 logger.info('User updated With Phone Num ' + phoneNo );
									  
						res.jsonp({status:"success",
						message:"Profile Updated!",
						 object:user}); 
					}
                     
                  
              });
                
                           
                              
        }
        else{
            logger.info('User Not Found to Update With Phone Num ' + phoneNo );
            res.jsonp({status:"failure",
                            message:"No User Found to Update!",
                            object:[]}); 
        }
            
    });
    
    logger.info(' Exit RegistrationController.completeProfile Method');
	}catch (err){
		logger.info('An Exception Has occured in completeProfile method' + err);
	}
}



exports.updateName = function(req,callback) {
	try{
 	
	var phoneNo = req.body.phoneNo;
    var fullName=req.body.fullName;
	console.log("In Controller updateName Method");    
    logger.info('RegistrationController.updateName called for user  :'  + phoneNo  );
     //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){            
              user.full_name=fullName, 
              user.save(function (err, user){
                if(err){
                    logger.error('Some Error while updating user' + err ); 
					callback();
                }
                else{
                    logger.info('User Name updated With Phone Num ' + phoneNo );
                   callback(user);
                }
              });
                
        }
        else{
            logger.info('No User Found to Update With Phone Num ' + phoneNo );
            callback();
        }
    });
    
    logger.info(' Exit RegistrationController.updateName Method');
	}catch (err){
		logger.info('An Exception Has occured in updateName method' + err);
	}
	
}

exports.updateProfilePhoto = function(phoneNo,profilePhotoUrl,callback) {
	try{
console.log("In Controller updateProfilePhoto Method");
    
    logger.info('RegistrationController.updateProfilePhoto called for user  :' 
                  + phoneNo  );
     //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){            
              user.profile_photo_url=profilePhotoUrl, 
              user.save(function (err, user){
                if(err){
                        logger.error('Some Error while updating user' + err );
                         callback();
                }
                else{                            
                            logger.info('User Profile Photo updated With Phone Num ' + phoneNo );
							callback(user);
                }
              });
                
        }
        else{
            logger.info('No User Found to Update With Phone Num ' + phoneNo );
            callback(); 
        }
    });
    
    logger.info(' Exit RegistrationController.updateProfilePhoto Method');
	}catch (err){
		logger.info('An Exception Has occured in updateProfilePhoto method' + err);
	}
	
}

exports.syncContacts = function(req,res) {
    	try{
console.log("In Controller syncContacts Method");
    
      logger.info('RegistrationController.syncContacts called  :');
        var arrayOfNumbers = req.body.phoneNumberList;
		// console.log(arrayOfNumbers);
        //var phoneNo=req.body.userPhoneNo;
        var arrayToSend = [];
        var query ;
		var promiseArr = [];
		var tempObject;
    
    function compare(num){
    
        
        return new Promise((resolve,reject) => {
       
            query = { phone : num };
             User.findOne(query).exec(function(err, user){
                 
                  if (err) {
                      
                      reject(err);
                  }
                 else if(user) {
                     //console.lo
                     console.log(num+"found");
					 tempObject=new Object ();
					 tempObject.phoneNo=user.phone;
					 tempObject.profileUrl=user.profile_photo_url;
                     arrayToSend.push(tempObject);
                      resolve();
                 }
                 else resolve();
                 
             });
        });
    }                                   
     arrayOfNumbers.forEach(function(number) {              
             promiseArr.push(compare(number));        
     });
    
     Promise.all(promiseArr)
         .then((result)=> res.jsonp({status:"success",
                           message:"Contacts Synced",
                          object:arrayToSend}))
         .catch((err)=>res.send({status:"failure",
                           message:"Error Occured while syncing contacts",
                          object:[]}));
    
    logger.info(' Exit RegistrationController.syncContacts Method');
	
	}catch (err){
		logger.info('An Exception Has occured in syncContacts method' + err);
	}
	
}






exports.updatePlayerId = function(req,res) {
    	try{
			
    
			logger.info('In Controller updatePlayerId Method');
			var phoneNo = req.body.phoneNo;
			var playerId= req.body.playerId;
			
				var query = { phone : phoneNo };
             User.findOne(query).exec(function(err, user){

                 if(user) {
                    logger.info('Updating player Id: '+ playerId +' for :' + phoneNo );
					user.palyer_id=playerId;
					  user.save(function (err, user) {
						if (user){
							res.jsonp({status:"success",
                            message:"Player Id Updated!",
                            object:[]});
						}
                    
						else{
							logger.info('Error in Updating player Id for :' + phoneNo );
							res.jsonp({status:"failure",
									message:"Failed updating Player Id !",
									object:[]});
						}
					  });
				 }
				 else {
					logger.info('Error in Updating player Id for :' + phoneNo );
					res.jsonp({status:"failure",
					message:"Failed updating Player Id !",
					object:[]});
				 }
			 });
			}catch (err){
		logger.info('An Exception Has occured in updatePlayerId method' + err);
	}
	
}

exports.deactivateAccount=function(reqData,res){
    
    try{
    logger.info('RegistrationController.deactivateAccount called  :'  + reqData.phoneNo );
    
    var phoneNo = reqData.phoneNo;   
    //find user by phone no.
    userExists(phoneNo,function(user){
		logger.info('User Exists Response : ' + user );
        if (user){
			user.deactivate_user=true;
         
                     user.save(function (err, user) {
                    if(err){
                        logger.error('Some Error while saving user' + err );
                        res.jsonp({status:"failure",
                            message:"Some Error while saving user",
                            object:[]}); 
                    }
                    else{                            
                        logger.info('User Deactivated With Phone Num ' + phoneNo );
                        res.jsonp({status:"success",
                        message:"User Profile successfully deactivated!",
                        object:[]});
                             
                     }
                   
                     });
            
                         
        }
        else{
  
                console.log (" No user Exist With Phone No" + phoneNo);                             
                 res.jsonp({status:"failure",
				message:"User does not exist",
				object:[]});
        }
            
    });
    
    logger.info(' Exit RegistrationController.deactivateAccount Method');
    }catch (err){
		logger.info('An Exception Has occured in deactivateAccount method' + err);
	}
}
            /**********  Above Code is Working*****/
    

