const express = require("express");
const router = express.Router();
const userController  = require("../controllers/userController");
const passport = require("passport");

router.get("/signup", userController.renderSignup);
router.post("/signup", userController.signup);

router.get("/signin", userController.renderSignin);
router.post("/signin", passport.authenticate('local', { failureRedirect: '/users/signin', failureFlash: false }), userController.signin);

router.get("/logout", userController.logout);

module.exports = router;