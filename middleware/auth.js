const jwt = require('jsonwebtoken');
const config = require('config');
const util = require('util');
var logger = require('./../config/lib//logger.js');
var AppController= require('./../controller/AppController.js');
var mongoose = require('mongoose');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');
  var phoneNo;
  if (req.query.phoneNo)
    phoneNo=req.query.phoneNo;
    
  if (JSON.parse(req.body.phoneNo))
  phoneNo=JSON.parse(req.body.phoneNo);

  if (req.body.phoneNo)
  phoneNo=req.body.phoneNo;
  
  if (req.query.phone)
    phoneNo=req.query.phone;
    
  if (JSON.parse(req.body.phone))
  phoneNo=JSON.parse(req.body.phone);

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

          req.user = decoded; 
          next();
         }else{
          res.status(400).send('Token provided is not valid for this user.');
         }
       }else{
        res.status(400).send('Unable to find user.');
       }
          
    });

  }
  catch (ex) {
    res.status(400).send('Invalid token.');
  }
}