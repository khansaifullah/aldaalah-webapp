
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
var tempFileName;
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/images/profileImages')
	},
	filename: function(req, file, callback) {
		tempFileName="";
		//console.log("Printing in File Name Field :" + 'file.fieldname : ' + file.fieldname + ' file.originalname :' + file.originalname );
		tempFileName=file.fieldname + '-' + Date.now() + path.extname(file.originalname);
		//console.log("File NEW Name  :" +tempFileName );
		callback(null,tempFileName );
	}
});


module.exports = function(app) {	
	 
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
    
    
	   app.post('/deactivateAccount',function(req,res){                         
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body");  
        }
            
        logger.info('deactivateAccount-POST called ');
            
        var reqData=req.body;
        console.log("Phone No : "+ reqData.phoneNo);
		console.log("in routes /deactivateAccount ");
         
        regCtrl.deactivateAccount(reqData,res);	
	
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
    
		console.log("in routes - profile : " + req.body.phone);
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
			logger.info ("File Is uploaded");
			var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
			logger.info("profilePhotoUrl" + profilePhotoUrl);
			//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
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
				logger.info ("Photo Is uploaded");
				console.log(req.body.phone);
			 //geneterate a url 
			var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
			//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
		
			regCtrl.updateProfilePhoto(req.body.phone,profilePhotoUrl,function(data){
				
			});            
				
			}
		
		})
		
	});

	app.post('/updateProfile',function(req,res){
		
		console.log("in routes updateProfile");
		var user;
		if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		
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
			
				logger.info ("Photo Is uploaded");
				console.log(req.body.phoneNo);
				//geneterate a url 
				var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
				//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
		
				if ((req.body.updateProfilePhoto)&&(req.body.updateName)){
					//update picture
					regCtrl.updateProfilePhoto(req.body.phoneNo,profilePhotoUrl,function (data){
					if (data){
						 logger.info ('data received after updating profile picture');
						 //update Name
						regCtrl.updateName(req,function (user){
						 if (user){
							logger.info ('data received after updating profile picture');
							res.jsonp({ status:"success",
							message:"Profile has been Updated!",
							object:user});
						 }
						 else{
							 
						 }
						});
					}
					else{
						
					}
					});
					
					
				}
				else {
					if (req.body.updateProfilePhoto){
						regCtrl.updateProfilePhoto(req.body.phoneNo,profilePhotoUrl,function (data){
						if (data){
							 user=data;
							 res.jsonp({ status:"success",
							message:"Profile Photo has been Updated!",
							object:user});
						}
						});
					}
					//Updating Name
					if (req.body.updateName){
						regCtrl.updateName(req,function (data){
						if (data){
							 user=data;
							 res.jsonp({ status:"success",
							message:"Name has been Updated!",
							object:user});
						}
						});
					}
				}
					
			}
			});            
	});
		
		
    app.post('/contacts',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /contacts");
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
		AppController.findAllCountries(function (countries) {
			console.log("Response Of findAllCountries Method");
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
        logger.info ("Photo Is uploaded");
		var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
		//var profilePhotoUrl ="https://cdn0.iconfinder.com/data/icons/education-59/128/communication_discussion_workshop-256.png"; 
		ChatController.createGroup(req.body,profilePhotoUrl,res);				
		}
		
	});
	});
	
	
	app.post('/updateGroup',function(req,res){
		
		console.log("in routes updateGroup");
		var conversation;
		if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		
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
			
				logger.info ("Photo Is uploaded");
				console.log("Conversation id : "+req.body.conversationId);
				//geneterate a url 
				var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
				//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
		
				if ((req.body.updateProfilePhoto)&&(req.body.updateName)){
					//update picture
					ChatController.updateGroupProfilePhoto(req.body.conversationId,profilePhotoUrl,function (data){
					if (data){
						 logger.info ('data received after updating Group profile picture');
						 //update Name
						ChatController.updateGroupName(req,function (group){
						 if (group){
							logger.info ('data received after updating profile picture');
							res.jsonp({ status:"success",
							message:"Group has been Updated!",
							object:group});
						 }
						 else{
							 
						 }
						});
					}
					else{
						
					}
					});
				
				}
				else {
					if (req.body.updateProfilePhoto){
						ChatController.updateGroupProfilePhoto(req.body.conversationId,profilePhotoUrl,function (data){
						if (data){
							 conversation=data;
							 res.jsonp({ status:"success",
							message:"Group Profile Photo has been Updated!",
							object:conversation});
						}
						});
					}
					//Updating Name
					if (req.body.updateName){
						ChatController.updateGroupName(req,function (data){
						if (data){
							 conversation=data;
							 res.jsonp({ status:"success",
							message:"Group Name has been Updated!",
							object:conversation});
						}
						});
					}
				}
					
			}
			});            
	});
	
    	
	
	 app.post('/groupMember',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes POST /groupMember");

		ChatController.addGroupMember(req,res);
	});
	 app.delete('/groupMember',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes delete /groupMember");
		ChatController.removeGroupMember(req,res);
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


