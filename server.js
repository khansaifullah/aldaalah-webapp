var app = require('express')();
var http = require('http').Server(app);
 require('./routes/routes.js')(app);
var io = require('socket.io')(http);

// Heroku assigns a port if port = process.env.PORT  
var port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');

http.listen(port, function(){
  console.log('listening on *:'+port);
});


// Connection Event of SocketIO
io.sockets.on('connection', function(socket) {
    
    console.log ("Socket id :"+socket.id);
   
    socket.on('', function () {

  });
    
    socket.on('join', function (phoneNo, callback) {
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