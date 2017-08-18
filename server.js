var app = require('express')();
var http = require('http').Server(app);
 require('./routes/routes.js')(app);
var io = require('socket.io')(http);
var HashMap = require('hashmap');
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
    
    //Creating room by concating both users mobile numbers.
  socket.on('createRoom', function (userToken, userMobileNumberFrom, userMobileNumberTo,callback) {
      
      console.log("listening create room on server : " + " userMobileNumberFrom : "+userMobileNumberFrom +" , userMobileNumberTo : "+userMobileNumberTo);
    //checking whether a room exists or not
    var isRoomExist = rooms.find(x => x == userMobileNumberFrom + userMobileNumberTo || x == userMobileNumberTo + userMobileNumberFrom);
    if (!isRoomExist) {
      rooms.push(userMobileNumberFrom + userMobileNumberTo);
    }
    //assigning room to socket
    socket.room = userMobileNumberFrom + userMobileNumberTo;
    //joining the existing room on the socket
    socket.join(userMobileNumberFrom + userMobileNumberTo);
    //emiting the room Id to the client App
    socket.emit('roomId', userMobileNumberFrom + userMobileNumberTo);
  });
    
    //Switihing Room 
  socket.on('switchRoom', function (userToken, userMobileNumberFrom, userMobileNumberTo) {
    //Leaving the socket's current room
    socket.leave(socket.room);
    var isRoomExist = rooms.find(x => x == userMobileNumberFrom + userMobileNumberTo || x == userMobileNumberTo + userMobileNumberFrom);
    console.log(isRoomExist);
    if (isRoomExist) {
      console.log("1");
      //Joining the new room
      socket.room = isRoomExist;
      socket.join(isRoomExist);
      socket.emit('onRoomSet', isRoomExist);
    }
    else {
      console.log("3");
      rooms.push(userMobileNumberFrom + userMobileNumberTo);
      socket.room = userMobileNumberFrom + userMobileNumberTo;
      socket.join(userMobileNumberFrom + userMobileNumberTo);
      socket.emit('onRoomSet', userMobileNumberFrom + userMobileNumberTo);
    }
  });
    
    socket.on('new user', function (phoneNo, callback) {
        console.log (phoneNo);
        
        //  if(data in users){
		//console.log('not in list');
	//	callback(false);
//	}
//	else{
		callback(true);
//		socket.nickname=data;
//		users[socket.nickname]=socket;
		
//		updateNicknames();
//	}
        
  });
    
}); //end of Connection Event