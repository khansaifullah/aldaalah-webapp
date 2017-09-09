var app = require('express')();
var http = require('http').Server(app);
 require('./routes/routes.js')(app);
 require('datejs');
var io = require('socket.io')(http);
var HashMap = require('hashmap');
var User = require('./models/User.js');
var ChatController = require('./controller/ChatController.js');
var ConversationMessages = require('./models/ConversationMessages.js');
var Conversation = require('./models/Conversation.js');ConversationUser
var ConversationUser = require('./models/ConversationUser.js');
 var logger = require('./config/lib/logger.js');


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
    
    
    //new user Event for user info
       socket.on('verifyUser', function (phoneNo, callback) {
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
  });
    
    
    //Creating room by concating both users mobile numbers.
  socket.on('createRoom', function ( userMobileNumberFrom, userMobileNumberTo,callback) {
      
       logger.info('createRoom Event  Called for userMobileNumberFrom : '+userMobileNumberFrom + ' & userMobileNumberTo ' + userMobileNumberTo);
      var conversationId;
      // check if conversation between These Two users ever occured before, send conversationId / roomId in response
      
      
        ChatController.chkPreviousIndividualConversation(userMobileNumberFrom,userMobileNumberTo,function(data){
          
            logger.info ("chkPreviousIndividualConversation response :"+data);
            if (data==null||data===undefined)
                {
                
                 var newconversation= new Conversation();
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
					
					
                });
                    
              
                }
            else {
				logger.info ('Previous Conversation Id Received :' + data );
                
				conversationId=data;
                 socket.room = conversationId;
				 socket.join(conversationId);
				 logger.info ('Sending room Id To client : ' + conversationId );
				 socket.emit('roomId',conversationId);
            }
        });
    
      
      //console.log("listening create room on server : " + " userMobileNumberFrom : "+userMobileNumberFrom +" , userMobileNumberTo : "+userMobileNumberTo);
      logger.info(' Exit createRoom Event'); 
  });
    
       //Swithing Room 
  socket.on('joinRoom', function (conversationId) {
       logger.info('joinRoom Event  Called');
      
    //Leaving the socket's current room
    //socket.leave(socket.room);
   
	//Joining New Room
      rooms.push(conversationId);
      socket.room = conversationId;
      socket.join(conversationId);
      socket.emit('roomId',conversationId);
    
      
      logger.info(' Exit joinRoom Event'); 
  });
    
	  socket.on('leaveRoom', function (conversationId) {
       logger.info('leaveRoom Event  Called');
      
	//Leaving the socket's current room
    socket.leave(socket.room);
	socket.emit('roomId',null);
    logger.info(' Exit leaveRoom Event'); 
  });
    
      socket.on('sendMessage', function (data) {
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
  });
    
 socket.on('disconnect', function () {
    userHashMaps.remove(socket.userMobile);
    console.log("User Disconnect " + userHashMaps.count());
  });
    
}); //end of Connection Event