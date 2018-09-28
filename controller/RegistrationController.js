
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var Friend = require('../models/Friend.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
const bcrypt = require('bcrypt');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' });
//package for making HTTP Request
var request=require("request");
var http = require("http");
// We need this to build our post string
var querystring = require('querystring');
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
                
                logger.info('User Found with Phone Num. :'+phoneNo);                
                console.log("user found with phone no "+phoneNo);
                callback (user);
            }
            else{
                
                logger.info('User Not Found with Phone Num. :'+phoneNo);
                console.log("user not found with phone no "+phoneNo);
                callback( user);
                
            }
       }
     });
    
    logger.info(' Exit UserExists Method');
	
}
           

var emailExists=function(email,callback){
    
    logger.info('emailExists Method Called');
     var query = { email : email };
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
                
                logger.info('User Found with email :'+email);                
                callback (user);
            }
            else{
                
                logger.info('User Not Found with email :'+email);
                callback( user);
                
            }
       }
     });
    
    logger.info(' Exit emailExists Method');	
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
						
						// requestUrl="http://sendpk.com/api/sms.php?username=923370768876&password=5823&mobile="+user.phone+"&sender=umer%22&message="+verificationMsg;
						// request.get(requestUrl,
						// 			function(error,response,body){
						// 				   if(error){
						// 						 console.log(error);
						// 				   }else{
						// 						 console.log(response);
						// 				 }
						// });

                        //Testing Another API 
                        // Set the headers

                        // requestUrl="http://sendpk.com/api/sms.php?username=923370768876&password=5823&mobile="+user.phone+"&sender=umer%22&message="+verificationMsg;

                            // var headers = {

                            //     'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                            //     'Content-Type':     'application/json',
                            //     'Accept':       'application/json'
                            // }

                            // // Configure the request
                            // var options = {
                            //     url: 'http://107.20.199.106/sms/1/text/single',
                            //     method: 'POST',
                            //     headers: headers,
                            //     form: {'from': 'ALDAALAH', 'to': user.phone,'text':verificationMsg}
                               
                            // }

                            // // Start the request
                            // request(options, function (error, response, body) {
                            //     if (!error ) {
                            //         // Print out the response body
                            //         console.log(body)
                            //         logger.info('Sucessful Response of SMS API : ' + body );
                            //     }
                            //     else{
                            //         logger.info('Response/Error of SMS API : ' + error );
                            //     }
                            // // })


                            // var options = {
                            //     hostname: 'http://107.20.199.106',
                            //     //port: 80,
                            //     path: '/sms/1/text/single',
                            //     method: 'POST',
                            //     headers: {
                                    
                            //     'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                            //     'Content-Type':     'application/json',
                            //     'Accept':       'application/json'
                            //     }
                            //   };
                            //   var req = http.request(options, function(res) {
                            //     console.log('Status: ' + res.statusCode);
                            //     console.log('Headers: ' + JSON.stringify(res.headers));
                            //     res.setEncoding('utf8');
                            //     res.on('data', function (body) {
                            //       console.log('Body: ' + body);
                            //     });
                            //   });
                            //   req.on('error', function(e) {
                            //     console.log('problem with request: ' + e.message);
                            //   });
                            //   // write data to request body
                            //   req.write('{"string": "Hello, World"}');
                            //   req.end();

                            

                var headers = {

                    'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                    'Content-Type':     'application/json',
                    'Accept':       'application/json'
                }

                // Configure the request
                var options = {
                    url: 'http://107.20.199.106/sms/1/text/single',
                    method: 'POST',
                    headers: headers,
                    //form: {'from': 'ALDAALAH', 'to': user.phone,'text':verificationMsg}
                    json: {
                        'from': 'ALDAALAH',
                         'to': user.phone,
                         'text':verificationMsg
                      }
                }

                // Start the request
                request(options, function (error, response, body) {
                    if (!error ) {
                        // Print out the response body
                        console.log(body)
                        logger.info('Sucessful Response of SMS API : ' + body );
                    }
                    else{
                        logger.info('Response/Error of SMS API : ' + error );
                    }
                })

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
				// requestUrl="http://sendpk.com/api/sms.php?username=923370768876&password=5823&mobile="+user.phone+"&sender=umer%22&message="+verificationMsg;
				// request.get(requestUrl,
				// 			function(error,response,body){
				// 				   if(error){
				// 						 console.log(error);
				// 				   }else{
				// 						 console.log(response);
				// 				 }
                // });
                
                

           // var post_req  = null,
           // post_data = '{"from":"ALDAALAH","to":"'+user.phone+'","text":"'+verificationMsg+'"}';
            //post_data = '"from":"ALDAALAH","to":"+923345022570","text":"dcsdfsdafsadfas"';
            
            // post_data =  querystring.stringify({"from":"ALDAALAH",
            // "to":user.phone,
            // "text":verificationMsg
            // }); 

            //   var post_options = {
            //       hostname: '107.20.199.106',
            //      // port    : '8080',
            //      path: '/sms/1/text/single',
            //       method  : 'POST',
            //       headers : {
            //           'Content-Type': 'application/x-www-form-urlencoded',
            //           'Authorization': 'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
            //           'Accept':       'application/json'
            //       }
            //   };
              
            //   post_req = http.request(post_options, function (res) {
            //       console.log('STATUS: ' + res.statusCode);
            //       console.log('HEADERS: ' + JSON.stringify(res.headers));
            //       res.setEncoding('utf8');
            //       res.on('data', function (chunk) {
            //           console.log('Response: ', chunk);
            //       });
            //   });
              
            //   post_req.on('error', function(e) {
            //       console.log('problem with request: ' + e.message);
            //   });
            //   console.log('post_data: ' + post_data);
            //   post_req.write(post_data);
         
            //   post_req.end();



                var headers = {

                    'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                    'Content-Type':     'application/json',
                    'Accept':       'application/json'
                }

                // Configure the request
                var options = {
                    url: 'http://107.20.199.106/sms/1/text/single',
                    method: 'POST',
                    headers: headers,
                    //form: {'from': 'ALDAALAH', 'to': user.phone,'text':verificationMsg}
                    json: {
                        'from': 'ALDAALAH',
                         'to': user.phone,
                         'text':verificationMsg
                      }
                }

                // Start the request
                request(options, function (error, response, body) {
                    if (!error ) {
                        // Print out the response body
                        console.log(body)
                        logger.info('Sucessful Response of SMS API : ' + body );
                    }
                    else{
                        logger.info('Response/Error of SMS API : ' + error );
                    }
                })

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
                 
                const token = user.generateAuthToken();
                res.setHeader('x-auth-token', token);
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
        var status= user.status;
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
                if (status)
                user.status=status;
                
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

