var User = require('../models/User.js');
var Marker = require('../models/Marker.js');
var MarkerCategory = require('../models/MarkerCategory.js');
var Country = require('../models/Country.js');
var Wallpaper = require('../models/Wallpaper.js');
var Attachment = require('../models/Attachment.js');
var Friend = require('../models/Friend.js');
var ConversationMessages = require('../models/ConversationMessages.js');
var Conversation = require('../models/Conversation.js');
var ConversationUser = require('../models/ConversationUser.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');

var NotificationController = require('../controller/PushNotificationController.js');
var ChatController = require('../controller/ChatController');

require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
//mongoose.createConnection(db.url);

//Get the default connection
//var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));



function notifyAllGroupMembers(conversationId, notificationObj, excludedMember, notificationTitle){

	//Sending update group Notifcation
	ChatController.findConversationMembers(conversationId, function(members){
		if (members){
				logger.info ('findConversationMembers Response, Members List Size : ' + members.length);

			
				//Notifying All Group Members
				for (var i=0; i < members.length ; i++){
					var memberPhoneNo=members[i]._userMobile;
					if (memberPhoneNo!==excludedMember){
						
						
						//Sending Push Notiifcation To Group Members								
						logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  memberPhoneNo  );
						//var phoneNo=members[i]._userMobile;
						var query = { phone : memberPhoneNo };
						
						User.findOne(query).exec(function(err, user){
							if (err){
							 logger.error('Some Error occured while finding user' + err );
							 }
							if (user){
							logger.info('User Found For Phone No: ' + user.phone );
							logger.info('Sending Notification to player id ' + user.palyer_id );
							if (!user.deactivate_user){
							NotificationController.sendNotifcationToPlayerId(user.palyer_id,notificationObj,notificationTitle);	
							}else{
								logger.info('Can not send notification to deactivated user :  ' +memberPhoneNo  );    
								
							}
							
							}
							else {
							 logger.info('User not Found For Phone No: ' + memberPhoneNo );                 
							}                               
						});
					}								
				}
		}
		});
}

exports.findAllUser=function(callback){
     
    try{
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
		}catch (err){
		logger.info('An Exception Has occured in findAllUser method' + err);
	}
}



exports.findAllCountries=function(callback){
    
    try{
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
		}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}


