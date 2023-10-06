import express from  'express'
import * as userController from '../controllers/userController'
import * as authController from '../controllers/authController'

const router = express.Router();

router.post('/signup',authController.signUp)
router.post('/login',authController.login)

router.post('/forgotPassword',authController.forgotPassword)
router.patch('/resetPassword/:token',authController.resetPassword)

router.patch('/updatePassword',authController.protect,authController.updatePassword)

router.patch('/updateMe',authController.protect, userController.updateMe)

router.delete('/deleteMe',authController.protect, userController.deleteMe)

router
.route('/')
.get(authController.protect,userController.getAllUsers)
.post(authController.protect,authController.restrictTo('admin','super-admin'),userController.createUser);

router
.route('/:id')
.get(authController.protect,authController.restrictTo('admin','super-admin'),userController.getUser)
.delete(authController.protect,authController.restrictTo('admin','super-admin'),userController.deleteUser)
.patch(authController.protect,authController.restrictTo('admin','super-admin'),userController.updateUser);

export default router;