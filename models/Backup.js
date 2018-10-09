var mongoose = require('mongoose');
var User = require('./User');

// Define our schema
var backupSchema   = new mongoose.Schema({
    
   
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
    userMobile: {type : String, default :null },
    downloadedCount: { type: Number, default: 0 },
    backUpFileUrl: String,
}, {timestamps: true});
backupSchema.index({_userId:1, userMobile: 1})
// Export the Mongoose model
module.exports = mongoose.model('Backup', backupSchema);