import express from  'express'
import * as articleControl from '../controllers/articleController'
import * as authController from '../controllers/authController'

const articleRouter = express.Router();

articleRouter
.route("/")
.post(authController.protect,articleControl.createArticle)
.get(authController.protect, articleControl.getAllArticles);

articleRouter
.route("/:id")
.get(authController.protect,articleControl.getArticle)
.delete(authController.protect,authController.restrictTo('admin','super-admin'),articleControl.deleteArticle)
.patch(authController.protect,articleControl.updateArticle);

export default articleRouter;