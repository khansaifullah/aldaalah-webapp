const jwt = require('jsonwebtoken');
const config = require('config');
const util = require('util');
var logger = require('./../config/lib//logger.js');
var AppController= require('./../controller/AppController.js');
var mongoose = require('mongoose');

module.exports = function (req, res) {
  // bodyParser.urlencoded({ 	extended: true });
  return new Promise(function (resolve, reject)   {
  const contentTypeheader = req.header('content-type');
  const token = req.header('x-auth-token');
   if (!token) 
   resolve();
  //return res.status(401).send('Access denied. No token provided.');
  // return res.jsonp({status:"Failure",
  // message:"Access denied. No token provided.",
  // object:[]});

  logger.info('contentTypeheader: ' + contentTypeheader);
  logger.info('token: ' + token);
  logger.info('req.body: ' + req.body.phone);
  var phoneNo;
  if (req.query.phoneNo)
    phoneNo=req.query.phoneNo;

  if (req.body.phoneNo)
  phoneNo=req.body.phoneNo;
  
  if (req.query.phone)
    phoneNo=req.query.phone;
    
    
    // Parsing Required on server side
  // if (req.body.phone)
  // phoneNo=JSON.parse(req.body.phone);

  if (req.body.phone)
  phoneNo=req.body.phone;

  logger.info("Phone #: " + phoneNo);

  try {

    if (phoneNo){
      const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
      AppController.userExists(phoneNo,async function (user) {
        if (user){
          var userId = mongoose.Types.ObjectId(user._id);
          var decodedId = mongoose.Types.ObjectId(decoded._id);
  
          if (userId.equals(decodedId)){
            logger.info('User is authentic');
            req.user = decoded; 
            resolve();
           // next();
          
          }else{
            logger.info('Token provided is not valid for this user.');
            resolve();
          // res.status(400).send('Token provided is not valid for this user.');
            // res.jsonp({status:"Failure",
            // message:"Token provided is not valid for this user.",
            // object:[]});
          }
        }else{
            logger.info('Unable to find user.');
            resolve();
          // res.jsonp({status:"Failure",
          // message:"Unable to find user.",
          // object:[]});
        }
            
      });
    }else {
       logger.info('Phone No.' + phoneNo);
       resolve();
      // res.jsonp({status:"Failure",
      // message:"Phone No. Not found",
      // object:[]});

    }


  }
  catch (ex) {
    // res.status(400).send('Invalid token.');
    logger.info('Exception Occured.' + ex);
    reject();
    // res.jsonp({status:"Failure",
    // message:"Invalid token.",
    // object:[]});
   
  }
});
}