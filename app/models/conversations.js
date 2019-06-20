const mongoose = require('mongoose');
const CONFIG = require('../config')

var Schema = mongoose.Schema;


var ConversationSchema = new Schema( {
    messages: { type: Array},
    participants: {type: Array}
})

//Se adauga schema sub forma de "Colectie" in baza de date
var Conversation = mongoose.model( "conversations", ConversationSchema )
//Se exporta modelul de control
module.exports =  Conversation;