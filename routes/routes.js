
var regCtrl= require('../controller/RegistrationController.js');
var AppController= require('../controller/AppController.js');
var ChatController = require('../controller/ChatController.js');
var LocController = require('../controller/LocationController.js');
var NotificationController = require('../controller/PushNotificationController.js');
var bodyParser = require('body-parser');
var Country = require('../models/Country.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
require('datejs');
var mongoose = require('mongoose');
var path = require('path');
var multer = require('multer');
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/images/profileImages')
	},
	filename: function(req, file, callback) {
		console.log(file)
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

//mongoose.Promise = global.Promise;

//mongoose.createConnection(db.url);
//mongoose.connect(db.url);
//var exp = require('express');
//Get the default connection
//var dbCon = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
//dbCon.on('error', console.error.bind(console, 'MongoDB connection error:'));

var path = require('path');
module.exports = function(app) {
	
	
//app.use(exp.static(__dirname, 'public'))
   // app.use('/', exp.static(__dirname + '/public'));
	//app.use('/images', exp.static(__dirname + '/public/images/profileImages'));
	//app.use('/images',exp.directory(__dirname + '/public/images/profileImages'));
	
	//app.use(exp.static('public'));
	
	//app.use('/public', exp.static(__dirname + '/public'));
	//app.use('/public',exp.directory(__dirname + '/public'));
	
	
	
	
    //app.use(express.directory('/public/images/profileImages'));
    //app.use(express.static('/public/images/profileImages'));
    
    //var directory = require('serve-index');
    //app.use(directory(__dirname +'/public'));
    
    app.use(bodyParser.urlencoded({
        extended: true
    }));
	// parse application/json
	app.use(bodyParser.json())
	
	app.get('/', function(req, res) {
		//var object =new Object({"Field1":"Value1","Field2":"Value2"});
	//NotificationController.sendNotifcationToPlayerId("03bd1410-c6f1-4e14-9e12-02e6fd718691",object,"TestEvent");
	//NotificationController.sendNotifcationToPlayerId();
		res.end("Node-Aldallah-Project"); 
	});

    app.post('/verificationcode',function(req,res){                         
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body");  
        }
            
        logger.verbose('verificationcode-POST called ');
            
        var reqData=req.body;
        console.log("reqData : "+ reqData.phoneNo);
        // let phoneNo = req.query.phoneNo;;
		console.log("in routes /verificationcode ");
        console.log(reqData);
           
        regCtrl.sendVerificationCode(reqData,res);	
	
	});
    
    
    app.post('/verifycode',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /verifyCode ");
		var reqData=req.body;
         console.log(reqData);
             regCtrl.verifyCode(reqData,res);	
	});
    
    
	app.post('/login',function(req,res){
		var email = req.body.email;
        var password = req.body.password;

		login.login(email,password,function (found) {
			
            console.log(found);
			res.json(found);
	});
	});


	app.post('/profile',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
    
		console.log("in routes - Req Body : " + req.body.phone);
        
	 var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
				return callback(res.end('Only images are allowed'), null)
			}
			callback(null, true)
		}
	}).single('profilePhoto');
	upload(req, res, function(err) {
        if (err){
            res.jsonp({status:"Failure",
                        message:"Error Uploading File",
                        object:[]});
        }
        else{
           // console.log("File Is uploaded");
           logger.info ("File Is uploaded");
         //console.log(req.body.phone);
         //console.log(req.body.profilePhoto);
		 //geneterate a url 
		 //sending dummy pefile url
		 var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
        regCtrl.completeProfile(req.body,profilePhotoUrl,res);
            
            
        }
		
	})
		
	});
    

	app.post('/profilePhoto',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
    
		console.log("in routes");
        
	 var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
				return callback(res.end('Only images are allowed'), null)
			}
			callback(null, true)
		}
	}).single('profilePhoto');
	upload(req, res, function(err) {
        if (err){
            res.jsonp({status:"Failure",
                        message:"Error Uploading File",
                        object:[]});
        }
        else{
           // console.log("File Is uploaded");
           logger.info ("Photo Is uploaded");
         console.log(req.body.phone);
		 //geneterate a url 
		 //sending dummy pefile url
		 var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
	
        regCtrl.updateProfilePhoto(req.body.phone,profilePhotoUrl,res);
            
            
        }
		
	})
		
	});


    app.post('/contacts',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /contacts");
		//var reqData=req.body;
        // console.log(reqData);
		regCtrl.syncContacts(req,res);
	});
  
    
    app.get('/country',function(req,res){
//		  console.log("start"); 
//	      var country = new Country({ 
//                    _id:"4",
//                    country_id:4,
//                    name: "India", 
//                    code:"021",
//                    shortForm:"ind"
//                     });
//          country.save(function (err, country) {
//               console.log("in save"); 
//                    if(err){
//                       console.log(err); 
//                    }
//              else
//                  console.log("Country Saved"+country); 
//                    
//          });
        
		console.log("in routes get country");
       // console.log (db.url);
		//var reqData=req.body;
         //console.log(reqData);
		AppController.findAllCountries(function (countries) {
            console.log("Response Of findAllCountries Method");
			//console.log(found);
			 res.jsonp({status:"success",
                        message:"List Of countries",
                        object:countries});
                             
	});		
	});

    	app.post('/group',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		
		console.log("in routes - Req Body : " + req.body);
		var reqData=req.body;
         logger.info("reqData  :"+reqData.groupName);
		 
		 
		 
	 var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
				return callback(res.end('Only images are allowed'), null)
			}
			callback(null, true)
		}
	}).single('profilePhoto');
	upload(req, res, function(err) {
        if (err){
            res.jsonp({status:"Failure",
                        message:"Error Uploading File",
                        object:[]});
        }
        else{
           // console.log("File Is uploaded");
           logger.info ("Photo Is uploaded");
        // console.log(req.body.phone);
		 //geneterate a url 
		 //sending dummy pefile url
		 var profilePhotoUrl ="https://cdn0.iconfinder.com/data/icons/education-59/128/communication_discussion_workshop-256.png";
		 
		 
		ChatController.createGroup(req.body,profilePhotoUrl,res);		
		
		  }
		
	});
	});
	
	
	/***** Location Apis ********/ 
	//get location From Client
	
	
	
	
    app.post('/location',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /location");
		var reqData=req.body;
        // console.log(reqData);
		LocController.updateUserLocation(reqData,res);
	});
	
	
	
	  app.get('/groupLocation',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		var conversationId = req.query.conversationId;
		console.log("in routes /location for group : "+conversationId );
		//var reqData=req.body;
        // console.log(reqData);
		LocController.getGroupUserLocations(conversationId,res);
	});
	
	  app.post('/shareLocation',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /shareLocation");
		var reqData=req.body;
        
		LocController.updateShareLocationFlag(reqData,res);
	});
	
	/******* Push Notification Apis *****/
	
	    app.post('/playerId',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /playerId ");
		//var reqData=req.body;
        // console.log(reqData);
		regCtrl.updatePlayerId(req,res);
	});
	
	
	/********  Admin Panel Apis********/
	
	 // getting List of users
    app.get('/users',function(req,res){ 
      	
		logger.info("in routes get users");
		AppController.findAllUser(function (users) {
            logger.info("Response Of findAllUser Method");
			 res.jsonp({status:"success",
                        message:"List Of users",
                        object:users});
                             
	});		
	});
		 // getting User  By user id in Query Params
	app.post('/user',function(req,res){
      	var phoneNo = req.body.phoneNo;
		//let phoneNo = req.query.phoneNo;
		logger.info("In routes get single user, where phone NO. : "+phoneNo);
		AppController.userExists(phoneNo,function (user) {
            logger.info("Response Of userExists Method : " + user);
			
			
			if (user){
			res.jsonp({status:"success",
                        message:"User Found",
                        object:user});
			}
			else{
			res.jsonp({status:"Failure",
                        message:"User Not Found",
                        object:[]});
				
			}
                             
	});		
	});
	
	 // getting List of Groups
    app.get('/groups',function(req,res){
      	
		logger.info("in routes get groups");
		ChatController.findAllGroups(function (groups) {
            logger.info("Response Of findAllGroups Method");
			 res.jsonp({status:"success",
                        message:"List Of groups",
                        object:groups});
                             
	});		
	});
	
};


