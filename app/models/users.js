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
	username: { type: String, required: true, unique: true},
	email: { type: String, required: true, unique: true },
	firstname: { type: String },
	lastname: { type: String },
	mail_confirm: { type: Boolean },
	password: { type: String, required: true },
	tel: { type: String},
	photo: { type: String },
	friends: { type: Array  },
	last_activity: { type: String }	
} )

//Se adauga schema sub forma de "Colectie" in baza de date
var User = mongoose.model("users", UserSchema);


//Se exporta modelul de control
module.exports = User;