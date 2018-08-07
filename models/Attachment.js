var mongoose = require('mongoose');
var User = require('./User');
var Conversation = require('./Conversation');

// Define our schema
var attachmentSchema   = new mongoose.Schema({
    attachmentType: String,
    attachmentTitle: String,
    attachmentUrl: String,
    _conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    _attachmentToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
    _attachmentFromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _attachmentFromMobile: String,
    _attachmentToMobile: {type : String, default :null },
    attachmentDeliverStatus: { type: Boolean, default: false },
    deletedByUserMobile: String,
}, {timestamps: true});
attachmentSchema.index({_conversationId:1, _attachmentToUserId: 1, _attachmentFromUserId: 1, _attachmentFromMobile: 1,createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('Attachment', attachmentSchema);