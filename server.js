var app = require('express')();
var http = require('http').Server(app);
 require('./routes/routes.js')(app);
var port = process.env.PORT || 3000;

// set the view engine to ejs
app.set('view engine', 'ejs');

http.listen(port, function(){
  console.log('listening on *:'+port);
});