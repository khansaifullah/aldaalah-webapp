var app = require('express')();
var http = require('http').Server(app);
 require('./routes/routes.js')(app);
 var db = require('./config/db');
 require('datejs');
var io = require('socket.io')(http);
var HashMap = require('hashmap');
var User = require('./models/User.js');
var ChatController = require('./controller/ChatController.js');
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
    
    console.log ("Socket id :"+socket.id);
   
    socket.on('', function () {

  });
    
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
		 
	   });
                  
    //new user Event for user info
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
  });
    
    
    //Creating room by concating both users mobile numbers.
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
                       // _userId: 
                        _userMobile: userMobileNumberFrom,
						//createdAt: new Date().getTime()
                       // leaveConversation:
                       
                                          });
                    
					newConversationUser.save(function (err, conversationUser) {
                         if (err) logger.error('Error Occured while Saving new newConversationUser 1 :'+ err);
						});
              
                     newConversationUser= new ConversationUser({
                                          
                        _conversationId: conversationId,
                       // _userId: 
                        _userMobile: userMobileNumberTo,
                       // leaveConversation:
                       
                            });
                    
					newConversationUser.save(function (err, conversationUser) {
                         if (err) logger.error('Error Occured while Saving new newConversationUser 2:'+ err);
					});
					}
				
				
				 socket.room = conversationId;
				 socket.join(conversationId);
				 logger.info ('Sending room Id To client : ' + conversationId );
				 socket.emit('roomId',conversationId);
				 //socket.emit('newChatRequest',conversationId);
					
					
                });
                    
              
                }
            else {
				logger.info ('Previous Conversation Id Received :' + data );
                
				conversationId=data;
				ChatController.findConversation (conversationId , function(conversation){
					
					if (conversation){
						logger.info ('Conversation Found for Id  : '+ conversationId);
						newconversation=conversation;
					}
					
				} );
                 socket.room = conversationId;
				 socket.join(conversationId);
				 logger.info ('Sending room Id To client : ' + conversationId );
				 socket.emit('roomId',conversationId);
				 //send an invitation
				 var socketid= userHashMaps.get (userMobileNumberTo);
				 logger.info('sending a notification to socket: '+ socketid);
				 
				 if (io.sockets.connected[socketid]) {
					 	var conversationObj ={
						fromPhoneNo:userMobileNumberFrom,	
						conversationId:conversationId, 
						isGroupConversation:false
				 }
				 logger.info( socketid + ' is in connected Sockets List ');
				io.sockets.connected[socketid].emit('conversationRequest', conversationObj);
				}
            }
        });
    
      } catch (err){
			logger.info('An Exception Has occured in createRoom event' + err);
		}
      //console.log("listening create room on server : " + " userMobileNumberFrom : "+userMobileNumberFrom +" , userMobileNumberTo : "+userMobileNumberTo);
      logger.info(' Exit createRoom Event'); 
	  
	  
  });
  
  
    
       //Swithing Room 
  socket.on('joinRoom', function (conversationId) {
	  try{
       logger.info('joinRoom Event  Called for room id :' + conversationId);
      
    //Leaving the socket's current room
    //socket.leave(socket.room);
   
	//Joining New Room
      rooms.push(conversationId);
      socket.room = conversationId;
      socket.join(conversationId);
      socket.emit('roomId',conversationId);
    
      
      logger.info(' Exit joinRoom Event'); 
	   }catch(err){
		  logger.info('An Exception Has occured in joinRoom event ' + err);		  
	  }
  });
    
	// leave Room
	  socket.on('leaveRoom', function (conversationId) {
		  try{
       logger.info('leaveRoom Event  Called for room id :' + conversationId);
      
	//Leaving the socket's current room
    socket.leave(socket.room);
	socket.emit('roomId',null);
    logger.info(' Exit leaveRoom Event'); 
	 }catch(err) {
		  logger.info('An Exception Has occured in leaveRoom event' + err);		  
	  }
  });
  
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
							for (var i=0; i < members.length ; i++){
								logger.info('Getting Socket Id against Phone No :' + members[i]._userMobile)
								socketid= userHashMaps.get (members[i]._userMobile);
								
								logger.info('sending a notification to socket: '+ socketid);
									 
								if (io.sockets.connected[socketid]) {
									logger.info( socketid + ' is in connected Sockets List ');
										io.sockets.connected[socketid].emit('groupConversationRequest', conversationObj);										
													
										} 
							}
							
						});
					}
					if (con==null){
						logger.info ('Conversation For conversationId : '+ conversationId + 'is null');
						
					}
					
				} );
				if (conversation!==null && conversation !== undefined ){
					
					
				}				
		} catch (err){
			logger.info('An Exception Has occured in groupRequest event ' + err);
		}
	
	
	
	});
    
      socket.on('sendMessage', function (data) {
		  try {
          //IOS will send Room Name (not updated)
		  logger.info('Data Object : '+data);
		  data=JSON.parse(data);
          logger.info("listening sendMessage event on server : \n "+data.messageText +"**"+  data.messageType +"**"+ data._conversationId + "**"+data._messageToMobile+"**"+data._messageToMobile);
		  //console.log ("message Data on server : \n "+data.messageText +"**"+  data.messageType +"**"+ data._conversationId + "**"+data._messageToMobile+"**"+data._messageToMobile);
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
      else if (conMes == null) {
          logger.info('Issue Saving Conversation message, message is  Null ');
      }
      else {

      }
    });
          // Username is not being used in app, need to add for displaying with chat.
          //if user  client 2 is in room 
  //  io.sockets["in"](socket.room).emit('receiveMessage',/* socket.username, */data);
         // sending to all clients in 'game' room except sender
 
          //if client 2 is ofline or in other room
          // Push notification  
		var msg ={
		 messageType:data.messageType,
		 messageText:data.messageText,
		 _conversationId:data._conversationId,
		 _messageToMobile:data._messageToMobile,
		 _messageFromMobile:data._messageFromMobile
	 }
          console.log ("Pushing to room : "+socket.room);
           socket.to(socket.room).emit('receiveMessage', msg);
	  }catch(err){
		  logger.info('An Exception Has occured in sendMessage event' + err);		  
	  }
  });
    
 socket.on('disconnect', function () {
	logger.info('Disconnect Event \n ' + socket.phoneNo + ' is disconnected' );
    userHashMaps.remove(socket.phoneNo);
    logger.info("Connected Users Count : " + userHashMaps.count());
  });
    
}); //end of Connection Event