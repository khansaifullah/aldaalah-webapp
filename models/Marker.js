var mongoose = require('mongoose');
//var User = require('./User');


// Define our markers schema
var MarkerSchema   = new mongoose.Schema({
   
    title:String,
    description:{type:String,default:null },
	marker_photo_url:{type:String,default:null },
	radius:Number,
	loc: {
	type: [Number],  // [<longitude>, <latitude>]
	index: '2d'      // create the geospatial index
	}
	
}, {timestamps: true});


MarkerSchema.index({loc:1})
// Export the Mongoose model
module.exports = mongoose.model('Marker', MarkerSchema);
