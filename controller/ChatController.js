
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var db = require('../config/db');
var ConversationMessages = require('../models/ConversationMessages.js');
var Conversation = require('../models/Conversation.js');ConversationUser
var ConversationUser = require('../models/ConversationUser.js');
var logger = require('../config/lib/logger.js');
require('datejs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
ObjectId = require('mongodb').ObjectID;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' })
mongoose.createConnection(db.url);

exports.userExists =function(phoneNo,callback){
	
	try{
    
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
	}catch(err){
		
	}
}
   





/*********************************/




exports.chkPreviousIndividualConversation=function(fromMobileNo,toMobileNo,callback){
    
         //Returns Conversation id if exists else undefined
    logger.info('ChatController.chkPreviousConversation called - toMobileNo : ' 
                  + toMobileNo + "- fromMobileNo :"  +fromMobileNo);
    
	
      ConversationUser.aggregate([
          {
              $match:{$or: [{ _userMobile: toMobileNo }, { _userMobile: fromMobileNo }]}
          },
          {
              $group: {
				 _id:"$_conversationId",
				count: { $sum: 1 }				  
			  }                                    
          }
      ],function (err, ConversationIdsList) {
	 
	  let promiseArr = [];
      var sendBackConversation;
 
 function chkIndvidualConversation(conversation){
     
        return new Promise((resolve,reject) => {
       
	   if (conversation.count===2){
				Conversation.findOne({_id:(conversation._id)})
						.exec(function(err, conversation){
							
							if (err){
								console.log ( 'An Error Occured before returning Promise' );
								reject(error);
							}																	
							if (conversation){
								if (!conversation.isGroupConversation){
									conversation=conversation.toObject({getters: false});
									//console.log ('typeof conversation : ' + typeof(conversation));
									logger.info( conversation._id + " - indivdual Conversation found")
									//console.log( conversation + " is indivdual Conversation");
									//console.log( conversation._id + " con id is indivdual Conversation");
									sendBackConversation=conversation._id;
									resolve();
									
								}
						
							}
					
						});
		}	
		else{
			resolve();
		} 
					
					
            
        });
    }
                             
     ConversationIdsList.forEach(function(conversation) { 
//			console.log ("*********" );
	//		console.log (" ConversationIdsList object id : "+conversationId._id );
		//	console.log (" ConversationIdsList object count : "+conversationId.count );			
             promiseArr.push(chkIndvidualConversation(conversation));        
     });
    
     Promise.all(promiseArr)
         .then((result)=> {
				console.log ('printing before Resolve Function response : ' + result);
				callback(sendBackConversation); 
				})
         .catch(error => { logger.error ('An Error Has Occured : ' + err); });
		 
		          
     });	 	   
    logger.info(' Exit ChatController.chkPreviousConversation Method');    
}



//Create User Groups
exports.createGroup=function(groupData,profilePhotoUrl,res){
    try {
	//var groupObj=JSON.parse(groupData);
	var groupName=groupData.groupName;
	var adminPhone=groupData.adminPhone;
	var obj=JSON.parse(groupData.groupMembersList);
	var conversationUsers=obj.values;

	var conversationId; 
	var newConversationUser;
	
	logger.info('In ChatController.createGroup \n Group Data : ' +groupName + adminPhone + conversationUsers  )
	// Creating New Conversation and Adding Conversation Users	
	if(conversationUsers!==undefined||conversationUsers!==null){
					var newconversation= new Conversation({
						conversationName:groupName,
						adminMobile:adminPhone,
						isGroupConversation:true,
						conversationImageUrl:profilePhotoUrl
					});
                     newconversation.save(function (err, conversation) {
                         if (err) {
							 logger.error('Error Occured while Saving new conversation :'+ err);
							res.jsonp({status:"failure",
							message:"An Error Occured while Creating Group",
							object:[]});
						 }
						if (conversation){
							conversationId=conversation._id;
							logger.info ('Creating Conversation Users against conversation id : '+conversation._id );
				let promiseArr = [];
				
				function createConversationUser(userMobile){	
					return new Promise((resolve,reject) => {
					logger.info ('Creating Conversation User for Phone No' +  userMobile );
											newConversationUser= new ConversationUser({                                          
											_conversationId: conversationId,
											_userMobile: userMobile       
															  });
															
										newConversationUser.save(function (err, conversationUser) {
											 if (err){
												 logger.error('Error Occured while Saving new newConversationUser 1 :'+ err);
												 reject(err);
											 } 
											 if (conversationUser){
												 logger.info ('Conversation User Created for Phone No' +  userMobile );
											 resolve();
											 }
											});
					});
				}                                   
				 conversationUsers.forEach(function(userMobile) {              
						 promiseArr.push(createConversationUser(userMobile));        
				 });
				
				 Promise.all(promiseArr)
					 .then((result)=> res.jsonp({status:"success",
										message:"Group Created",
										object:conversation}))
					 .catch((err)=>res.send({status:"failure",
									   message:"Error Occured while creating Group" + err,
									  object:[]}));
										  
										
							

						}
					
					//logger.info ('Sending room Id To client : ' + conversationId );					
                });
                   
}
	 
    logger.info(' Exit ChatController.createGroup Method');    
	}catch  (err){
		logger.info ('An Exception occured ChatController.createGroup ' + err);
	}
	
}



														/*****************************/
	

            
