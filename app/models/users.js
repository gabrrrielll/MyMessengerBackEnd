const mongoose = require('mongoose');
const CONFIG = require('../config')
//Se face conexiunea la baza de date cu mongoose
mongoose.connect(CONFIG.DB_ADDRESS, { useNewUrlParser: true })
.then(data => {
	console.log("Connected to DB")
})
.catch(err => {
	console.log(err);
})
//Se extrage contructorul de schema
var Schema = mongoose.Schema;

//Se creeaza schema utilizatorului cu toate constrangerile necesare
var UserSchema = new Schema( {
	username: { type: String, required: true, unique: true,  minlength: 3, maxlength: 50},
	email: { type: String, required: true, unique: true,  minlength: 3, maxlength: 50 },
	firstname: { type: String ,  minlength: 3, maxlength: 50},
	lastname: { type: String ,  minlength: 3, maxlength: 50},
	mail_confirm: { type: Boolean },
	password: { type: String, required: true , select: false,  minlength: 1, maxlength: 30},
	tel: { type: Number,  minlength: 6, maxlength: 15},
	photo: { type: String ,  minlength: 4, maxlength: 300},
	friends: { type: Array  },
	friends_requests: { type: Array  },
	requests_sent: { type: Array },
	last_activity: { type: Number},
	color: { type: String}
} )

//Se adauga schema sub forma de "Colectie" in baza de date
var User = mongoose.model("users", UserSchema);


//Se exporta modelul de control
module.exports = User;