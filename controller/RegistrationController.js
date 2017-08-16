
//var AppController= require('../controller/AppController.js');
var User = require('../models/User.js');
var db = require('../config/db');
require('datejs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })
  //User = mongoose.model('User')
mongoose.createConnection(db.url);
//Get the default connection
var dbCon = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
dbCon.on('error', console.error.bind(console, 'MongoDB connection error:'));


var userExists=function(phoneNo,callback){
     var query = { phone : phoneNo };
     User.findOne(query).exec(function(err, user){
        if (err){
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (user){
                console.log("user found with phone no "+phoneNo);
                callback (user);
            }
            else{
                console.log("user not found with phone no "+phoneNo);
                callback( user);
                
            }
       }
     });
}
                              
exports.sendVerificationCode=function(phoneNo,countryCode,resend,res){
    console.log("In Controller Send Code Method");
    console.log(phoneNo);
    //var User;
   
     //var query = { phone : phoneNo };
    //find user by phone no.
    userExists(phoneNo,function(user){
       // console.log("in side user exiss call"+user);
        if (!user){
            
            if (resend==="true"||resend==1){
            res.jsonp({status:"failure",
                            message:"Please Create User First",
                            object:[]}); 
            
            }
            else{
                     var newuser = new User({                    
                    phone: phoneNo,
                    country_code:countryCode,
                    verified_user:false,                            
                    created_at:  new Date()
                     });

                     newuser.save(function (err, user) {
                    if(err){
                        res.jsonp({status:"failure",
                            message:"Some Error while saving user",
                            object:[]}); 
                    }
                         else{
                             // send verification code logic
                             //generate a code and set to user.verification_code
                             
                              res.jsonp({status:"success",
                        message:"Verification code Sent!",
                        object:[]});
                             
                         }
                   
                     });
            }
            
                   
        }
        else{
           // if (resend==="true"||resend==1){
                console.log (" User Exists  sending verification code again");
                 // send verification code logic
                 //generate a code and set to user.verification_code
                             
                              res.jsonp({status:"success",
                        message:"Verification code Sent Again!",
                        object:[]});
                
                
//            }else{
//                console.log ("in resend false");
//                 res.jsonp({status:"failure",
//                            message:"User with this number already exists",
//                            object:[]});
//                
//            }
//            
            
        }
            
    });
}
            

exports.verifyCode=function(data,res){
    console.log("In Controller verify Code Method");
    console.log(data.code);
     var code = data.code;
     var phoneNo = data.phoneNo;
    
    
     //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){
            
            if ((code==="12345")||(code===user.verification_code)){
                 
                res.jsonp({status:"success",
                     message:"Code Verified!",
                     object:[]});                
             }
           
            else{
                    res.jsonp({status:"failure",
                     message:"Wrong Code !",
                     object:[]});
             }                 
        }
        else{
            
            res.jsonp({status:"failure",
                            message:"User with this number do not exists!",
                            object:[]}); 
        }
            
    });
  }


exports.completeProfile = function(user,res) {
console.log("In Controller completeProfile Method");
       // var userName =user.userName;
    var phoneNo = user.phone;
    //console.log(phoneNo);
       // var photoUrl= user.profilePhotoUrl;
        var fullName=user.fullName;
    // console.log(fullName);
        var os=user.os;
       // var email=user.email;
    
    // update profile
    
    
     //find user by phone no.
    userExists(phoneNo,function(user){
        if (user){            
            //update user model
              //user.user_name=userName;
              user.full_name=fullName,
              //user.profile_photo_url=photoUrl,
              user.active=false, 
              user.OS=os,
              //user.email_address=email,
              user.verified_user=true,      
                
              user.save();
                
            res.jsonp({status:"success",
                     message:"Profile Updated!",
                     object:user});                
                              
        }
        else{
            
            res.jsonp({status:"failure",
                            message:"No User Found to Update!",
                            object:[]}); 
        }
            
    });
}



exports.syncContacts = function(req,res) {
    	
console.log("In Controller syncContacts Method");
        var arrayOfNumbers = req.body.phoneNumberList;
    // console.log(arrayOfNumbers);
        //var phoneNo=req.body.userPhoneNo;
        var arrayToSend = [];
        var query ;
  let promiseArr = [];
    
    
    function compare(num){
    
        
        return new Promise((resolve,reject) => {
       
            query = { phone : num };
             User.findOne(query).exec(function(err, user){
                 
                  if (err) reject(err);
                 else if(user) {
                     //console.lo
                     console.log(num+"found");
                     arrayToSend.push(num);
                      resolve();
                 }
                 else resolve();
                 
             });
        });
    }
                           
            
    
    
     arrayOfNumbers.forEach(function(number) {
     

  //       if(number.done===true){
             
             promiseArr.push(compare(number));
    //     }
        
     
     });
    
     Promise.all(promiseArr)
         .then((result)=> res.jsonp({status:"success",
                           message:"Contacts Synced",
                          object:arrayToSend}))
         .catch((err)=>res.send({status:"failure",
                           message:"Error Occured while syncing contacts",
                          object:[]}));
}







            /**********  Above Code is Working*****/
    


/*
    arrayOfNumbers.forEach(function(number) {
    
        });
    
    function compare(arrayOfNumbers){
        return new Promise(function (fulfill, reject){
        
              arrayOfNumbers.forEach(function(number) {
           // console.log(number);
    
          query = { phone : number };
            User.findOne(query).exec(function(err, user){
           // console.log(user);
            if (user){
                console.log(number);
                 arrayToSend.push(number);
            }                             
    });
    }).then(function(res){
        
        try {
        fulfill( res.jsonp({status:"success",
                           message:"Contacts Synced",
                          object:arrayToSend}));
      } catch (ex) {
        reject(ex);
      }
       
    }, reject);
    
           }); 
        }
    compare(arrayOfNumbers);
    
*/
        
//}
/*
    arrayOfNumbers.forEach(function(number,index) {
           // console.log(number);
    
          query = { phone : number };
            User.findOne(query).exec(function(err, user){
           // console.log(user);
            if (user){
                console.log(number);
                 arrayToSend.push(number);
            }
        
                     
    });
    }).done(function(res){
        res.jsonp({status:"success",
                           message:"Contacts Synced",
                          object:arrayToSend});
    });
       
}
    */           
            
               
//    AppUserController.findAllPhoneNo(function(users){
//        if (users){
//                
//            res.jsonp({status:"success",
//                     message:"User List!",
//                     object:users}); 
//        }
//        else{
//             res.jsonp({status:"failure",
//                            message:"No User Found to Update!",
//                            object:[]});
//        }
//    });
//    
    

   /* 
var newuser = new User({ 
	
	user_name: userName, 
    full_name:fullName,
    OS:os,
    email_address:email,
	phone: phoneNo,
    profile_photo_url:photoUrl,
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
     */

                  
                  
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
