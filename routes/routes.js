var regCtrl= require('../controller/RegistrationController.js');
var userGroupCtrl= require('../controller/UserGroupsController.js');
var AppController= require('../controller/AppController.js');
var bodyParser = require('body-parser');
var Country = require('../models/Country.js');
var db = require('../config/db');
require('datejs');
var mongoose = require('mongoose');
var path = require('path');
var multer = require('multer');
var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, './uploads')
	},
	filename: function(req, file, callback) {
		console.log(file)
		callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
	}
});

mongoose.Promise = global.Promise;

mongoose.createConnection(db.url);

//Get the default connection
var dbCon = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
dbCon.on('error', console.error.bind(console, 'MongoDB connection error:'));


// CHANGE API CONVENTION- NO CamelCase, no verbs.....

module.exports = function(app) {
		//app.use(bodyParser);
	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded())

	// parse application/json
	app.use(bodyParser.json())
	
	app.get('/', function(req, res) {

		res.end("Node-Aldallah-Project"); 
	});


    	app.get('/verificationcode',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
            let phoneNo = req.query.phoneNo;
            let country = req.query.countryId;
            let resend = req.query.resend;
		console.log("in routes /verificationcode ");
		//var reqData=req.body;
         console.log(phoneNo+country+resend);
             regCtrl.sendVerificationCode(phoneNo,country,resend,res);	
	
	});
    
    
    app.post('/verificationcode',function(req,res){
		
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


	app.put('/profile',function(req,res){
		
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
		res.end('File is uploaded')
	})
		var userData=req.body;
         console.log(userData);
		regCtrl.completeProfile(userData,res);		
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
    
    app.post('/photo', function (req, res) {
  // req.file is the `avatar` file 
  // req.body will hold the text fields, if there were any
        
   var upload = multer({
		storage: storage,
		fileFilter: function(req, file, callback) {
			var ext = path.extname(file.originalname)
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg' && ext !== '.PNG' && ext !== '.JPG' && ext !== '.GIF' && ext !== '.JPEG') {
				return callback(res.end('Only images are allowed'), null)
			}
			callback(null, true)
		}
	}).single('userFile');
	upload(req, res, function(err) {
		res.end('File is uploaded')
	})
});
    
    app.get('/country',function(req,res){
//		  console.log("start"); 
//	      var country = new Country({  
//                    country_id:3,
//                    name: "England", 
//                    code:"044",
//                    shortForm:"UK"
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
	})

    	app.post('/group',function(req,res){
		
	   if(req.body === undefined||req.body === null) {
        res.end("Empty Body"); 
        }
		console.log("in routes");
		var reqData=req.body;
         console.log(reqData);
		userGroupCtrl.createGroup(reqData,function (found) {
            console.log("Response Of createGroup Method");
			console.log(found);
			res.json(found);
	});		
	});
	
};


