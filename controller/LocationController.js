var AppController= require('../controller/AppController.js');
var ChatController = require('../controller/ChatController.js');
var User = require('../models/User.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise; 
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' })
//mongoose.createConnection(db.url);

                             
exports.updateUserLocation=function(reqData,res){
	try{
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
							logger.info('User Location With Phone Num ' + phoneNo );
										  
							res.jsonp({status:"success",
							message:"Location Updated!",
							 object:[]}); 
							 }
							 
						  
					  });
						
					logger.info('location : '+user.loc );
				}
				else{
					res.jsonp({status:"failure",
					message:"Failed To update Location!",
					object:[]}); 
				}
				
			});
	}catch (err){
		logger.info('An Exception Has occured in updateUserLocation method' + err);
	}
}


                        
exports.getUserLocation=function(phoneNo,callback){
    
	try{
		logger.info('LocationController.getUserLocation called for  :' 
					  + phoneNo);
		AppController.userExists(phoneNo, function(user){
		if (user){
				callback(user.loc);                
				logger.info('location : '+user.loc );
			}
			else{
				callback();
				//res.jsonp({status:"failure",
			//    message:"Failed To Find User!",
			  //  object:[]}); 
			}
			
		});
	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}

exports.getGroupUserLocations=function(conversationId,res){
	try{
		var groupUsersList=[];
		logger.info ('In LocationController.getGroupUserLocations ');
		ChatController.findConversationMembers(conversationId, function(members){
		if (members){
				let promiseArr = [];
				var tempObject;
			
				function addUser(num){
				
					
					return new Promise((resolve,reject) => {
						   AppController.userExists(num , function(user){
									if (user){
										logger.info ('Adding User in list :' +user.phone);
										tempObject=new Object({
											phone:user.phone,
											full_name: user.full_name,
											profile_photo_url:user.profile_photo_url
										});
										if ((user.loc)&&(user.share_location)){
											tempObject.longitude=user.loc[0];
											tempObject.latitude=user.loc[1];
										}else{
											tempObject.longitude=null;
											tempObject.latitude=null;
										}
										groupUsersList.push(tempObject); 
										resolve();										
										}
										else{
										logger.info ('Error Finding User with Mobile No : ' + num);
										  reject();
										}									
										});

					});
				}                                   
				for (var i=0; i < members.length ; i++){
					 promiseArr.push(addUser(members[i]._userMobile));																			
					} 
			
				 Promise.all(promiseArr)
					 .then((result)=> res.jsonp({status:"success",
									   message:"Group Users Locations",
									  object:[{"groupUsersList":groupUsersList}]}))
					 .catch((err)=>res.send({status:"failure",
									   message:"Error Occured While finding locations",
									  object:[{"groupUsersList":[]}]}));
		}	else {
				res.jsonp({status:"failure",
				message:"Error Occured While finding locations!",
				object:[{"groupUsersList":[]}]});
								}
									
							});						
		}catch (err){
		logger.info('An Exception Has occured in getGruoupUserLocations method' + err);
	}
	
}

                         
exports.updateShareLocationFlag=function(reqData,res){
	try{
			var phoneNo=reqData.phoneNo;
			var shareLocationFlag=reqData.shareLocationFlag;
						
			logger.info('LocationController.updateShareLocationFlag called  :' 
						  + phoneNo+ '**'+ shareLocationFlag );
		
			AppController.userExists(phoneNo, function(user){
				if (user){
					user.share_location=shareLocationFlag;
					user.save(function (err, user){
						if(err){
								logger.error('Some Error while updating user' + err );
								 
							}
						else{
							logger.info('User Location With Phone Num ' + phoneNo );
										  
							res.jsonp({status:"success",
							message:"Share Location Flag Updated!",
							 object:[]}); 
							 }
							 
						  
					  });
						
					logger.info(phoneNo + 'location flag : '+user.share_location );
				}
				else{
					res.jsonp({status:"failure",
					message:"Failed To update Share Location Flag !",
					object:[]}); 
				}
				
			});
	}catch (err){
		logger.info('An Exception Has occured in updateShareLocationFlag method' + err);
	}
}