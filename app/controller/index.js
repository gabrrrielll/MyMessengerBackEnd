const JWT = require('jsonwebtoken');

const User = require('../models/users')
const CONFIG = require("../config");

const register = (req, res) => {
	if (req.body && req.body.username && req.body.password && req.body.email) {
		var newUser = new User({
			username: req.body.username,
			password: req.body.password,
			email: req.body.email
		})

		newUser.save((err, result) => {
			if (err) {
				console.log(err);
				res.sendStatus(409);
			} else {
				res.status(200).json({message: "Registered with success"})
			}
		})
	} else {
		res.status(422).json({message: "Please provide all data for register process"})
	}
}

const login = (req, res) => {
	if (req.body && req.body.username && req.body.password) {
		User.findOne({
			username: req.body.username,
			password: req.body.password
		})
		.then(result => {
			if (result == null) {
				res.status(401).json({message: "Wrong combination"})
			} else {
				var TOKEN = JWT.sign({
					username: req.body.username,
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

module.exports = {
	register,
	login
}