const express = require('express');
const UserController = require('../controller/users');
const authGuard = require('../middleware/authGuard');
const AuthController = require("../controller/authController");
const router = express.Router();

const userController = new UserController();

router.post('/register', AuthController.register);               
router.post('/login', userController.login.bind(userController));
router.get('/profile', authGuard, userController.profile.bind(userController));
router.post('/change-password', authGuard, userController.changePassword.bind(userController));
router.post('/verify-email', AuthController.verifyEmail); // OTP verification
router.get('/', userController.getAllUsers.bind(userController));
router.delete('/:id', authGuard, userController.deleteUser.bind(userController));
router.put(
  '/:id',
  authGuard,
  userController.updateUser.bind(userController)
);


module.exports = router;
