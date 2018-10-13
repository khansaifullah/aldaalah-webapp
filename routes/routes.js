const adminAuth = require('../middleware/adminAuth');
const auth = require('../middleware/auth');
const Joi = require('joi');
const bcrypt = require('bcrypt');
var regCtrl= require('../controller/RegistrationController.js');
var AppController= require('../controller/AppController.js');
var ChatController = require('../controller/ChatController.js');
var LocController = require('../controller/LocationController.js');
var NotificationController = require('../controller/PushNotificationController.js');
var AdminController = require('../controller/AdminController.js');
var bodyParser = require('body-parser');
var Country = require('../models/Country.js');
var Conversation = require('../models/Conversation.js');
var Marker = require('../models/Marker.js');

var User = require('../models/User.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
require('datejs');
cors = require('cors');
var mongoose = require('mongoose');
var path = require('path');
var multer = require('multer');
var FormData = require('form-data');
var fs = require('fs');
var tempFileName;
var tempFileNamesList =[] ;
var notAnImageFlag=false;

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './public/images')
	},
	filename: function(req, file, callback) {
	
		tempFileName="";
		tempFileName=file.fieldname + '-' + Date.now() + path.extname(file.originalname);

		logger.info("File NEW Name  :" +tempFileName );
		tempFileNamesList.push(tempFileName);
		callback(null,tempFileName );
	}
});


