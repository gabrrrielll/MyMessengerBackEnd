const JWT = require('jsonwebtoken');
//const JWT_SECRET_KEY = "1q7PmGH04phLl5k6c2AisEda2y286UtKPxwrCz3T1M";
const User = require('../models/users')
const Conversation = require('../models/conversations')
const CONFIG = require("../config");

const nodemailer = require('nodemailer');

const register = (req, res) => {
	if (req.body && req.body.username && req.body.password && req.body.email) {
		var newUser = new User({
			username: req.body.username,
            email: req.body.email,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
			mail_confirm: false,
			password: req.body.password,
			tel: req.body.tel,
            photo: req.body.photo,
            friends: []
			
		})

		newUser.save((err, result) => {
			if (err) {
				console.log(err);
				res.sendStatus(409);
			} else {
				 //Se creaza obiectul de configurare SMTP
                    //Acest obiect contine configuratiile necesare pentru conectarea la serverul de SMTP
                    var smtpConfig = {
                        service: 'Gmail', //serviciul care se foloseste
                        host: 'smtp.gmail.com', //adresa serverului SMTP
                        port: 465, //Portul 465 reprezinta portul SMTPS, sufixul S reprezinta SECURED
                        secure: true, //Se activeaza protocolul securizat
                        auth: { //credentialele de autentificare la serverul SMTP
                            user: "nodejsappcontact@gmail.com",
                            pass: "Parola123!"
                        }
                    }
                    //Se creaza token-ul pe care-l trimitem pe mail la utilizator
                    var confirmToken = JWT.sign({confirm: true, email: req.body.email}, CONFIG.JWT_SECRET_KEY);
                    //Se creaza corpul mesajului cu toate campurile necesare
                    var mailOption = {
                        from: "nodejsappcontact@gmail.com",
                        to: req.body.email,
                        subject: "Account verification token",
                        text: "Please verify email, click on link",
                        html: "<p>For register on messenger, please click  <a href='http://localhost:4000/confirm/"+confirmToken+"'><b>HERE</b></a> to verify your email.</p>"
                    }
                    //Se initializarea componenta de transport cu configuratiile definite mai sus
                    var transporter = nodemailer.createTransport(smtpConfig);
                    //Se trimite mesaul
                    transporter.sendMail(mailOption, (err, info) => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log("Mail was send to "+req.body.email+ " and response "+info.response);
                        }
                    })
                    res.send({statusCode: 200, mesaj: "Register with succes! <br /> Now you have to click the link received in your mail to activate the account."});
			}
		})
	} else {
		res.status(422).json({message: "Please provide all data for register process"})
	}
}

const confirmToken = (req, res) => {
    checkToken( req, res );
    if ( !emailUser  ) return;

        User.updateOne({email: emailUser}, 
                                        {$set: {mail_confirm: true}})
            .then(data => {
                res.send("Your account was activated! You must now login <a href ='http://localhost:3000/' ><b>here</b></a>");
            })                     
            .catch(err => {
                console.log("Eroare la actualizarea bazei de date")
                console.log(err);
                res.sendStatus(500);
            })

}
const login = (req, res) => {
	if (req.body && req.body.email && req.body.password) {
		User.findOne({
			email: req.body.email,
            password: req.body.password,
            mail_confirm: true
		})
		.then(result => {
			if (result == null) {
				res.status(401).json({message: "Wrong combination"})
			} else {
				var TOKEN = JWT.sign({
					email: req.body.email,
					exp: Math.floor(Date.now() / 1000) + CONFIG.JWT_EXPIRE_TIME
				},
				CONFIG.JWT_SECRET_KEY);

				res.status(200).json({token: TOKEN})
			}
		})
	} else {
		res.status(422).json({message: "Provide all data"})
	}
}
const checkToken = ( req, res ) => {
    if  (req.headers[ 'token' ] ) {
        var token = req.headers[ 'token' ];
    } else if ( req.params.token ) {
        var token =  req.params.token;
    } else if ( req.body.token) {
        var token = req.body.token;
    } else {
        res.status( 403 );
        res.send( { message: "Token empty", authorized: false } );
        return;
    }
            // console.log( "tokenul este:" , token)
            JWT.verify( token, CONFIG.JWT_SECRET_KEY, ( error, payload ) => {
                 if ( error ) {
                        res.status( 403 );
                         res.send( { message: "Invalid token", authorized: false } );
                         emailUser = undefined;
                          return emailUser ;
                    } else {
                        //res.send( { message: "Valid token", authorized: true } );
                         emailUser = payload.email;
                          return emailUser;
                    }
                } 
            )
        
}

