var mongoose = require('mongoose');
 	var Schema = mongoose.Schema;

	var UserSchema = new Schema({
	  username: { type: String},
	  pwd: { type: String},
	  email: { type: String},
	  nickname: { type: String }
	},{ collection: 'user'});

mongoose.model('user', UserSchema);
