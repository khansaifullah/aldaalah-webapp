var mongoose = require('mongoose');

// Define our Wallpaper Schema 
var WallpaperSchema   = new mongoose.Schema({
   
    title:String,
   photoUrl: String
       	
}, {timestamps: true});

// Export the Mongoose model
module.exports = mongoose.model('Wallpaper', WallpaperSchema);
