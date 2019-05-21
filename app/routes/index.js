const express = require('express');

const CONTROLLER = require('../controller/index')

const router = express.Router();

router.get('/healthcheck', (req, res) => {
	res.status(200).json({message: "Server is alive"})
})

router.post("/register", CONTROLLER.register);
router.post("/login", CONTROLLER.login);

module.exports = router;