exports.updateName = async function(user, name) {
	try{ 	
    return new Promise(function (resolve, reject) { 
        console.log("In Controller updateName Method");           
            if (user){ 
                logger.info('RegistrationController.updateName called for user  :'  + user.phone  );           
                user.full_name=name, 
                user.save(function (err, user){
                    if(err){
                    logger.error('Some Error while updating user name' + err ); 
                    return reject(err); 
                    }
                    else{
                    logger.info('User Name updated With Phone Num ' + user.phone );
                    resolve(user); 
                    }
                });         
            }
            else{
                logger.info('No User Found to Update ');
                resolve(); 
            }
        logger.info(' Exit RegistrationController.updateName Method');
    });
	}catch (err){
		logger.info('An Exception Has occured in updateName method' + err);
	}	
}

exports.updateStatus = async function(user, status) {
	try{ 	
    return new Promise(function (resolve, reject) { 
        console.log("In Controller updateStatus Method");           
            if (user){ 
                logger.info('RegistrationController.updateStatus called for user  :'  + user.phone  );           
                user.status=status, 
                user.save(function (err, user){
                    if(err){
                    logger.error('Some Error while updating user status' + err ); 
                    return reject(err); 
                    }
                    else{
                    logger.info('User Name updated With Phone Num ' + user.phone );
                    resolve(user); 
                    }
                });         
            }
            else{
                logger.info('No User Found to Update ');
                resolve(); 
            }
        logger.info(' Exit RegistrationController.updateStatus Method');
    });
	}catch (err){
		logger.info('An Exception Has occured in updateStatus method' + err);
	}	
}

exports.updateProfilePhoto = async function(user, profilePhotoUrl) {
	try{ 	
    return new Promise(function (resolve, reject) { 
        console.log("In Controller updateProfilePhoto Method");           
            if (user){ 
                logger.info('RegistrationController.updateProfilePhoto called for user  :'  + user.phone  );           
                user.profile_photo_url=profilePhotoUrl,  
                user.save(function (err, user){
                    if(err){
                    logger.error('Some Error while updating user profilePhotoUrl' + err ); 
                    return reject(err); 
                    }
                    else{
                    logger.info('User Name updated With Phone Num ' + user.phone );
                    resolve(user); 
                    }
                });         
            }
            else{
                logger.info('No User Found to Update ');
                resolve(); 
            }
        logger.info(' Exit RegistrationController.updateProfilePhoto Method');
    });
	}catch (err){
		logger.info('An Exception Has occured in updateProfilePhoto method' + err);
	}	
}


