
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
              $group: {
				 _id:"$_conversationId",
				count: { $sum: 1 }				  
			  }                                    
          }
      ],function (err, ConversationIdsList) {
		  
		  
		  
	 
	 /*************/
	 
	  let promiseArr = [];
    
      var sendBackConversation;
    function chkIndvidualConversation(conversationId){
     
        return new Promise((resolve,reject) => {
       
	   Conversation.findOne({_id:(conversationId)})
						.exec(function(err, conversation){
							
							if (err){
								console.log ( 'An Error Occured before returning Promise' );
								reject(error);
							}
											
						
							if (conversation){
								//conversation=conversation.toJSON();
								//conversation=JSON.parse(conversation);
								//console.log ('!conversation.isGroupConversation : ' + !conversation.isGroupConversation);
								if (!conversation.isGroupConversation){
									conversation=conversation.toObject({getters: false});
									console.log ('typeof conversation : ' + typeof(conversation));
									console.log( conversation + " is indivdual Conversation");
									console.log( conversation._id + " con id is indivdual Conversation");
									sendBackConversation=conversation._id;
									//console.log ('Indivdual conversation found before resolve : ' + sendBackConversation);
									resolve();
									
								}
						
							}
					
						});				               
            
        });
    }
                           
            
    
    
     ConversationIdsList.forEach(function(conversationId) {              
             promiseArr.push(chkIndvidualConversation(conversationId));        
     });
    
     Promise.all(promiseArr)
         .then((result)=> {
				console.log ('printing before Resolve Function response : ' + result);
				callback(sendBackConversation); 
				})
         .catch(error => { logger.error ('An Error Has Occured : ' + err); });
		 
    /***********/
	
		/*  		
		console.log ('printing list :');
		  for (var k in ConversationIdsList){
			  if (ConversationIdsList[k].count === 2){
			  console.log (ConversationIdsList[k]);
			  }
		  }
		  */
		 
		 /*
		   var sendBackConversation;
		 
		  function getIndvidualConversationId(ConversationIdsList){	

			return new Promise(
				function (resolve, reject) {
																						  
				if (ConversationIdsList!==undefined){
					//console.log (ConversationIdsList.length);
					for (var i =0 ; i <ConversationIdsList.length;i++){
			 
					if (ConversationIdsList[i].count === 2){ 
					//	console.log ('In individual Conversation Check ')
					//console.log ("conversation id : "+ConversationIdsList[i]._id);
					Conversation.find({_id:(ConversationIdsList[i]._id)})
						.exec(function(err, conversation){
							if (err){
								console.log ( 'An Error Occured before returning Promise' );
								reject(error);
							}
											
						
							if (conversation){
								//conversation=conversation.toJSON();
								//conversation=JSON.parse(conversation);
								//console.log ('!conversation.isGroupConversation : ' + !conversation.isGroupConversation);
								if (!conversation.isGroupConversation){
									console.log ('typeof conversation : ' + typeof(conversation));
									console.log( conversation + " is indivdual Conversation");
									console.log( conversation._id + " con id is indivdual Conversation");
									sendBackConversation=conversation;
									//console.log ('Indivdual conversation found before resolve : ' + sendBackConversation);
									resolve(sendBackConversation);
									
								}
						
							}
					
						});
					}
					}
				}
			console.log ('printing before Resolve  in fuction : ' + sendBackConversation);
				
					});
			}
			
	
		  
		  getIndvidualConversationId(ConversationIdsList)
			.then(result => {
				console.log ('printing before Resolve Function response : ' + result);
				callback(result); 
				})
			.catch(error => { logger.error ('An Error Has Occured : ' + err); });
		 */
		 	 
         
     });

	 
	 
   
    logger.info(' Exit ChatController.chkPreviousConversation Method');
    
}
            
