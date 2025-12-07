const express = require('express');
const authGuard = require('../middleware/authGuard');
const UserController = require('../controller/users'); 

const router = express.Router();
const userController = new UserController(); // ✅ create instance

// Registration and login (public)
router.post('/register', userController.register.bind(userController));
router.post('/login', userController.login.bind(userController));

// Profile (protected)
router.get('/profile', authGuard, userController.profile.bind(userController));
// Change password (protected)
router.post('/change-password', authGuard, userController.changePassword.bind(userController));
router.get('/', userController.getAllUsers.bind(userController));


module.exports = router;