exports.syncContacts = function(req, res, me) {
    	try{
        console.log("In Controller syncContacts Method");

        logger.info('RegistrationController.syncContacts called  :');
        var arrayOfFriends = req.body.friendList;
		// console.log(arrayOfNumbers);
        var phoneNo=req.body.userPhoneNo;
        var arrayToSend = [];
        var query ;
		var promiseArr = [];
		var tempObject;
    
    function compare(friend){
        logger.info ("friend Name : "+ friend.friendName);
        logger.info ("friend Phone : "+ friend.phone);
        return new Promise((resolve,reject) => {
       
            query = { phone : friend.phone };
             User.findOne(query).exec(function(err, user){
                 
                  if (err) {
                      
                      reject(err);
                  }
                 else if(user) {
                     console.log("user found with num "+ user.phone);
					 tempObject=new Object ();
					 tempObject.phoneNo=user.phone;
                     tempObject.profileUrl=user.profile_photo_url;
                     arrayToSend.push(tempObject);
                     var query = {_userId:me._id, _friendId:user._id },
                        update = {_userId:me._id, _friendId:user._id, friendName:friend.friendName },
                        options = { upsert: true, new: true, setDefaultsOnInsert: true };

                     // Find the document
                     Friend.findOneAndUpdate(query, update, options, function(error, result) {
                        if (error) {
                            logger.info('Error Occured while saving Friend :  '+ error);
                            reject();
                        }else{
                            logger.info('Friend Id : ' + result._id);
                            resolve();
                        } 
                    });   
                   
                 }
                 else resolve();
                 
             });
        });
    }                
                   
    if (arrayOfFriends){

        arrayOfFriends.forEach(function(friend) {              
            promiseArr.push(compare(friend));        
    });
   
    Promise.all(promiseArr)
        .then((result)=> res.jsonp({status:"success",
                          message:"Contacts Synced",
                         object:arrayToSend}))
        .catch((err)=>res.send({status:"failure",
                          message:"Error Occured while syncing contacts",
                         object:[]}));
    }else {
        res.jsonp({status:"failure",
					message:"No Contact Foound In Friend List",
					object:[]});
    }
 
    
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
                    user.deactivate_user=false;
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

// Set Username & password for Web User (First Time)
exports.setUsernamePassword = async function(req, res) {
	try{ 	
  
        var phoneNo = req.body.phone;
        var email = req.body.email; 
        var password = req.body.password;
        var gender = req.body.gender;
        var dob = req.body.dob;
        var city = req.body.city;
        var country = req.body.country;
        
            //generate a code and set to user.verification_code
        var code=randomize('0', 4);
        var verificationMsg="Verification code for Aldaalah Application : " + code;
        // var code  = req.body.code; 
        //find user by phone no.
        userExists(phoneNo, async function(user){
            console.log("In Controller setUsernamePassword Method");           
            if (user){ 
               
                logger.info('RegistrationController.setUsernamePassword called for user  :'  + user.phone  );    
                emailExists(email, async function(userWithEmail){

                    if (userWithEmail){

                        res.jsonp({status:"failure",
                        message:" User exist with same Email Address, please try an other. ",
                        object:[]});

                    }else {

                        const salt = await bcrypt.genSalt(10);
                        user.email=email, 
                        user.password=await bcrypt.hash(password, salt);
                        user.verification_code=code;
                        user.gender=gender;
                        user.city=city;
                        user.country=country;
                        user.dob=dob;
                        user.save(function (err, user){
                            if(err){
                            logger.error('Some Error while updating user status' + err ); 
                            res.jsonp({status:"failure",
                            message:" Unable to set Email or Password.",
                            object:[]});
                            }
                            else{

                            logger.info('User Name updated With Phone Num ' + user.phone );
                            res.jsonp({status:"success",
                            message:"Email and Password updated successfully.",
                            object: user});
                        
                            }
                        });

                        //sending verification Code 
                        var headers = {

                            'Authorization':       'Basic ZmFsY29uLmV5ZTowMzM1NDc3OTU0NA==',
                            'Content-Type':     'application/json',
                            'Accept':       'application/json'
                        }

                        // Configure the request
                        var options = {
                            url: 'http://107.20.199.106/sms/1/text/single',
                            method: 'POST',
                            headers: headers,
                            //form: {'from': 'ALDAALAH', 'to': user.phone,'text':verificationMsg}
                            json: {
                                'from': 'ALDAALAH',
                                'to': user.phone,
                                'text':verificationMsg
                            }
                        }

                        // Start the request
                        request(options, async function (error, response, body) {
                            if (!error ) {
                                // Print out the response body
                                console.log(body)
                                logger.info('Sucessful Response of SMS API : ' + body );
                        
                            }
                            else{
                                logger.info('Response/Error of SMS API : ' + error );
                            }
                        });
                    }
                        

                });                    
                       
            }else{
                logger.info('No User Found to Update ');
                res.jsonp({status:"failure",
                message:"No user Exist with provided Phone Num.",
                object:[]});
            }
        });
        logger.info(' Exit RegistrationController.setUsernamePassword Method');

	}catch (err){
		logger.info('An Exception Has occured in setUsernamePassword method' + err);
	}	
}
            /**********  Above Code is Working*****/
    