const users = ( req, res ) => {
    checkToken( req, res );
    if ( !emailUser  ) return;
      
        if(req.body.email){
            console.log(req.body.email)
            User.find( {  
                // "email": { $in: [ req.body.email ] }
                } )
                .then( users => {
                            if( users ){
                                User.find( {  
                                    "email": { $nin: [ emailUser ] }
                                } )
                                .then( friends => {
                                            if( friends ){
                                                res.send( { sugestions: users , friends: friends} )

                                            } else{
                                                res.send( {useri: "no users"} )

                                            }
                                    
                                })
                                .catch( err => {
                                            //console.log( err );
                                            res.sendStatus( 500 );
                                })

                            } else{
                                res.send( {useri: "no users"} )

                            }
                    
                })
                .catch( err => {
                        // console.log( err );
                            res.sendStatus( 500 );
                })
        } else{
            User.find( {  
               //email: { $nin: [ emailUser ] },
             //  friends: {  $in:   [ { email: emailUser,  status: false } ] }
                } )
                .then( sugestions => {

                            if( sugestions ){
                                User.find( {  
                                    // "email": { $nin: [ payload.email] }
                                    friends: {  $in:   [ { email: emailUser,  status: true } ] }
                                    } )
                                    .then( friends => {
                                        if ( friends ) {
                                            User.find( {  
                                                // "email": { $nin: [ payload.email] }
                                                friends: {  $in:   [ { email: emailUser,  status: false } ] }
                                                } )
                                                .then( requestSent => {
                                                            if( requestSent ){
                                                                User.find( {  
                                                                     email: { $nin: [ emailUser ] },
                                                                    friends: {  $in:   [ { email: emailUser, status: false } ] }
                                                                    } )
                                                                    .then( requests => {
                                                                                if( requests ){
                                                                                    res.send( { sugestions: sugestions , friends: friends, requestSent : requestSent, requests: requests  } )
                                
                                                                                } else{
                                                                                    res.send( { sugestions: sugestions , friends: friends, requestSent : requestSent, requests: requests } )
                                
                                                                                }
                                                                        
                                                                    })
                                                                    .catch( err => {
                                                                                //console.log( err );
                                                                                res.sendStatus( 500 );
                                                                    })
            
                                                            } else{
                                                                res.send( { sugestions: sugestions , friends: friends, requestSent : null, requests: null } )
            
                                                            }
                                                    
                                                })
                                                .catch( err => {
                                                            //console.log( err );
                                                            res.sendStatus( 500 );
                                                })

                                        } else {
                                            res.send( { sugestions: sugestions , friends: null, requestSent : null , requests: null } )
                                        }
                                        
                                                
                                        
                                    })
                                    .catch( err => {
                                                //console.log( err );
                                                res.sendStatus( 500 );
                                    })

                            } else{
                               res.send( { sugestions: null , friends: null, requestSent : null, requests: null } )

                            }
                    
                })
                .catch( err => {
                            //console.log( err );
                            res.sendStatus( 500 );
                })
        }  
                  
 }

const sendFriendsRequest = ( req, res ) => { 
    checkToken( req, res );
    if ( !emailUser  ) return;

     User.findOne( {  
        email: req.body.email,
        "friends": { $in: [  {  email : emailUser, "status": false} ] }  
       } )
       .then(sent => {
                    if (sent) {
                        //console.log("exista cerere trimisa", sent);
                        res.send({status: 200,sent, mesaj: "Exista o cerere deja"})
                    } else {
                        //creaza conversatia
                        createConversation( emailUser , req.body.email,  req.body.message );

                        console.log("emailUser , req.body.email,  req.body.mesage " ,emailUser , req.body.email,  req.body.message );
                        User.findOne({email: req.body.email})
                                .then (oldData =>{
                                    if (oldData) {
                    
                                        var newData =[...oldData.friends,  { email: emailUser , status: false } ] ;
                                        //console.log(newData);

                                        User.updateOne({email: req.body.email }, 
                                            { $set: { friends: newData } } )
                                        .then(data => {
                                            if (data == null) {
                                               // var requestSentEmail =null; 
                                                return res.sendStatus(401);
                                            }
                                            console.log(data);
                                            // var requestSentEmail = req.body.email ;
                                            //console.log(requestSent);
                                            res.send({status: 200,  mesaj: "Cererea a fost trimisa"})
                                        })
                                        .catch(err => {
                                            console.log("Eroare la interogarea bazei de date in vederea adaugarii unei cereri")
                                            //console.log(err);
                                            res.sendStatus(500);
                                        })

                                    }
                                })
                    .catch(err => {
                        console.log("Eroare la interogarea bazei de date")
                        console.log(err);
                        res.sendStatus(500);
                    })

                    }
       })
       .catch(err => {
        console.log("Eroare la interogarea bazei de date")
        console.log(err);
       // res.sendStatus(500);
    }) 
 }

