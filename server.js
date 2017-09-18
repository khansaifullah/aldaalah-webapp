var app = require('express')();
var http = require('http').Server(app);
 require('./routes/routes.js')(app);
 var db = require('./config/db');
 require('datejs');
var io = require('socket.io')(http);
var HashMap = require('hashmap');
var User = require('./models/User.js');
var ChatController = require('./controller/ChatController.js');
var NotificationController = require('./controller/PushNotificationController.js');
var ConversationMessages = require('./models/ConversationMessages.js');
var Conversation = require('./models/Conversation.js');ConversationUser
var ConversationUser = require('./models/ConversationUser.js');
 var logger = require('./config/lib/logger.js');
 var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

//mongoose.createConnection(db.url);
mongoose.connect(db.url);

// Heroku assigns a port if port = process.env.PORT  
var port = process.env.PORT || 3000;


// set the view engine to ejs
app.set('view engine', 'ejs');

http.listen(port, function(){
  console.log('listening on *:'+port);
});


var rooms = [];
var userMobileList = [];
var userHashMaps = new HashMap();

// Connection Event of SocketIO
io.sockets.on('connection', function(socket) {	    
    console.log ("Socket Connected with id :"+socket.id);
      
	// to add user mobile no. and socketID in hashmap
    socket.on('onConnect', function (phoneNo) {
		   try{
		   //removing spaces bw phone no if any
			 phoneNo = phoneNo.replace(/ +/g, "");
			 logger.info('onConnect Event  Called for Phone Num:' + phoneNo);
			 userHashMaps.set(phoneNo,socket.id);
			 socket.phoneNo=phoneNo;
			 logger.info("Users on socket " + userHashMaps.count());				  
			 logger.info(' Exit onConnect Event'); 
			} catch (err){
			logger.info('An Exception Has occured in onConnect event ' + err);
		}
		 
	}); //end of onConnect Event
                  
	//To verify If user is registerd on app or not
    socket.on('verifyUser', function (phoneNo, callback) {
		   try{
				//removing spaces bw phone no if any
				phoneNo = phoneNo.replace(/ +/g, "");
				logger.info('verifyUser Event  Called for Phone Num:' + phoneNo);
			   
				var query = { phone : phoneNo };
				User.findOne(query).exec(function(err, user){
					  if (err){
						  logger.error('Some Error occured while finding user' + err );
						  callback(false);
					  }
					  if (user){
						  logger.info('User Found For Phone No: ' + phoneNo );
						  userHashMaps.set(phoneNo,socket.id);
						  socket.phoneNo=phoneNo;                     
						  callback(true);
						  
					  }
					  else {
						  logger.info('User not Found For Phone No: ' + phoneNo );                 
						  callback(false);
					  }					  
				});
				logger.info(' Exit verifyUser Event'); 
		      } catch (err){
			logger.info('An Exception Has occured in verifyUser event' + err);
		}
	});  //end of verifyUser Event
    
    
    //Creating room event called when individual chat is initiated
	socket.on('createRoom', function ( userMobileNumberFrom, userMobileNumberTo,callback) {      
	  try{
		 //removing spaces bw phone no if any
		userMobileNumberFrom = userMobileNumberFrom.replace(/ +/g, "");
		userMobileNumberTo = userMobileNumberTo.replace(/ +/g, "");
		 
		logger.info('createRoom Event  Called for userMobileNumberFrom : '+userMobileNumberFrom + ' & userMobileNumberTo ' + userMobileNumberTo);
		var newconversation;
		var conversationId;
		// check if conversation between These Two users ever occured before, send conversationId / roomId in response
         
        ChatController.chkPreviousIndividualConversation(userMobileNumberFrom,userMobileNumberTo,function(data){
          
            logger.info ("chkPreviousIndividualConversation response :"+data);
            if (data==null||data===undefined)
                {
                
					newconversation= new Conversation();
					newconversation.save(function (err, conversation) {
                         if (err) logger.error('Error Occured while Saving new conversation :'+ err);
                    if (conversation){
						 logger.info ('conversation created for id :'+conversation._id );
						conversationId=conversation._id;
						logger.info ('Creating Conversation Users against conversation id : '+conversation._id );
                    var newConversationUser= new ConversationUser({                                          
                        _conversationId: conversationId, 
                        _userMobile: userMobileNumberFrom  
                        });
                    
					newConversationUser.save(function (err, conversationUser) {
                         if (err) logger.error('Error Occured while Saving new newConversationUser 1 :'+ err);
						});
              
                     newConversationUser= new ConversationUser({                                          
                        _conversationId: conversationId, 
                        _userMobile: userMobileNumberTo   
                            });
                    
					newConversationUser.save(function (err, conversationUser) {
                         if (err) logger.error('Error Occured while Saving new newConversationUser 2:'+ err);
					});
					}
				
				
				 socket.room = conversationId;
				 socket.join(conversationId);
				 logger.info ('Sending TO Client : '+ userMobileNumberFrom );
				 logger.info (' Emiting room Id :' + conversationId );
				 socket.emit('roomId',conversationId);		
                });
                    
              
                } else {
				logger.info ('Previous Conversation Id Received :' + data );               
				conversationId=data;				
                socket.room = conversationId;
				socket.join(conversationId);
				//logger.info ('Sending room Id To client : ' + conversationId );
				logger.info ('Sending room Id ' + conversationId  + ' TO Client : '+ userMobileNumberFrom );				 
				socket.emit('roomId',conversationId);
				 
				 //send an invitation
				 var socketid= userHashMaps.get (userMobileNumberTo);
				 logger.info('sending a notification to socket: '+ socketid);
				  	var conversationObj ={
						fromPhoneNo:userMobileNumberFrom,	
						conversationId:conversationId, 
						isGroupConversation:false
				 }
				 if(userMobileNumberTo){
					 if (io.sockets.connected[socketid]) {						
						logger.info( socketid + ' is in connected Sockets List ');
						io.sockets.connected[socketid].emit('conversationRequest', conversationObj);
					 }							
						logger.info('Sending Onesignal Notifcation to '+ userMobileNumberTo );								  
						var query = { phone :userMobileNumberTo };
						User.findOne(query).exec(function(err, user){
						if (err){
						 logger.error('Some Error occured while finding user' + err );
						 }
						if (user){
						logger.info('User Found For Phone No: ' + userMobileNumberTo );
						logger.info('Sending Notification to player id ' + user.palyer_id );
						NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"conversationRequest");
						}
						else {
						 logger.info('User not Found For Phone No: ' + userMobileNumberTo );                 
						}                               
					});
				}
            }
        });
    
      } catch (err){
			logger.info('An Exception Has occured in createRoom event' + err);
		}
      logger.info(' Exit createRoom Event'); 
	  
	  
	}); //end of createRoom Event
   
    
       //Swithing Room 
	socket.on('joinRoom', function (conversationId) {
		try{
		   logger.info('joinRoom Event  Called for room id :' + conversationId);
		//Joining New Room
		  rooms.push(conversationId);
		  socket.room = conversationId;
		  socket.join(conversationId);
		  socket.emit('roomId',conversationId);          
		  logger.info(' Exit joinRoom Event'); 
		}catch(err){
			  logger.info('An Exception Has occured in joinRoom event ' + err);		  
		}
	}); //end of joinRoom Event
    
	// leave Room
	socket.on('leaveRoom', function (conversationId) {
		try{
			logger.info('leaveRoom Event  Called for room id :' + conversationId);     
			//Leaving the socket's current room
			socket.room=null;
			socket.leave(socket.room);
			socket.emit('roomId',null);
			logger.info(' Exit leaveRoom Event'); 
		}catch(err) {
			  logger.info('An Exception Has occured in leaveRoom event' + err);		  
		}
	}); //end of leaveRoom Event
  
    socket.on('groupRequest', function (conversationId) {
		try {
			logger.info('groupRequest Event  Called for conversation id :' + conversationId);
			var socketid;
			var conversation;
			ChatController.findConversation (conversationId , function(con){
					
					if (con){
						logger.info ('Conversation Found for Id  : '+ conversationId);
						conversation=con;
						
						ChatController.findConversationMembers(conversationId, function(members){
						logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
							var conversationObj ={
									//fromPhoneNo:userMobileNumberFrom,	
									conversationId:conversationId, 
									isGroupConversation:con.isGroupConversation,
									adminMobile:con.adminMobile,
									photoUrl:con.conversationImageUrl,
									conversationName:con.conversationName
									}
									
									//Notifying All Group Members
							for (var i=0; i < members.length ; i++){
								var phoneNo=members[i]._userMobile;
								logger.info('Getting Socket Id against Phone No :' +phoneNo)
								socketid= userHashMaps.get (phoneNo);
								
								//Emiting on socket
								logger.info('Emiting groupConversationRequest to socket: '+ socketid);									 
								if (io.sockets.connected[socketid]) {
									logger.info( socketid + ' is in connected Sockets List ');
										io.sockets.connected[socketid].emit('groupConversationRequest', conversationObj);																							
								} 
								
								//Sending Push Notiifcation To Group Members								
								logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
								//var phoneNo=members[i]._userMobile;
								var query = { phone : phoneNo };
								User.findOne(query).exec(function(err, user){
									if (err){
									 logger.error('Some Error occured while finding user' + err );
									 }
									if (user){
									logger.info('User Found For Phone No: ' + phoneNo );
									logger.info('Sending Notification to player id ' + user.palyer_id );
									NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupConversationRequest");
									}
									else {
									 logger.info('User not Found For Phone No: ' + phoneNo );                 
									}                               
								});								
							}
							
						});
					}
					if (con==null){
						logger.info ('Conversation For conversationId : '+ conversationId + 'is null');
						
					}
					
				});
				if (conversation!==null && conversation !== undefined ){
					logger.info ('Conversation Not Found');
					
				}				
		} catch (err){
			logger.info('An Exception Has occured in groupRequest event ' + err);
		}		
	
	});  //end of groupRequest Event
    
    socket.on('sendMessage', function (data) {
		try {
			logger.info('Data Object : '+data);
			data=JSON.parse(data);
			logger.info("listening sendMessage event on server : \n "+data.messageText +"**"+  data.messageType +"**"+ data._conversationId + "**"+data._messageFromMobile+"**"+data._messageToMobile);
			var conversationMessage = new ConversationMessages();
			conversationMessage.messageType = data.messageType;
			conversationMessage.messageText = data.messageText;
			conversationMessage._conversationId = data._conversationId;
			conversationMessage._messageToMobile = data._messageToMobile;
			conversationMessage._messageFromMobile = data._messageFromMobile;
			conversationMessage.save(function (err, conMes) {
				if (err){
					logger.error('Eror Saving Conversation message' +err);
				}			
			});
			logger.info('Conversat create at :' + conversationMessage.createdAt);
			var msg ={
			 messageType:data.messageType,
			 messageText:data.messageText,
			 _conversationId:data._conversationId,
			 _messageToMobile:data._messageToMobile,
			 _messageFromMobile:data._messageFromMobile,
			 createdAt:conversationMessage.createdAt,
			 updatedAt:conversationMessage.updatedAt
			}
	 
			//check if room disconnected join again 
			var conversationId=data._conversationId;
			if (!(socket.room)){
			socket.room = conversationId;
			socket.join(conversationId);
			}
			
			if (data._messageToMobile){
						// individual Chat
					logger.info('Individual Chat - SendMessage');
					var socketid= userHashMaps.get (data._messageToMobile);						
					logger.info('sending a notification to socket: '+ socketid);
					var sendNotifcationFlag=true;
					if (socketid){
						var recipientSocket=io.sockets.connected[socketid];
						logger.info('Check room of Sender socket : ' + socket + 'where phone No is :'+socket.phoneNo + 'and room : ' +socket.room);		
						logger.info('Check room of Recipent socket :' + socketid + 'where phone No is :'+recipientSocket.phoneNo + 'and room : ' +recipientSocket.room);	
						if (recipientSocket){
							if (recipientSocket.room===socket.room) {								
							recipientSocket.emit('receiveMessage', msg);	
							sendNotifcationFlag=false;
							}
						}
											
					}
					if (sendNotifcationFlag===true){			
						logger.info('Sending Onesignal Notifcation to '+ data._messageToMobile );									  
						var query = { phone :data._messageToMobile };
						User.findOne(query).exec(function(err, user){
							if (err){
								  logger.error('Some Error occured while finding user' + err );												
							}
							if (user){												  
								logger.info('User Found For Phone No: ' + data._messageToMobile );
								logger.info('Sending Notification to player id ' + user.palyer_id );
								NotificationController.sendNotifcationToPlayerId(user.palyer_id,msg,"receiveMessage");
							}
							else {
								logger.info('User not Found For Phone No: ' + data._messageToMobile );                 												  
							}                               
						});
						}
		   }else{
				//group Chat
				logger.info('Group Chat - SendMessage');
				logger.info ("Emiting to room : "+socket.room);
				socket.to(socket.room).emit('receiveMessage', msg);
				var phoneNo;
				//Sending Message As push Notification to all members
				if (conversationId){
					ChatController.findConversationMembers(conversationId, function(members){
							logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
							//Notifying All Group Members
								for (var i=0; i < members.length ; i++){
									
									phoneNo=members[i]._userMobile;
									//Sending Push Notiifcation To Group Members								
									logger.info('Sending Onesignal Notifcation of receiveMessage to '+  phoneNo  );								  
									var query = { phone : phoneNo };
									User.findOne(query).exec(function(err, user){
										if (err){
										 logger.error('Some Error occured while finding user' + err );
										 }
										if (user){
										logger.info('User Found For Phone No: ' + phoneNo );
										logger.info('Sending Notification to player id ' + user.palyer_id );
										NotificationController.sendNotifcationToPlayerId(user.palyer_id,msg,"receiveMessage");
										}
										else {
										 logger.info('User not Found For Phone No: ' + phoneNo );                 
										}                               
									});								
								}
								
							}); //end of findConversationMembers call
						
				}//// end of else data.
		   }// end of else data._messageToMobile 
		   		   		   		   
	  }catch(err){
		  logger.info('An Exception Has occured in sendMessage event' + err);		  
	  }//end of catch
	}); //end of sendMessage Event
    
	socket.on('disconnect', function () {
		logger.info('Disconnect Event \n ' + socket.phoneNo + ' is disconnected' );
		userHashMaps.remove(socket.phoneNo);
		logger.info("Connected Users Count : " + userHashMaps.count());
	});//end of disconnect Event
    
}); //end of Connection Event