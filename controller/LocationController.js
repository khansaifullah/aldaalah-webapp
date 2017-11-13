var AppController= require('../controller/AppController.js');
var ChatController = require('../controller/ChatController.js');
var NotificationController = require('../controller/PushNotificationController.js');
var User = require('../models/User.js');
var Marker = require('../models/Marker.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise; 
var geolib = require('geolib');
var multer  = require('multer');

var upload = multer({ dest: './public/images/profileImages' })
//mongoose.createConnection(db.url);


function inRadiusNotification(phoneNo,userLoc,marker){
	logger.info ('marker.loc : ' +marker.loc );
	logger.info ('userLoc : ' +userLoc );
	var query;
	var distance = geolib.getDistance(
    userLoc,
    marker.loc
	);
	logger.info ('distance: ' + distance);
	
	//Check if distance is less then defined radius
	
	if (distance<marker.radius)
	{
		var markerObj ={
				
				title:marker.title,
				description:marker.description,
				marker_photo_url:marker.marker_photo_url,
				longitude:marker.loc[0],
				latitude:marker.loc[1],				
				radius:marker.radius
				
				
		}
		//inside Radius, Send Push Notification
		logger.info ('inside Radius, Send Push Notification');
		query = { phone :phoneNo };
		User.findOne(query).exec(function(err, user){
					if (err){
						  logger.error('Some Error occured while finding user' + err );												
					}
					if (user){												  
						logger.info('User Found For Phone No: ' + phoneNo );
						logger.info('Sending Notification to player id ' + user.palyer_id );
						logger.info('marker Object : latitude = ' + markerObj.latitude + "** longitude =" + markerObj.longitude + "** radius =" + markerObj.radius);
						//logger.info('Individual Conversation msg  before Push Notification:'  );		
						NotificationController.sendNotifcationToPlayerId(user.palyer_id,markerObj,"reachedMarker");
						//msg=null;
					}
					else {
						logger.info('User not Found For Phone No: ' + phoneNo);                 												  
					}                               
				});
		
	}
	
	
}
 
function getMarkersList(callback){
	
	   
    try{
			Marker.find({}, function(err, markers) {
			if (err){
				logger.info('An Error Occured While Finding Markers '  + err);
			}			
			else{ 
				//logger.info(markers.length + ' Marker Found');
				callback(markers);				
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in getMarkersList method' + err);
	}
}
 
exports.updateUserLocation=function(reqData,res){
	try{
			var phoneNo=reqData.phoneNo;
			var longitude=reqData.longitude;
			var latitude=reqData.latitude;
			var userLoc = new Object({latitude: latitude, longitude: longitude});
			
			//Check valid Location -180 to 180
			logger.info('LocationController.updateUserLocation called  :' 
						  + phoneNo+ '**'+ longitude +'**'+ latitude);
			
			//Check if user have reached in radius of any marker set by admin
			var markersList=getMarkersList(function (markers){
				if (markers){
					logger.info('Marker Length : ' + markers.length );
					for (var i=0 ; i < markers.length; i++)
					{
						inRadiusNotification(phoneNo,userLoc, markers[i]);
						
					}
				}
				else {
					logger.info('An Error Occured While Finding Markers '  );
				}
			});
			
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
										logger.info ('  :' +user.phone);
										tempObject=new Object({
											phone:user.phone,
											full_name: user.full_name,
											profile_photo_url:user.profile_photo_url
										});
										if ((user.loc)&&(user.share_location)){
											tempObject.longitude=user.loc[0];
											tempObject.latitude=user.loc[1];
										}else{
											logger.info ('Null locations for :' +user.phone);
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

// Marker Methods
                  
exports.setMarker=function(reqData,res){
	try{
			
			var title=reqData.title;
			var description=reqData.description;
			var longitude=reqData.longitude;
			var latitude=reqData.latitude;
			var radius=reqData.radius;
			//photo
			//Check valid Location -180 to 180
			logger.info('LocationController.setMarker called  :' 
						  + title + '**'+ longitude +'**'+ latitude);
	
			var newmarker = new Marker({  
                    title: title,
                    description:description ,
					radius:radius
             });
			 newmarker.loc=[longitude,latitude];
			 
			 newmarker.save(function (err, user) {
			if(err){
				logger.error('Some Error while saving marker' + err );
				res.jsonp({status:"failure",
				message:"Some Error while saving marker",
				object:[]}); 
			}
			else{
				logger.info('Marker Created : ' + title );
				res.jsonp({status:"success",
				message:"Marker Created",
				object:[]});
				 
			 }
		   
			 });
	}catch (err){
		logger.info('An Exception Has occured in updateUserLocation method' + err);
	}
}