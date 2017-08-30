
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
   





/*********************************/




exports.chkPreviousIndividualConversation=function(fromMobileNo,toMobileNo,callback){
    
         //Returns Conversation id if exists
    
   // console.log("In Chat Controller chkPreviousConversation Method");
    logger.info('ChatController.chkPreviousConversation called  : ' 
                  + toMobileNo + "-"  +fromMobileNo);
    
	
      ConversationUser.aggregate([
          {
              $match:{$or: [{ _userMobile: toMobileNo }, { _userMobile: fromMobileNo }]}
          },
          {
              $group: {_id:"$_conversationId" }                                    
          }
      ],function (err, ConversationUserList) {
		   var sendBackConversation;
		 
		  function getIndvidualConversationId(ConversationUserList){	

			return new Promise(
				function (resolve, reject) {
							
							
								  
				if (ConversationUserList!==undefined){
					console.log (ConversationUserList.length);
					for (var i =0 ; i <ConversationUserList.length;i++){
			 
					console.log ("conversation user : "+ConversationUserList[i]._id);
					Conversation.find({_id:(ConversationUserList[i]._id)})
					.exec(function(err, Conversation){
						if (err){
							reject(error);
						}
							            
				
					if (Conversation){
						if (!Conversation.isGroupConversation){
							//console.log( Conversation+ " is indivdual Conversation");
							console.log( Conversation._id+ " is indivdual Conversation");
							sendBackConversation=Conversation;
						}
					//sendBackConversation.add(Conversation);
					}
                
				});
             
					}
			}
			console.log ('printing before Resolve' + sendBackConversation);
				resolve(sendBackConversation);
					});
			}
		  
		  getIndvidualConversationId(ConversationUserList)
			.then(result => {
				console.log ('printing before Resolve' + result);
				callback(result); b 
				})
			.catch(error => { logger.info ('An Error Has Occured' + err); });
		 
         
     });

   
    logger.info(' Exit ChatController.chkPreviousConversation Method');
    
}
            
