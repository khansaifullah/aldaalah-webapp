const jwt = require('jsonwebtoken');
const config = require('config');
const util = require('util');
var logger = require('./../config/lib//logger.js');
var AppController= require('./../controller/AppController.js');
var mongoose = require('mongoose');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) 
  //return res.status(401).send('Access denied. No token provided.');
  return res.jsonp({status:"Failure",
  message:"Access denied. No token provided.",
  object:[]});
  var phoneNo;
  if (req.query.phoneNo)
    phoneNo=req.query.phoneNo;
    
    // Parsing Required on server side
  // if (req.body.phoneNo)
  // phoneNo=JSON.parse(req.body.phoneNo);

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

    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
     AppController.userExists(phoneNo,async function (user) {
       if (user){
        var userId = mongoose.Types.ObjectId(user._id);
        var decodedId = mongoose.Types.ObjectId(decoded._id);
 
        if (userId.equals(decodedId)){
          logger.info('User is authentic');
          req.user = decoded; 
          next();
         
         }else{
          logger.info('Token provided is not valid for this user.');
         // res.status(400).send('Token provided is not valid for this user.');
         return res.jsonp({status:"Failure",
          message:"Token provided is not valid for this user.",
          object:[]});
         }
       }else{
          logger.info('Unable to find user.');
          return res.jsonp({status:"Failure",
         message:"Unable to find user.",
         object:[]});
       }
          
    });

    next();
  }
  catch (ex) {
    // res.status(400).send('Invalid token.');
    logger.info('Exception Occured.' + ex);
    return res.jsonp({status:"Failure",
    message:"Invalid token.",
    object:[]});
   
  }
}