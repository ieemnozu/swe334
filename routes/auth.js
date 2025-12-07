const express = require('express');
const UserController = require('../controller/users');
const authGuard = require('../middleware/authGuard');
const AuthController = require("../controller/authController");
const router = express.Router();

const userController = new UserController();

router.post('/register', AuthController.register);               // NEW REGISTER
router.post('/login', userController.login.bind(userController));
router.get('/profile', authGuard, userController.profile.bind(userController));
router.post('/change-password', authGuard, userController.changePassword.bind(userController));
router.get('/verify-email', AuthController.verifyEmail);
router.get('/', userController.getAllUsers.bind(userController));

module.exports = router;
