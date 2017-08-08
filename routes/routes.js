var regCtrl= require('../controller/RegistrationController.js');
var userGroupCtrl= require('../controller/UserGroupsController.js');
var bodyParser = require('body-parser');


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
            let country = req.query.country;
		console.log("in routes /verificationcode ");
		//var reqData=req.body;
         console.log(phoneNo+country);
             regCtrl.sendVerificationCode(phoneNo,country,res);	
	
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
		var userData=req.body;
         console.log(userData);
		regCtrl.completeProfile(userData,res);		
	});

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