module.exports = function(app) {	
	 
	 
	 //Enable All CORS Requests
	app.use(cors());
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "*");
		res.header("Access-Control-Expose-Headers", "*");
		next();
	  });
	
    app.use(bodyParser.urlencoded({
        extended: true
    }));
	// parse application/json
	app.use(bodyParser.json())
	
	app.get('/', function(req, res) {
	//var object =new Object({"Field1":"Value1","Field2":"Value2"});
	//NotificationController.sendNotifcationToPlayerId("03bd1410-c6f1-4e14-9e12-02e6fd718691",object,"TestEvent");
	//NotificationController.sendNotifcationToPlayerId();
		res.end("Aldallah-WebServices V1.1 "); 
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
    
    
	   app.post('/deactivateAccount', auth, function(req,res){                         
		
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
				
				logger.info("Error Uploading File : " + err);
				res.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
			}
			else{
				logger.info ("File Is uploaded");
				if (tempFileName!==undefined){
					try{			
					var form = new FormData();
					form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
					form.submit('http://exagic.com/postimage.php', function(err, resp) {
					 if (err) {
					   logger.info("Error : "+ err);
					   res.jsonp({status:"Failure",
					   message:"Error Uploading File",
					   object:[]});
					 }else {
						logger.info("Not an Error");
					  var body = '';
					  resp.on('data', function(chunk) {
						body += chunk;
					  });
					  resp.on('end', function() {
						  if (body){
							var urls = JSON.parse(body);
							console.log("File Url : "+urls.imageurl);
							var fileUrl=urls.imageurl;    
						   
						   regCtrl.completeProfile(req.body,fileUrl,res);
							tempFileName="";
						  }else {
							  logger.eror("Invalid Response");
							  regCtrl.completeProfile(req.body,'',res);
						  }
						
					   });
					 }
				   });
					}catch(err){

						logger.info("Error Uploading File : " + err);
						res.jsonp({status:"Failure",
									message:"Unable to update profile.",
									object:[]});
					}
				  }else {
					regCtrl.completeProfile(req.body,'',res);
				  }
				
			}
			
		})
		
	});
    

	app.post('/profilePhoto', auth,function(req,res){
		
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
				logger.info("Error Uploading File : " + err);
				res.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
			}
			else{        
			logger.info ("Photo Is uploaded");
			console.log(req.body.phone);         
			if (tempFileName!==undefined){
				var form = new FormData();
				form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
				form.submit('http://exagic.com/postimage.php', function(err, resp) {
				if (err) {
				logger.info("Error : "+ err);
				res.jsonp({status:"Failure",
				message:"Error Uploading File",
				object:[]});
				}else {
				var body = '';
				resp.on('data', function(chunk) {
					body += chunk;
				});
				resp.on('end', function() {
					var urls = JSON.parse(body);
					console.log("File Url : "+urls.imageurl);
					var fileUrl=urls.imageurl;    
					regCtrl.updateProfilePhoto(req.body.phone,fileUrl,function(data){
						tempFileName="";
						});
				});
				}
			});
			}else {
				regCtrl.updateProfilePhoto(req.body.phone,'',function(data){
				tempFileName="";
				});
		  	}
			}
		
		});
		
	});
	
	app.post('/updateProfile', auth, function(req,res){
		try {

		console.log("in routes /updateProfile");
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
		upload(req, res, async function(err) {
			if (err){
			
				logger.info ("Error Uploading File : "+ err);
				res.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
			}
			else{      
			
				logger.info ("Photo Is uploaded");
				console.log(req.body.phoneNo);

				if (tempFileName!==undefined){
					var form = new FormData();
					form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
					form.submit('http://exagic.com/postimage.php', function(err, resp) {

					if (err) {
						logger.info("Error : "+ err);
						res.jsonp({status:"Failure",
						message:"Error Uploading File",
						object:[]});
					}else {
						var body = '';
						resp.on('data', function(chunk) {
						body += chunk;
						});
						resp.on('end', function() {
						var urls = JSON.parse(body);
						console.log("File Url : "+urls.imageurl);
						var fileUrl=urls.imageurl;
		
						AppController.userExists(req.body.phoneNo,async function (user) {
							logger.info("Response Of userExists Method : " + user);
			
							if (user){
								//geneterate a url 
								var profilePhotoUrl=fileUrl;
							
								var updateProfilePhotoFlag = JSON.parse(req.body.updateProfilePhoto);
								var updateStatusFlag = JSON.parse(req.body.updateStatus);
								var updateNameFlag = JSON.parse(req.body.updateName);

								console.log ("updateStatusFlag After parsing : " + updateStatusFlag);
								if (updateStatusFlag){
									var userAfterUpdateStatus = await regCtrl.updateStatus(user,req.body.status);
									user=userAfterUpdateStatus;
								}
								
								console.log ("updateNameFlag After parsing : " + updateNameFlag);
								if (updateNameFlag){
									var userAfterUpdateName = await regCtrl.updateName(user,req.body.fullName);
									user=userAfterUpdateName;
								}
								
								console.log ("updateProfilePhotoFlag After parsing : " + updateProfilePhotoFlag);
								if (updateProfilePhotoFlag){
									var userAfterUpdatePhoto = await regCtrl.updateProfilePhoto(user,profilePhotoUrl);
									user=userAfterUpdatePhoto;
								}
								
								res.jsonp({ status:"success",
								message:"Profile has been Updated!",
								object:user});
							}
							else{
								res.jsonp({status:"Failure",
										message:"User Not Found",
										object:[]});
								
							}
											
							});
					});
					}
				});
			}else {
				var fileUrl='';
				logger.info("Profile Photo Not Found ");
	
				AppController.userExists(req.body.phoneNo,async function (user) {
					logger.info("Response Of userExists Method : " + user);
	
					if (user){
						//geneterate a url 
						var profilePhotoUrl=fileUrl;
					
						var updateProfilePhotoFlag = JSON.parse(req.body.updateProfilePhoto);
						var updateStatusFlag = JSON.parse(req.body.updateStatus);
						var updateNameFlag = JSON.parse(req.body.updateName);

						console.log ("updateStatusFlag After parsing : " + updateStatusFlag);
						if (updateStatusFlag){
							var userAfterUpdateStatus = await regCtrl.updateStatus(user,req.body.status);
							user=userAfterUpdateStatus;
						}
						
						console.log ("updateNameFlag After parsing : " + updateNameFlag);
						if (updateNameFlag){
							var userAfterUpdateName = await regCtrl.updateName(user,req.body.fullName);
							user=userAfterUpdateName;
						}
						
						console.log ("updateProfilePhotoFlag After parsing : " + updateProfilePhotoFlag);
						if (updateProfilePhotoFlag){
							var userAfterUpdatePhoto = await regCtrl.updateProfilePhoto(user,profilePhotoUrl);
							user=userAfterUpdatePhoto;
						}
						
						res.jsonp({ status:"success",
						message:"Profile has been Updated!",
						object:user});
					}
					else{
						res.jsonp({status:"Failure",
								message:"User Not Found",
								object:[]});
						
					}
									
					});
				
			}
			}
			});
		}catch(err){
			logger.info ("Exception Occured in /updateProfile : "+ err);
		}
		            
	});

    app.post('/contacts', auth, function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /contacts");
		var phoneNo=req.body.phoneNo;
		var query = { phone : phoneNo };
		
		User.findOne(query).exec(function(err, me){
			if (me){
				regCtrl.syncContacts(req, res, me);
				
			}else {
				res.jsonp({status:"Failure",
				message:"Unable to Find User",
			   object:[]});
			}


		});
		
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

	app.post('/group', auth,function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		
		console.log("in routes - group" );
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
			logger.info("Error Uploading File : " + err);
            res.jsonp({status:"Failure",
                        message:"Error Uploading File",
                        object:[]});
        }else{  
        logger.info ("Photo Is uploaded");
		console.log (req.files);

	

		console.log('tempFileName: ' +tempFileName );
		if (tempFileName!==undefined){	
		var form = new FormData();
			form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
			form.submit('http://exagic.com/postimage.php', function(err, resp) {
			if (err) {
				logger.info("Error : "+ err);
				res.jsonp({status:"Failure",
				message:"Error Uploading File",
				object:[]});
			}else {
				var body = '';
				resp.on('data', function(chunk) {
				body += chunk;
				});
				resp.on('end', function() {
					var urls = JSON.parse(body);
					console.log("File Url : "+urls.imageurl);
					var fileUrl=urls.imageurl; 
		
				ChatController.createGroup(req.body,fileUrl,res);	
				tempFileName="";

			});
			}
		 });
		}else {
			ChatController.createGroup(req.body,'',res);	
		  }
			
		}
		
	});
	});
	
	
	app.post('/updateGroup', auth,function(req,res){
		
		console.log("in routes updateGroup");
		var conversation;
		var conversationId
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
				logger.info("Error Uploading File : " + err);
				res.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
			}
			else{
				try{
				var myDate;
				var createdDate;
				conversationId = req.body.conversationId;
				logger.info ("Photo Is uploaded");
				console.log("Conversation id : "+conversationId);
				//geneterate a url 
				var profilePhotoUrl="https://aldaalah.herokuapp.com/images/profileImages/"+tempFileName;
				//var profilePhotoUrl ="https://media.licdn.com/mpr/mpr/shrinknp_200_200/AAEAAQAAAAAAAA1DAAAAJDAzYjg1ZDYwLTI1YjQtNDJkOS04OTkwLTUyMjkwNGJiMTY4Yg.jpg";
				console.log ("updateProfilePhotoFlag Without Parsing: " + req.body.updateProfilePhoto);


				if (tempFileName){
				var form = new FormData();
				form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
				form.submit('http://exagic.com/postimage.php', function(err, resp) {

				 if (err) {
					 logger.info("Error : "+ err);
					 res.jsonp({status:"Failure",
					 message:"Error in uploading File",
					 object:[]});
				 }else {
					var body = '';
					resp.on('data', function(chunk) {
					  body += chunk;
					});
					resp.on('end', function() {
						var urls = JSON.parse(body);
						console.log("File Url : "+urls.imageurl);
						var fileUrl=urls.imageurl; 
					 	profilePhotoUrl=fileUrl;
					  	var updateProfilePhotoFlag = JSON.parse(req.body.updateProfilePhoto);
					  	var updateNameFlag = JSON.parse(req.body.updateName);
					  console.log ("updateProfilePhotoFlag with parsing : " + updateProfilePhotoFlag);
					  if ((updateProfilePhotoFlag)&&(updateNameFlag)){
						  //update picture
						  ChatController.updateGroupProfilePhoto(conversationId,profilePhotoUrl,function (data){
							  tempFileName="";
						  if (data){
							   logger.info ('data received after updating Group profile picture');
							   //update Name
							  ChatController.updateGroupName(req,function (group){
							   if (group){
								   conversation=group;
								   
						  //Sending update group Notifcation
							  ChatController.findConversationMembers(conversationId, function(members){
							  if (members){
									  logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
									  myDate = new Date(conversation.createdAt);
									  createdDate = myDate.getTime();
									  
									  var conversationObj ={
											  //fromPhoneNo:userMobileNumberFrom,	
											  conversationId:conversationId, 
											  isGroupConversation:conversation.isGroupConversation,
											  adminMobile:conversation.adminMobile,
											  photoUrl:conversation.conversationImageUrl,
											  conversationName:conversation.conversationName,
											  createdAt:createdDate,
											  
											  }
										  
											  
											  //Notifying All Group Members
									  for (var i=0; i < members.length ; i++){
										  var phoneNo=members[i]._userMobile;
										  if (phoneNo!==(conversationObj.adminMobile)){
											  
											  
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
												  NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupUpdateRequest");
												  }
												  else {
												   logger.info('User not Found For Phone No: ' + phoneNo );                 
												  }                               
											  });
										  }								
									  }
							  }
							  });
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
						  if (updateProfilePhotoFlag){
							  ChatController.updateGroupProfilePhoto(conversationId,profilePhotoUrl,function (data){
								  tempFileName="";
							  if (data){
								   conversation=data;
									
						  //Sending update group Notifcation
							  ChatController.findConversationMembers(conversationId, function(members){
							  if (members){
									  logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
									  myDate = new Date(conversation.createdAt);
									  createdDate = myDate.getTime();
									  
									  var conversationObj ={
											  //fromPhoneNo:userMobileNumberFrom,	
											  conversationId:conversationId, 
											  isGroupConversation:conversation.isGroupConversation,
											  adminMobile:conversation.adminMobile,
											  photoUrl:conversation.conversationImageUrl,
											  conversationName:conversation.conversationName,
											  createdAt:createdDate,
											  
											  }
										  
											  
											  //Notifying All Group Members
									  for (var i=0; i < members.length ; i++){
										  var phoneNo=members[i]._userMobile;
										  if (phoneNo!==(conversationObj.adminMobile)){
											  
											  
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
												  if (!user.deactivate_user){
												  NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupUpdateRequest");	
												  }else{
													  logger.info('Can not send notification to deactivated user :  ' +phoneNo  );    
													  
												  }
												  
												  }
												  else {
												   logger.info('User not Found For Phone No: ' + phoneNo );                 
												  }                               
											  });
										  }								
									  }
							  }
							  });
								   res.jsonp({ status:"success",
								  message:"Group Profile Photo has been Updated!",
								  object:conversation});
							  }
							  });
						  }
						  //Updating Name
						  if (updateNameFlag){
							  ChatController.updateGroupName(req,function (data){
							  if (data){
								   conversation=data;
									
						  //Sending update group Notifcation
							  ChatController.findConversationMembers(conversationId, function(members){
							  if (members){
									  logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
									  myDate = new Date(conversation.createdAt);
									  createdDate = myDate.getTime();
									  
									  var conversationObj ={
											  //fromPhoneNo:userMobileNumberFrom,	
											  conversationId:conversationId, 
											  isGroupConversation:conversation.isGroupConversation,
											  adminMobile:conversation.adminMobile,
											  photoUrl:conversation.conversationImageUrl,
											  conversationName:conversation.conversationName,
											  createdAt:createdDate,
											  
											  }
										  
											  
											  //Notifying All Group Members
									  for (var i=0; i < members.length ; i++){
										  var phoneNo=members[i]._userMobile;
										  if (phoneNo!==(conversationObj.adminMobile)){
											  
											  
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
												  NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupUpdateRequest");
												  }
												  else {
												   logger.info('User not Found For Phone No: ' + phoneNo );                 
												  }                               
											  });
										  }								
									  }
							  }
							  });
								   res.jsonp({ status:"success",
								  message:"Group Name has been Updated!",
								  object:conversation});
							  }
							  });
						  }
					  }
						tempFileName="";
				 
				   });
				 }
			 });
				
			 
				}else{
					var updateNameFlag = JSON.parse(req.body.updateName);
					//Updating Name
					if (updateNameFlag){
						ChatController.updateGroupName(req,function (data){
						if (data){
							 conversation=data;
							  
					//Sending update group Notifcation
						ChatController.findConversationMembers(conversationId, function(members){
						if (members){
								logger.info ('findConversationMembers Response, Members List Size : ' + members.length);
								myDate = new Date(conversation.createdAt);
								createdDate = myDate.getTime();
								
								var conversationObj ={
										//fromPhoneNo:userMobileNumberFrom,	
										conversationId:conversationId, 
										isGroupConversation:conversation.isGroupConversation,
										adminMobile:conversation.adminMobile,
										photoUrl:conversation.conversationImageUrl,
										conversationName:conversation.conversationName,
										createdAt:createdDate,
										
										}
									
										
										//Notifying All Group Members
								for (var i=0; i < members.length ; i++){
									var phoneNo=members[i]._userMobile;
									if (phoneNo!==(conversationObj.adminMobile)){
										
										
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
											NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupUpdateRequest");
											}
											else {
											 logger.info('User not Found For Phone No: ' + phoneNo );                 
											}                               
										});
									}								
								}
						}
						});
							 res.jsonp({ status:"success",
							message:"Group Name has been Updated!",
							object:conversation});
						}
						});
					}else{
						res.jsonp({ status:"Failure",
						message:"Nothing To Update",
						object:[]});
					}

				}
			}catch (err){
				logger.info('An Exception Has occured in updateGroupName method' + err);
				}		
			}
			});            
	});
	
     app.post('/deleteGroup', auth, function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes post /deleteGroup");
		ChatController.closeGroup(req,res);
	});
	
	 app.post('/groupMember', auth,function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes POST /groupMember");

		ChatController.addGroupMember(req,res);
	});
	 app.post('/deleteMember', auth,function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes post /groupMember");
		ChatController.removeGroupMember(req,res);
	});


	/***** Location Apis ********/ 
	//get location From Client
	

    app.post('/location', auth, function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		/*
		  console.log("start"); 
	      var country = new Country({ 
                    _id:"4",
                    country_id:4,
                    name: "India", 
                    code:"021",
                    shortForm:"ind"
                     });
          country.save(function (err, country) {
               console.log("in save"); 
                    if(err){
                       console.log(err); 
                    }
              else
                  console.log("Country Saved"+country); 
                    
          });
*/
		console.log("in routes /location");
		var reqData=req.body;
        // console.log(reqData);
		LocController.updateUserLocation(reqData,res);
	});
		
	
	  app.get('/groupLocation', auth, function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		var conversationId = req.query.conversationId;
		console.log("in routes /location for group : "+conversationId );
		LocController.getGroupUserLocations(conversationId,res);
	});
	
	app.post('/shareLocation', auth, function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /shareLocation");
		var reqData=req.body;      
		LocController.updateShareLocationFlag(reqData,res);
	});

	app.post('/alert', auth, function(req,res){
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body"); 
		 }
		 console.log("in routes /alert");
		 var reqData=req.body;      
		 LocController.updateAlertFlag(reqData,res);
	 });
	
	 app.get('/nextmarker', auth, function(req,res){
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body"); 
		 }
		 var markerId = req.query.markerId;
		 console.log("in routes /nextmarker called with marker id : "+markerId );
		 LocController.getNextMarker(markerId,res);
	 });

	/*  Marker API's */
	 app.post('/marker',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes /marker");
		var reqData=req.body;
        // console.log(reqData);
		LocController.setMarker(reqData,res);
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
	
		/******* User preference Apis *****/

		// getting List of PREFERENCES / Markers Category
		app.get('/preference',function(req,res){ 

			logger.info("in routes get preference");
			AppController.findAllMarkerCategories(function (markerCategories) {
				logger.info("Response Of findAllMarkerCategories Method");
				res.jsonp({status:"success",
							message:"List Of Preferences",
							object:markerCategories});
									
		});		
		});

		//Set User Preference
		app.post('/preference', auth, function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 console.log("in routes POST:  /markerCategory");
			 var preferenceId=req.body.preferenceId;
			 var phoneNo=req.body.phoneNo;

			 AppController.userExists(phoneNo,function (user) {
				logger.info("Response Of userExists Method : " + user);
				if (user){
					user._preferenceId=preferenceId;
					
					user.save(function (err, savedUser) {
					
						if(err){
							logger.error('Some Error occured while saving user' + err );
							res.jsonp({status:"Failure",
							message:"Unable to Set Prefernce!",
							object:[]});
						}
					else{
						res.jsonp({status:"success",
							message:"User Preference is Successfully updated!",
							object:savedUser});
					}								
					});				
				}
				else{
				res.jsonp({status:"Failure",
							message:"User Not Found",
							object:[]});
				}						 
		});	
		 });
	
	/********  Admin Panel Apis********/
	
	 // getting List of users
    app.get('/users',function(req,res){ 
      	
		logger.info("In routes get users");
		AppController.findAllUser(function (users) {
            logger.info("Response Of findAllUser Method");
			res.jsonp({ status:"success",
                        message:"List Of users",
                        object:users});
                             
	});		
	});
		 // getting User  By user id in Query Params
	app.post('/user', auth, function(req,res){
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
	
	 // getting groupMembers Details
    app.get('/groupMembers',function(req,res){
      	
		logger.info("in routes get groupMembers");
		var conversationId = req.query.conversationId;
		var arrayToSend = [];
		let promiseArr = [];
		var tempObject;
		var adminMobile;
		function add(member){									
			return new Promise((resolve,reject) => {
				
				phoneNo=member._userMobile;	
				logger.info ("Member Phone No  before : "+phoneNo);
				logger.info ("Admin Phone No before : "+adminMobile);
				query = { phone : phoneNo };
				AppController.userExists(phoneNo,function (user) {
					logger.info("Response Of userExists Method : " + user);
					
					
					if (user){
					logger.info('User Found For Phone No: ' + phoneNo );
					phoneNo=user.phone;
					tempObject=new Object ();
					tempObject.phoneNo=user.phone;
					tempObject.profileUrl=user.profile_photo_url;
					if (adminMobile===phoneNo){
						logger.info('Its Admin' );
						logger.info ("Member Phone No : "+phoneNo);
						logger.info ("Admin Phone No : "+adminMobile);
						tempObject.type="admin";
					}
					else {
						logger.info('Its Non  Admin');
						logger.info ("Member Phone No  in chk : "+phoneNo);
						logger.info ("Admin Phone No in chk : "+adminMobile);
						tempObject.type="member";
					}
					arrayToSend.push(tempObject);
					 resolve();
					}
					else{
					logger.info('User not Found For Phone No: ' + phoneNo ); 
					resolve();
						
					}
                             
				});	
			
				
			});
		}
		var query = { _id : conversationId };
		Conversation.findOne(query).exec(function(err,conversation){
			if (conversation){
				
				adminMobile=conversation.adminMobile;
				
				ChatController.findConversationMembers(conversationId, function(members){
			
					if (members){
						logger.info ("Group members list size " + members.length);
						var phoneNo;
						var query;
						logger.info ('findConversationMembers Response, Members List Size : ' + members.length);											
								//Add all members in a list to send All Group Members								
											   
						 members.forEach(function(member) {								
									 promiseArr.push(add(member));
														        
						 });
						
						 Promise.all(promiseArr)
							 .then((result)=> res.jsonp({status:"success",
											   message:"Group Members List",
											  object:arrayToSend}))
							 .catch((err)=>res.send({status:"Failure",
											   message:"Error Occured while finding Members" + err,
											  object:[]}));
						
					}
					else {
						//Send Response no members Found
						logger.info ("members : " + members);
						res.send({status:"Failure",
								  message:"No Members Found In Group",
								  object:[]})
						
					}
				});
			}
			else{	
				res.send({status:"Failure",
						  message:"No Such Conversation Found",
						  object:[]})
			}
			
		});
		
						
						

	});
	
	 // getting List of Markers
    app.get('/markers',function(req,res){ 
      	
		logger.info("in routes get markers");
		AppController.findAllMarkers(function (markers) {
            logger.info("Response Of findAllMarkers Method");
			res.jsonp({status:"success",
                        message:"List Of Markers",
                        object:markers});
                             
	});		
	});
	
	
		// Admin Login
	app.post('/adminlogin',function(req,res){
		
		if(req.body === undefined||req.body === null) {
       	 res.end("Empty Body"); 
        }
		console.log("in routes /adminlogin");
		var userName = req.body.username;
        var password = req.body.password;

		AdminController.login(userName,password,function (admin) {
			
          if (admin){
			res.header("Access-Control-Allow-Headers", "*");
			res.setHeader("App-Awt-Token", "xhbqabsbasa17ascxxkk");
			res.jsonp({status:"success",
                        message:"Successful Login",
                        object:admin});
			}
			else{
			res.jsonp({status:"Failure",
                        message:"Wrong username or Password",
                        object:[]});
				
			}
	});
	});



	/* ALDAALAH V2 APIS */


	/*  Marker  API's */


	app.post('/v2.0/marker',function(req,res){
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body"); 
		 }
		 console.log("in routes post /marker");
		 var reqData=req.body;
		 // console.log(reqData);
		 LocController.setMarker(reqData,res);
	 });

	app.post('/v2.0/updateMarker',function(req,res){				
	
		if(req.body === undefined||req.body === null) {
			res.jsonp({status:"Failure",
                        message:"Empty Body",
                        object:[]});
			}	 
			console.log("in routes /updateMarker");
			var reqData=req.body;
			LocController.updateMarker(reqData,res);	
	});


	 app.delete('/v2.0/marker',function(req,res){
		
		if(req.body === undefined||req.body === null) {
		 res.end("Empty Body"); 
		 }
		 var markerId = req.query.markerId;
		 console.log("in routes delete /marker");
		 
		 // console.log(reqData);
		 LocController.deleteMarker(markerId,res);
	 });


	

		
	/*  Marker Category API's */

	//Add new Catogory
		app.post('/v2.0/markerCategory',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 console.log("in routes POST:  /markerCategory");
			 var reqData=req.body;
			 LocController.addMarkerCategory(reqData,res);
		 });

	//update Marker Category
		 app.put('/v2.0/markerCategory',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 console.log("in routes PUT : /markerCategory");
			 var reqData=req.body;
			 LocController.updateCategoryMarker(reqData,res);
		 });


	// delete Marker Category
		 app.delete('/v2.0/markerCategory',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 var categoryId = req.query.categoryId;
			 console.log("in routes delete /markerCategory");
			 
			 // console.log(reqData);
			 LocController.deleteMarkerCategory(categoryId,res);
		 });


			// getting List of Markers Category
		app.get('/v2.0/markerCategory',function(req,res){ 

			logger.info("in routes get markerCategory");
			AppController.findAllMarkerCategories(function (markerCategories) {
				logger.info("Response Of findAllMarkerCategories Method");
				res.jsonp({status:"success",
							message:"List Of Markers Categories",
							object:markerCategories});
									
		});		
		});


		 // Add new Group member from IOS device
		 app.post('/v2.0/groupMember',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 console.log("in routes POST /v2.0/groupMember");
	 
			 ChatController.addGroupMemberFromIOS(req,res);
		 });

		 // Delete  Group member from IOS device
		 app.post('/v2.0/deleteMember',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body"); 
			 }
			 console.log("in routes post /v2.0/deleteMember");
			 ChatController.removeGroupMemberFromIOS(req,res);
		 });

		 //Add New Wallpaper
		 app.post('/wallpaper',function(req,res){
		
			if(req.body === undefined||req.body === null) {
			 res.end("Empty Body "); 
			 }
			 
			 console.log("in routes  /wallpaper");
			 
			 var upload = multer({
				 storage: storage,
				 fileFilter: function(req, file, callback) {
					 var ext = path.extname(file.originalname)
					 if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
						 return callback(res.end('Only images are allowed'), null)
					 }
					 callback(null, true)
				 }
			 }).single('file');
			 upload(req, res, function(err) {
				 if (err){
					logger.info("Error Uploading File : " + err);
					res.jsonp({status:"Failure",
								message:"Error Uploading File",
								object:[]});
				 }else{   
					logger.info ("Photo Is uploaded");
					console.log(req.body.title); 
					if (tempFileName!==undefined){
						var form = new FormData();
						form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
						form.submit('http://exagic.com/postimage.php', function(err, resp) {
						 if (err) {
						   logger.info("Error : "+ err);
						   res.jsonp({status:"Failure",
						   message:"Error Uploading File",
						   object:[]});
						 }else {
						  var body = '';
						  resp.on('data', function(chunk) {
							body += chunk;
						  });
						  resp.on('end', function() {
							var urls = JSON.parse(body);
							console.log("File Url : "+urls.imageurl);
							var fileUrl=urls.imageurl;    
						   
							AppController.addWallpaper(req.body.title, fileUrl, res, function(data){
								tempFileName="";
						   }); 
						   });
						 }
					   });
					  }else {
						AppController.addWallpaper(req.body.title, '', res, function(data){
							tempFileName="";
					   }); 
					  } 
						
				 }				 	 
			 })
			 
		 });


	// GET ALL Wallpapers
		app.get('/wallpaper', function(req,res){
				
				console.log("in routes get wallpaper");
				AppController.findAllWallpapers(function (wallpapers) {
					console.log("Response Of findAllWallpapers Method");
					res.jsonp({status:"success",
								message:"List Of Wallpapers",
								object:wallpapers});
										
			});		
			});

			var uploadPhotos = multer({storage: storage,
				fileFilter: function(req, file, callback) {
					//Allow Only Image Files
				    var ext = path.extname(file.originalname)
				    if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
						// return callback(res.end('Only images are allowed'), null)
						notAnImageFlag=true;
						return callback(null, true);

				    }
					callback(null, true)
				}
			})
		//app.post('/attachment/photos', uploadPhotos.fields([{ name: 'video', maxCount: 1}, { name: 'image', maxCount: 3}]), function (req, res, next) {
		app.post('/attachment/photo', auth, uploadPhotos.array('photo', 12),async function (req, res, next) {
			// req.files is array of `photos` files
			// req.body will contain the text fields, if there were any
			console.log("in routes  /attachment/photo");
			if(req.body === undefined||req.body === null) {
				res.end("Empty Body "); 
				}
				if (!notAnImageFlag){
	
				if (req.files){

					console.log('Files Length : '+ req.files.length);

					if (tempFileNamesList){
						for(var i=0; i<tempFileNamesList.length; i++){
							console.log('Temp File Name : '+tempFileNamesList[i] );

							if(tempFileNamesList[i]){

								var form = new FormData();
								await form.append('image', fs.createReadStream( './/public//images//'+tempFileNamesList[i]));
								await form.submit('http://exagic.com/postimage.php', function(err, resp) {
								if (err) {
									logger.info("Error : "+ err);
									res.jsonp({status:"Failure",
									message:"Error Uploading File",
									object:[]});
								  }else {
								   var body = '';
								   resp.on('data', function(chunk) {
									 body += chunk;
								   });
								   resp.on('end',async function() {
									 var urls = JSON.parse(body);
									 
										console.log("Url : "+urls);
										console.log("File Url : "+urls.imageurl);
										var fileUrl=urls.imageurl;    
									
										// regCtrl.completeProfile(req.body,fileUrl,res);
										//  tempFileName="";
										await AppController.addAttachment(req, fileUrl, res, function(data){
											//tempFileName="";
										}); 
									});
								  }
						 		});
							}
							
							
						}
						console.log('Clearing Temp File List');
						tempFileNamesList=[];

						res.jsonp({status:"success",
						message:"Picture/Pictures are Uploading.",
						object:[]});
					}
			
				}else{
				res.jsonp({status:"Failure",
				message:"No Files Found To Upload",
				object:[]});
				}


			}else{
				//reset flag
				notAnImageFlag=false;
				res.jsonp({status:"Failure",
				message:"Only Images are Allowed!",
				object:[]});
			}
				
			});

			 //Add New Attachment
			 app.post('/attachment', auth, function(req,res){
		
				if(req.body === undefined||req.body === null) {
				 res.end("Empty Body "); 
				 }
				 
				 console.log("in routes  /attachment");
				 
				 var upload = multer({
					 storage: storage,
					 fileFilter: function(req, file, callback) {
						 //Allow Only Image Files
						//  var ext = path.extname(file.originalname)
						//  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
						// 	 return callback(res.end('Only images are allowed'), null)
						//  }
						 callback(null, true)
					 }
				 }).single('file');
				 upload(req, res, async function(err) {
					 if (err){
						logger.info("Error Uploading File : " + err);
						res.jsonp({status:"Failure",
									message:"Error Uploading File",
									object:[]});
					 }else{        
						logger.info ("File Is uploaded");
						console.log(req.body.title);

						if(tempFileName){
							var form = new FormData();
							await form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
							await form.submit('http://exagic.com/postimage.php', function(err, resp) {
							if (err) {
								logger.info("Error : "+ err);
								res.jsonp({status:"Failure",
								message:"Error Uploading File",
								object:[]});
							  }else {
							   var body = '';
							   resp.on('data', function(chunk) {
								 body += chunk;
							   });
							   resp.on('end',async function() {
								 var urls = JSON.parse(body);
								 
									console.log("Url : "+urls);
									console.log("File Url : "+urls.imageurl);
									var fileUrl=urls.imageurl;    
								
									
									AppController.addAttachment(req, fileUrl, res, function(data){

										tempFileName="";
										if (data){
											res.jsonp({status:"success",
											message:"Attachment is successfully Uploaded.",
											object:data});
										}else{
											res.jsonp({status:"Failure",
											message:"Some Error occured while uploading attachment.",
											object:data});

										}
										
								   });  
								});
								  
							}
							 });
							 
						}	else{
							res.jsonp({status:"Failure",
								message:"Unable To find a file to Upload.",
								object:[]});
						}				 
						 
					}
				 
				 })
				 
			 });

			 
		
		//Upload new Back Up File
		app.post('/backup', auth, function(req,res){

		if(req.body === undefined||req.body === null) {
			res.end("Empty Body "); 
			}
			
			console.log("in routes  /backup");
			
			var upload = multer({
				storage: storage,
				fileFilter: function(req, file, callback) {
					//Allow Only Image Files
				//  var ext = path.extname(file.originalname)
				//  if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
				// 	 return callback(res.end('Only images are allowed'), null)
				//  }
					callback(null, true)
				}
			}).single('file');
			upload(req, res, async function(err) {
				if (err){
				logger.info("Error Uploading File : " + err);
				res.jsonp({status:"Failure",
							message:"Error Uploading File",
							object:[]});
				}else{        
				logger.info ("File Is uploaded");
				
				if(tempFileName){
					var form = new FormData();
					await form.append('image', fs.createReadStream( './/public//images//'+tempFileName));
					await form.submit('http://exagic.com/postimage.php', function(err, resp) {
					if (err) {
						logger.info("Error : "+ err);
						res.jsonp({status:"Failure",
						message:"Error Uploading File",
						object:[]});
						}else {
						var body = '';
						resp.on('data', function(chunk) {
							body += chunk;
						});
						resp.on('end',async function() {
								var urls = JSON.parse(body);
							
								console.log("Url : "+urls);
								console.log("File Url : "+urls.imageurl);
								var fileUrl=urls.imageurl;    
							
								
								AppController.addBackup(req, fileUrl, res, function(data){
									
									});  
							});
							
						}
						});
						
						res.jsonp({status:"success",
						message:"Backup InProgress.",
						object:{}});

					}else{

					res.jsonp({status:"Failure",
					message:"Unable To find a file to Upload.",
					object:[]});
				}				 
					
			}
			
			})
			
		});

		// GET ALL Backups
		app.get('/backup', auth, function(req,res){
			
			
			console.log("in routes get backup, Phone:  " + req.query.phoneNo);
			AppController.findBackupsByPhoneNum(req.query.phoneNo, function (backups) {

				console.log("Response Of findBackupsByPhoneNum Method");
				res.jsonp({status:"success",
							message:"List Of Backups",
							object:backups});
									
		});		
		});
	

		// **** API's for web User Panel 


		//Set Username Password
		app.post('/signup',function(req,res){

			if(req.body === undefined||req.body === null) {
				res.end("Empty Body "); 
			}
				
			console.log("in routes  /signup : " + req.body.phone);
			regCtrl.initialWebRegisteration(req, res);
			
		});
	
		app.post('/updateInfo',function(req,res){

			if(req.body === undefined||req.body === null) {
				res.end("Empty Body "); 
			}
				
			console.log("in routes  /updateInfo : " + req.body.phone);
			regCtrl.updateInfo(req, res);
			
		});

		// login to web panel
			
	app.post('/auth', async (req, res) => {
		let email = req.body.email;
		let password = req.body.password;
	
		// const { error } = validate(req.body);
		// if (error) return res.status(400).send(error.details[0].message);
	
		let user = await User.findOne({ email : email });
		// if (!user) return res.status(400).jsonp({ status: 'Failure', message: 'No User Found With Provided Email, Please Register First.' , object: []});
		if (!user)
			res.jsonp({
			status : "Failure",
			message : "No user found with provided email, Please register first.",
			object : []
			});

		console.log('found a user', user.email);
	
		const validPassword = await bcrypt.compare(password, user.password);
		//if (!validPassword) return res.status(400).jsonp({ status: 'Failure', message: 'Invalid Password.' , object: []});

		if (!validPassword)
			res.jsonp({
			status : "Failure",
			message : "Invalid password, Please try again with correct password.",
			object : []
			});

		const token = user.generateAuthToken();
		res.setHeader('x-auth-token', token);
		res.jsonp({
		status : "success",
		message : "successfully Logged In",
		object : user
		}); 
	
	});


	
	 // getting List of Friends 
	 app.post('/friends',function(req,res){
      	
		logger.info("in routes get friend");
		var phoneNo= req.body.phoneNo;
		AppController.findFriendsByPhoneNum(phoneNo,function (friends) {
            logger.info("Response Of findFriendsByPhoneNum Method");
			 res.jsonp({status:"success",
                        message:"List Of Friends",
                        object:friends});
                             
	});		
	});

	
	// GET chats of a user
	app.post('/chat',function(req,res){
		
		var mobileNo= req.body.phoneNo;
		var page= req.body.page;
	
		console.log("in routes get chat");
		ChatController.findChats(mobileNo, page, function (chats) {
			console.log("Response Of findChats Method");
			res.jsonp({status:"success",
						message:"List Of Conversations",
						object:chats});
								
	});		
	});

		
	// GET conversations against a Cpnversation id
	app.get('/message',function(req,res){
		
		var conversationId= req.query.conversationId;
		var messageId= req.query.messageId;
	
		console.log("in routes get message");
		ChatController.findMessagesByConversationId(conversationId, messageId, function (messages) {
			console.log("Response Of findMessages Method");
			res.jsonp({status:"success",
						message:"List Of Conversation Messages",
						object:messages});
								
	});		
	});

	
	// Test Apis
		// GET Dummy Marker Notification
		app.post('/dummymarkernotification',function(req,res){
		
			var phone= req.body.phoneNo;
			var query = { phone : phone };

			var markerObj ;
											  
			User.findOne(query).exec(function(err, user){
				if (err){
				 logger.error('Some Error occured while finding user' + err );
				 }
				if (user){

				logger.info('User Found For Phone No: ' + phone );
				logger.info('Sending Notification to player id ' + user.palyer_id );
				Marker.find({}, function(err, markers) {
					if (err){
						logger.info('An Error Occured While Finding Markers '  + err);
						res.jsonp({status:"failure",
						message:"Unable to send Dummy notification",
						object:[]});
					}			
					else{ 
						markerObj ={
				
							_id:markers[0]._id,
							title:markers[0].title,
							description:markers[0].description,
							description_arb:markers[0].description_arb,
							description_eng:markers[0].description_eng,
							marker_photo_url:markers[0].marker_photo_url,
							marker_audio_url:markers[0].marker_audio_url,
							longitude:markers[0].loc[0],
							latitude:markers[0].loc[1],		
							//loc:markers[0].loc,		
							radius:markers[0].radius,
							updatedAt:markers[0].updatedAt,
							createdAt:markers[0].createdAt,
							__v:markers[0].__v
							
							
					}
						//logger.info(markers.length + ' Marker Found');
						NotificationController.sendNotifcationToPlayerId(user.palyer_id,markerObj,"reachedMarker");	
						console.log("");
						res.jsonp({status:"success",
							message:"Sending Dummy Marker Notification to device",
							object:[]});	
					} 
					});
				
				}
				else {
				 logger.info('User not Found For Phone No: ' + phone );     
				 res.jsonp({status:"failure",
				 message:"User not Found For Phone No: " + phone ,
				 object:[]});            
				}                               
			});
	
		});

	function validate(req) {
		const schema = {
		email: Joi.string().min(5).max(255).required().email(),
		password: Joi.string().min(5).max(255).required()
		};
		return Joi.validate(req, schema);
	}
	
		  
};


