

var User = require('../models/User.js');
var Group = require('../models/Group.js');
var UserGroup = require('../models/UserGroup.js');
var db = require('../config/db');
require('datejs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

mongoose.connect(db.url);
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));





exports.createGroup = function(reqData,callback) {
console.log("In Controller Register Method");
        var groupName =reqData.groupName;
        var adminId = reqData.adminId;
        var groupPhotoUrl= user.profilePhotoUrl;
    

var newGroup = new Group({ 
	
	username: userName, 
	phone: phoneNo,
    profilePhotoUrl:groupPhotoUrl,
    active:true,                            
    created_at:  new Date()
	 });
	 
	 newuser.save(function (err, user) {
	if(err)
        callback({'response':err});
         else
	callback({
        msg:'not an error - User Data',
        response:user
    });
		
});

}
/*
user.find({email: email},function(err,users){

var len = users.length;

if(len == 0){
 	newuser.save(function (err) {
	
	callback({'response':"Sucessfully Registered"});
		
});
}else{

	callback({'response':"Email already Registered"});

}});}else{

	callback({'response':"Password Weak"});
	
}}else{

	callback({'response':"Email Not Valid"});
	
}
*/
