// grab the things we need
var Country = require('./Country');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose.Promise = global.Promise;
// create a schema

//mongoose.createConnection('mongodb://localhost/aldaalah');

var userSchema = new Schema({
  
   // _id: String,
   // username: { type: String, required: true, unique: true },
      user_name: String, 
      phone: { type: String, required: true, unique: true },
      full_name: String,
      profile_photo_url:String,
      active:Boolean, 
      OS:String,
      email_address:String,
      verified_user:Boolean,
      country_code:String,
      created_at:Date,
      verification_code:String,
      app_id:String
      //gps_location_lat: ,
     // gps_location_long: ,
  //updated_at: Date
});

//userSchema.index({phone:1})


// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;