const express = require('express');
const UserController = require('../controller/users');
const authGuard = require('../middleware/authGuard');
const router = express.Router();

const userController = new UserController(); // create an instance

router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));
router.get('/profile', authGuard, userController.profile.bind(userController));
router.post('/change-password', authGuard, userController.changePassword.bind(userController));

module.exports = router;