const acceptFriendsRequest = ( req, res ) => { 
    checkToken( req, res );
    if ( !emailUser  ) return;

    User.findOne( {  
        email: req.body.email,
        "friends": { $in: [  {  "email" : emailUser, "status": false} ] } 
       } )
       .then(sent => {
                    if (sent) {
                        //console.log("exista cerere trimisa", sent);

                          User.findOne( { email: req.body.email } )
                                .then (oldData =>{
                                                if (oldData) {
                                
                                                                    //var newData =[...oldData.friends,  { email: payload.email, status: true } ] ;
                                                                    //console.log(newData);

                                                                    User.updateOne( { email: req.body.email }, 
                                                                        { $set: { friends: [ {email: emailUser,  status: true } ] } } )
                                                                    .then( data => {
                                                                        if ( data == null ) {
                                                                            return res.sendStatus( 401 );
                                                                        }
                                                                        
                                                                        var acceptedData = req.body.email
                                                                       // console.log(acceptedData);
                                                                        res.send( { status: 200, acceptedData, mesaj: "S-a acceptat prietenia"  })
                                                                    })
                                                                    .catch( err => {
                                                                        console.log("Eroare la interogarea bazei de date in vederea adaugarii unei cereri")
                                                                        //console.log(err);
                                                                        res.sendStatus(500);
                                                                    } )

                                                }
                                })
                                .catch(err => {
                                    console.log("Eroare la interogarea bazei de date")
                                    console.log(err);
                                    res.sendStatus(500);
                                }) 



                        //res.send({status: 200,sent, mesaj: "Exista o cerere deja"})
                    } else {
                        console.log("nu exista cerere trimisa");
                      

                    }
       })
       .catch(err => {
        console.log("Eroare la interogarea bazei de date")
        console.log(err);
       res.sendStatus(500);
    })
 }

const removeFriend = ( req, res ) => {
    checkToken( req, res );
    if ( !emailUser  ) return;

    User.findOne( {  
        email: req.body.email,
        friends: { $in: [  {  email : emailUser, status: true} ] }  
       } )
       .then(sent => {
                    if (sent) {
                        //console.log("exista cerere trimisa", sent);

                          User.findOne({email: req.body.email})
                                .then (oldData =>{
                                                if (oldData) {
                                
                                                                    //var newData =[...oldData.friends,  { email: payload.email, status: true } ] ;
                                                                    //console.log(newData);

                                                                    User.updateOne({email: req.body.email }, 
                                                                        { $set: { friends: [
                                                                            
                                                                        ] } } )
                                                                    .then(data => {
                                                                        if (data == null) {
                                                                            return res.sendStatus(401);
                                                                        }
                                                                        
                                                                        var acceptedData = req.body.email
                                                                       // console.log(acceptedData);
                                                                        res.send({status: 200, acceptedData, mesaj: "S-a sterst prietenia"})
                                                                    })
                                                                    .catch(err => {
                                                                        console.log("Eroare la interogarea bazei de date in vederea adaugarii unei cereri")
                                                                        //console.log(err);
                                                                        res.sendStatus(500);
                                                                    })

                                                }
                                })
                                .catch(err => {
                                    console.log("Eroare la interogarea bazei de date")
                                    console.log(err);
                                    res.sendStatus(500);
                                }) 



                        //res.send({status: 200,sent, mesaj: "Exista o cerere deja"})
                    } else {
                        console.log("nu exista cerere trimisa");
                      

                    }
       })
       .catch(err => {
        console.log("Eroare la interogarea bazei de date")
        console.log(err);
       res.sendStatus(500);
    })
}

const createConversation = ( myEmail, hisEmail, message ) => {
       var newConv = new Conversation({
       messages: [
                 {
                text: message,
                email: myEmail,
                time: Date.now()
                }
            ],
       participants: [ myEmail, hisEmail  ]
   })
   newConv.save( (err, newConv) =>{
       if (err) {
           console.log(err)
       } else {
        var convID = newConv._id;
           console.log("newConv:" , convID)
           return convID;
       }
   }); 
}

