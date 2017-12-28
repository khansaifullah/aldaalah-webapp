var mongoose = require('mongoose');

// Define our markers  Category schema
var MarkerCategorySchema   = new mongoose.Schema({
   
    title:String
       	
}, {timestamps: true});

// Export the Mongoose model
module.exports = mongoose.model('MarkerCategory', MarkerCategorySchema);
