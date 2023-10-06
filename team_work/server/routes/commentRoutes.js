import express from 'express';
import * as commentController from '../controllers/commentController';
import * as authController from '../controllers/authController'

const router = express.Router()

router
.route('/')
.get(authController.protect,authController.protect,commentController.getAllComment);

router
.route('/:id')
.post(authController.protect,commentController.createComment)
.get(authController.protect,commentController.getComment)
.patch(authController.protect,commentController.updateComment)
.delete(authController.protect,commentController.deleteComment);

export default router;