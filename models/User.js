// grab the things we need
const config = require('config');
var Country = require('./Country');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
//mongoose.Promise = global.Promise;
// create a schema

//mongoose.createConnection('mongodb://localhost/aldaalah');

var userSchema = new Schema({
  
   // username: { type: String, required: true, unique: true },
      user_name: String, 
      phone: { type: String, required: true, unique: true },
      full_name: String,
      profile_photo_url:{type:String,default:null },
      active:Boolean, 
      OS:String,
      email:String,
      password:String,
      verified_user:Boolean,
	    deactivate_user:{ type: Boolean, default: false },
      country_code:String,
      verification_code:String,
      palyer_id:String,
      share_location:{ type: Boolean, default: true },
      share_loc_flag_time:{ type: Date, default: Date.now },
      alert_flag:{ type: Boolean, default: true },
      loc: {
        type: [Number],  // [<longitude>, <latitude>]
        index: '2d'      // create the geospatial index
        },
      last_shared_loc_time: { type: Date, default: Date.now },
      status: {type:String, default:"*I am using Aldaalah*" },
      _preferenceId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarkerCategory' },
      password: {
        type: String,
        minlength: 5,
        maxlength: 1024
      },
      city: String,
      country: String,
      gender: String,
      dob: Date

         
}, {timestamps: true});

userSchema.index({phone:1});
//userSchema.index({ loc: '2d' });

userSchema.methods.generateAuthToken = function() { 
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;