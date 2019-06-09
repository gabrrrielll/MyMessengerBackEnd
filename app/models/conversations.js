const mongoose = require('mongoose');
const CONFIG = require('../config')
//Se face conexiunea la baza de date cu mongoose
/* mongoose.connect(CONFIG.DB_ADDRESS, { useNewUrlParser: true })
.then(data => {
	console.log("Connected to CONVERSATION")
})
.catch(err => {
	console.log(err);
}) */
//Se extrage contructorul de schema
var Schema = mongoose.Schema;


var ConversationSchema = new Schema( {
    messages: { type: Array},
    participants: {type: Array}
})

//Se adauga schema sub forma de "Colectie" in baza de date


var Conversation = mongoose.model( "conversations", ConversationSchema )
//Se exporta modelul de control
module.exports =  Conversation;