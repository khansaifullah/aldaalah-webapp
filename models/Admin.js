// grab the things we need

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const config = require('config');
const jwt = require('jsonwebtoken');
//mongoose.Promise = global.Promise;
// create a schema

var adminSchema = new Schema({

      user_name: { type: String, required: true, unique: true }, 
	password: String,
      phone: String,
      full_name: String,
      profile_photo_url:{type:String,default:null },
      email_address:String
    
}, {timestamps: true});

adminSchema.index({user_name:1});
adminSchema.methods.generateAuthToken = function() { 
      const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
      return token;
    }
    
// the schema is useless so far
// we need to create a model using it
var Admin = mongoose.model('Admin', adminSchema);

// make this available to our users in our Node applications
module.exports = Admin;