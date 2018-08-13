// grab the things we need
var mongoose = require('mongoose');
var User = require('./User');

var friendSchema = new mongoose.Schema({
 
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    _friendId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

}, {timestamps: true});

var Friend = mongoose.model('Friend', friendSchema);

// make this available to our users in our Node applications
module.exports = Friend;