exports.findAllPhoneNo=function(callback){
     try{
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
	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}

exports.userExists=function(phoneNo,callback){
	try{
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
	 	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}

exports.findAllPhoneNo=function(callback){
     try{
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
	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}



exports.findAllMarkers=function(callback){
     
    try{
			Marker.find({}, function(err, markers) {
			if (err){
				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(markers.length + ' Markers Found');
				callback(markers);
			
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in findAllMarkers method' + err);
	}
}

exports.findAllMarkerCategories=function(callback){
     
    try{
		MarkerCategory.find({}, function(err, markerCategory) {
			if (err){
				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(markerCategory.length + ' MarkerCategory Found');
				callback(markerCategory);
			
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in MarkerCategory method' + err);
	}
}


exports.addWallpaper = async function(title, photoUrl, res) {
	try{ 	
  
        console.log("In Controller addWallpaper Method");           
			 
		var newWallpaper = new Wallpaper({  

			title: title,
			photoUrl: photoUrl
			 });
			 newWallpaper.save(function (err, wallpaper) {
			if(err){
				logger.error('Some Error while saving Wallpaper' + err );
				res.jsonp({status:"failure",
				message:"Error Uploading Wallpaper",
				object:[]});
			}
			else{
				logger.info('Wallpaper saved succuessfully');
				res.jsonp({status:"success",
				message:"Wallpaper Uploaded Succcesfully",
				object:wallpaper});
			}
		});
            
        logger.info(' Exit AppController.addWallpaper Method');
  
	}catch (err){
		logger.info('An Exception Has occured in addWallpaper method' + err);
	}	
}

exports.findAllWallpapers=function(callback){
    
    try{
    Wallpaper.find({}, function(err, wallpapers) {
		if (err){
			res.status(400).send({status:"failure",
									message:err,
									object:[]
		});
		}else{
			callback(wallpapers);
		// process.exit();
		} 
    });
	}catch (err){
		logger.info('An Exception Has occured in findAllWallpapers method' + err);
	}
}


exports.addAttachment = async function(req, fileUrl, res) {
	try{ 	
  
		console.log("In Controller addAttachment Method");     
		      
		console.log("req.body.type : " +  req.body.type); 		
		console.log("req.body.title : " +  req.body.title);   
		console.log("fileUrl : " +  fileUrl); 
		console.log("req.body.conversationId : " +  req.body.conversationId); 
		// console.log("req.body.toUserId : " + req.body.toUserId); 
		console.log("req.body.fromUserPhone : " +  req.body.fromUserPhone); 
		console.log("req.body.toUserPhone  : " +  req.body.toUserPhone ); 
  
		var messageObj;
		var excludedMember;

		var newAttachment = new Attachment({  
			attachmentType: req.body.type ,
			attachmentTitle: req.body.title ,
			attachmentUrl: fileUrl,
			_conversationId: req.body.conversationId ,
			// _attachmentToUserId: req.body.toUserId ,
			// _attachmentFromUserId: req.body.fromUserId ,
			_attachmentFromMobile: req.body.fromUserPhone ,
			_attachmentToMobile: req.body.toUserPhone ,
			attachmentDeliverStatus: false,
			attachmentGroupId:req.body.attachmentGroupId
			
			 });
			
			 newAttachment.save(function (err, attachment) {
			if(err){
				logger.error('Some Error while saving Attachment' + err );
			
				//Send Failure Push Notification to User Who Sent
				var query = { phone : req.body.fromUserPhone };
				User.findOne(query).exec(function(errUser, user){
				   if (errUser){
					logger.error('Error Occured Wile Finding User' + errUser );
			
				   }else{
					var errorMessageObj={message:"Attachment Upload Failed."};   
					NotificationController.sendNotifcationToPlayerId(user.palyer_id,errorMessageObj,"attachmentUploadFailed");
				   }
				});
			}
			else{
				logger.info('Attachment saved succuessfully');

				//Send New Photo Upload Notification to Receiver
			
				
				var convQuery = { _id : req.body.conversationId };
				Conversation.findOne(convQuery).exec(function(err, conversation){
				   if (err){
				   }else {
					   if (conversation){
						if (conversation.isGroupConversation){
							logger.info("Is A group Conversation.");	
							// send Push Notification to all members except Sender
							excludedMember=req.body.fromUserPhone ;
							notifyAllGroupMembers(conversation._id,messageObj,excludedMember, "attachmentReceived");
							

						}else{

							// send Push Notification to Single Member
							logger.info("Is not a group Conversation.");
							
							var query = { phone : req.body.fromUserPhone };
							User.findOne(query).exec(function(err, user){
							if (user){
								logger.info("Sending Push Notification to user.palyer_id :"+ user.palyer_id);
								NotificationController.sendNotifcationToPlayerId(user.palyer_id,messageObj,"attachmentReceived");			
			
							}else {
								logger.info("Unable to Send Push Notification ");
							}
							});
						}
					   }else {
						logger.info("No Conversation Found With conv Id:  " +req.body.conversationId);
					   }
					  
					  
				   }
				});

			}
		});
            
        logger.info(' Exit AppController.addAttachment Method');
  
	}catch (err){
		logger.info('An Exception Has occured in addAttachment method' + err);
	}	
}

exports.findFriendsByPhoneNum=function(phoneNo, callback){
    
    try{

		var query = { phone : phoneNo };
		 User.findOne(query).exec(function(err, user){
			if (user){

				Friend.find({_userId:user._id}, function(err, friends) {
					if (err){
						res.status(400).send({status:"failure",
												message:err,
												object:[]
					});
					}else{
						callback(friends);
					
					} 
					});
			}else {
				logger.info('User not found');
				callback();
			}

		});
	
	
	}catch (err){
		logger.info('An Exception Has occured in findAllWallpapers method' + err);
	}
}