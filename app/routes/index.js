const express = require('express');
const JWT = require("jsonwebtoken")

const CONTROLLER = require('../controller/index')
const CONFIG = require("../config")
const User = require("../models/users");
const router = express.Router();

const nodemailer = require('nodemailer');
const mailValidator = require('email-validator');

router.get('/healthcheck', (req, res) => {
	res.status(200).json({message: "Server is alive"})
})


const middleware = (req, res, next) => { 
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
                         myEmail = undefined;
                          return myEmail ;
                    } else {
						//res.send( { message: "Valid token", authorized: true } );
                        req.email = payload.email;
                        req.token = token
                         //toate accesarile pentru backend trec pe aici, deci putem introduce aici functia de a update Last Activity
                         User.updateOne({ email: payload.email }, { $set: { last_activity: Date.now().toString() } })
                                .then(data => {
                                    if (data == null) {
                                    console.log("Empty data", data);
                                    }
                            
                                    console.log("Update last activity: ", data);
                                })
                                .catch(err => {
                                    console.log("Error in DB", err);
                                });
                        next( );
                      
                    }
                } 
            )
}

router.use("/confirm/:token", middleware);
router.use("/stopdata", middleware);
router.use("/conversation", middleware);
router.use("/convFragment", middleware);
//router.use("/setconversationseen", middleware);
router.use("/sendfriendrequest", middleware);
router.use("/revokefriendrequest", middleware);
router.use("/deniedfriendrequest", middleware);
router.use("/acceptfriendrequest", middleware);
router.use("/removefriend", middleware);
router.use("/addMessage", middleware);
router.use("/changeprofile", middleware);
router.use("/changecolorprofile", middleware);

router.get("/confirm/:token" , CONTROLLER.confirmToken);
//router.get("/users" , CONTROLLER.users);
router.post("/stopdata" , CONTROLLER.stopData);
router.get("/conversation", CONTROLLER.conversation);
router.get("/convfragment", CONTROLLER.convFragment);
//router.get("/setconversationseen", CONTROLLER.setConversationSeen);
router.post("/sendfriendrequest", CONTROLLER.sendFriendRequest);
router.post("/revokefriendrequest", CONTROLLER.revokeFriendRequest);
router.post("/deniedfriendrequest", CONTROLLER.deniedFriendRequest);
router.post("/acceptfriendrequest", CONTROLLER.acceptFriendRequest);
router.post("/removefriend", CONTROLLER.removeFriend);
router.post("/addMessage", CONTROLLER.addMessage);
router.post("/changeprofile", CONTROLLER.changeProfile);
router.post("/changecolorprofile", CONTROLLER.setColor);

router.post("/checktoken", CONTROLLER.checkToken);

router.post("/register", CONTROLLER.register);
router.post("/login", CONTROLLER.login);

module.exports = router;