const addMessage = (req, res ) => {
    checkToken( req, res );
    if ( !emailUser  ) return;
    var myEmail = emailUser;
    var hisEmail = req.body.hisemail;
    var message = req.body.message;
//console.log( "xxxxxxxxxxxxxx" , hisEmail, message )

    Conversation.findOne(
        { $or: [ { participants: [ myEmail ,  hisEmail ] } , { participants: [ hisEmail , myEmail ] } ] }
        )
        .then (oldData =>{
            if (oldData) {
                var newMess= 
                    {
                text: message,
                email: myEmail,
                time: Date.now()
                }   
                var newData =[...oldData.messages, newMess ] ;
                   // console.log( "newData", newData);

                Conversation.updateOne(
                     { $or: [ { participants: [ myEmail ,  hisEmail ] } , { participants: [ hisEmail , myEmail ] } ] }, 
                    { $set: { messages:   newData   } } 
                    )
                    .then( data => {
                        if ( data == null ) {
                           
                            return res.sendStatus( 401 );
                        }
                        
                        setLastActivity( hisEmail );
                        res.send( { status: 200, mesaj: "Update succesfully!"  })
                    })
                    .catch( err => {
                        console.log("Eroare la interogarea bazei de date in vederea adaugarii unei cereri")
                        //console.log(err);
                        res.sendStatus(500);
                    } )

            }
        })
        .catch(err => {
        console.log("Eroare la interogarea bazei de date")
        console.log(err);
        res.sendStatus(500);
        }) 
}

const conversation = (req, res ) => {
     checkToken( req, res );
    if ( !emailUser  ) return;
    var myEmail = emailUser;
    var hisEmail = req.headers[ "hisemail" ]
 
    Conversation.findOne(
        { $or: [ { participants: [ myEmail ,  hisEmail ] } , { participants: [ hisEmail , myEmail ] } ] }
        )
        .sort(
            { time : -1   }
             )
        .then( data => {
            if ( data == null ) {
                return res.sendStatus( 401 );
            }
            
            // console.log(acceptedData);
            res.send( { status: 200, data, mesaj: "OK!"  })
        })
        .catch( err => {
            console.log("Eroare la interogarea bazei de date in vederea adaugarii unei cereri")
            //console.log(err);
            res.sendStatus(500);
        } )
     
}

const lastConversation = (req, res ) => {
    checkToken( req, res );
   if ( !emailUser  ) return;
   var myEmail = emailUser;
  // var hisEmail = req.headers[ "hisemail" ]
   //var message = req.body.message;
console.log("myEmail: " , myEmail )

   Conversation.find(
        {  participants:  { $in:  [ myEmail ] } } 
   )  
        
       .sort(
           { "messages": [ {time: -1}]   }
            ) 
            .limit( 5 )
         //  ( {$sort: { time : -1 } } )
          /*   Conversation.aggregate([
                 {"participants": ["$match": { "email": myEmail }]}, */
              /*   { "$addFields": {
                    "order": {
                        "$filter": {
                          "input": "messages",
                          "as": "p",
                          "cond": { "$max": [ "$p.time"] }
                        }
                    }
                }}, */
              //  { "$sort": { "time": -1 } } 

               /*  {
                    $group: {
                        // "$match": { "email": myEmail },
                        maxQuantity: {$max: "$time"}
                    }
                } */
           // ]) 
         //  .aggregate({ $group : { _id: null, max: { $max : "$time" }}})
                   .then( data => {
                       if ( data == null ) {
                           return res.sendStatus( 401 );
                       }
                       
                       // console.log(acceptedData);
                       res.send( { status: 200, data, mesaj: "OK!"  })
                   })
                   .catch( err => {
                       console.log("Eroare la interogarea bazei ")
                       //console.log(err);
                       res.sendStatus(500);
                   } )

    
}

const setLastActivity =( userEmail ) =>{
    User.updateOne( { email: userEmail }, 
        { $set: { last_activity: Date.now() } } )
    .then( data => {
        if ( data == null ) {
            console.log("Empty data", data);
        }
    
        console.log("Update last activity: ", data);
      
    })
    .catch( err => {
        console.log("Error in DB" ,err)
      
    } )
}
module.exports = {
	register,
	login,
    confirmToken,
    users,
    sendFriendsRequest,
    acceptFriendsRequest,
    removeFriend,
    conversation,
    checkToken,
    createConversation,
    lastConversation,
    addMessage,
    setLastActivity
}