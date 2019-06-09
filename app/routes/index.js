const express = require('express');

const CONTROLLER = require('../controller/index')

const router = express.Router();

const nodemailer = require('nodemailer');
const mailValidator = require('email-validator');


router.get('/healthcheck', (req, res) => {
	res.status(200).json({message: "Server is alive"})
})

router.post("/register", CONTROLLER.register);
router.post("/login", CONTROLLER.login);
router.get("/confirm/:token" , CONTROLLER.confirmToken);
router.get("/users" , CONTROLLER.users);
router.post("/sendFriendsRequest", CONTROLLER.sendFriendsRequest);
router.post("/acceptFriendsRequest", CONTROLLER.acceptFriendsRequest);
router.post("/removeFriend", CONTROLLER.removeFriend);
router.get("/conversation", CONTROLLER.conversation);
router.get("/lastconversation", CONTROLLER.lastConversation);
router.post("/addMessage", CONTROLLER.addMessage);


module.exports = router;